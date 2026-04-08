import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createResume, pollJobStatus } from '../../../services/resume';
import { useUserProfileQuery } from '../../../hooks/queries/useUserProfileQuery';
import { trackEvent } from '../../../services/event_tracking';
import { ComplianceWarning } from '../../../utils/compliance_check';

export const useCreateResumeFlow = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    // 1. Server State (TanStack Query)
    const { data: profileData, isLoading: loadingProfile } = useUserProfileQuery();
    const profile = profileData?.profile || null;

    const [isGenerating, setIsGenerating] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [generationStep, setGenerationStep] = useState<string>('');
    const [generationProgress, setGenerationProgress] = useState(0);

    const [formData, setFormData] = useState({
        jobTitle: '',
        jobDescription: '',
        country: 'Germany',
        language: 'English',
        template: 'executive'
    });

    // Sync country from profile when loaded
    useEffect(() => {
        if (profile?.country) {
            setFormData(prev => ({ ...prev, country: profile.country! }));
        }
    }, [profile]);

    // 2. Cooldown Timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown(c => c - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    // 3. Generation Mutation
    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            trackEvent('generation_started', { title: payload.title });
            const response = await createResume(payload);
            if (response?.job_id) {
                await pollJobStatus(response.job_id, (progress, step) => {
                    setGenerationProgress(progress);
                    setGenerationStep(step);
                    if (progress >= 80) trackEvent('readiness_threshold_hit', { step });
                });
            }
            return response;
        },
        onSuccess: () => {
            trackEvent('generation_succeeded');
            // CRITICAL: Invalidate resumes so Dashboard shows the new one instantly
            queryClient.invalidateQueries({ queryKey: ['resumes'] });
            navigate('/dashboard');
        },
        onError: (err: any) => {
            trackEvent('generation_failed', { error: err.message });
            const status = err.response?.status;
            const detail = err.response?.data?.detail;
            if (status === 429) {
                setCooldown(30);
                setError('Wait 30 seconds.');
            } else if (status === 503) {
                setError('AI service busy. Try again.');
            } else {
                setError(detail?.message || err.message || 'Generation failed.');
            }
            setIsGenerating(false);
        }
    });

    const [showComplianceWarning, setShowComplianceWarning] = useState(false);

    const handleGenerate = async (_activeWarnings: any[] = [], override: any = {}) => {
        // 🧪 DEBUG: v3.2.0 Hardened Generation Entry
        console.warn("🚨 handleGenerate triggered (v3.2.0 Hardened)", {
             profileExists: !!profile,
             loadingProfile,
             country: formData.country,
             ignoreCompliance: !!override.ignoreCompliance
        });

        // 1. HARD GUARD: Profile Must Exist
        if (!profile || loadingProfile) {
            console.error("❌ Profile missing or loading. Blocking generation.");
            setError("Profile data is still synchronizing. Please wait a moment.");
            return;
        }

        if (isGenerating || cooldown > 0) return;

        // 2. COMPLIANCE GATE
        // We rely on _activeWarnings passed from the UI layer, which now evaluates dynamic schemas asynchronously.
        // The UI guarantees that 'isEvaluatingRules' is false before this button is clickable.
        const errorWarnings = _activeWarnings.filter((w: ComplianceWarning) => w.type === 'error');
        
        console.log("ALL ACTIVE WARNINGS:", _activeWarnings);
        console.log("ERROR WARNINGS:", errorWarnings);

        if (errorWarnings.length > 0 && !override.ignoreCompliance) {
            console.warn(`[useCreateResumeFlow] 🛑 Compliance barrier triggered via Synchronous Gate.`);
            setShowComplianceWarning(true);
            return;
        }
        
        setShowComplianceWarning(false);
        setIsGenerating(true);
        setError(null);
        setGenerationStep('Initializing...');
        setGenerationProgress(5);

        // 1. Sanitization Helper: Strip DB internal metadata
        const sanitize = (items?: any[]) => (items || []).map(({ 
            id, profile_id, user_id, created_at, updated_at, display_order, ...rest 
        }: any) => rest);

        // 2. Map user data - Aligning with backend 'UserData' schema
        const p = profile!; 
        const userData = {
            full_name: p.full_name,
            date_of_birth: p.date_of_birth,
            nationality: p.nationality,
            contact: {
                email: p.email,
                phone: p.phone,
                linkedin: p.linkedin_url,
                city: p.city
            },
            summary: p.professional_summary,
            skills: p.skills || [],
            experience: sanitize(p.work_experiences),
            education: sanitize(p.educations),
            projects: sanitize(p.projects),
            languages: (p.languages || []).map((l: any) => {
                const name = typeof l === 'string' ? l : (l.name || l.language || '');
                const level = typeof l === 'string' ? 'Native' : (l.level || l.proficiency_cefr || 'Native');
                return { language: name, proficiency_cefr: level };
            }),
            certifications: (p.certifications || []).map((c: any) => typeof c === 'string' ? c : (c.name || c.title || c)),
            profile_pic_url: p.photo_url
        };

        try {
            const result = await mutation.mutateAsync({
                title: formData.jobTitle,
                country: formData.country,
                language: formData.language,
                template_style: formData.template,
                user_data: userData,
                job_description: formData.jobDescription,
                job_title: formData.jobTitle,
                ignoreCompliance: !!override.ignoreCompliance,
                ...override
            });

            if (result.success) {
                setGenerationProgress(100);
                setTimeout(() => {
                    // Force casting since backend returns top-level ID
                    const resumeId = (result as any).id;
                    if (resumeId) {
                        navigate(`/resume/edit/${resumeId}`);
                    } else {
                        navigate('/dashboard');
                    }
                }, 800);
            }
        } catch (err: any) {
            console.error("🚨 Generation Failed:", err);
            
            // Phase 4: Backend Enforcement Interceptor
            const responseData = err?.response?.data;
            if (err?.response?.status === 422 && responseData?.status === 'requires_user_action') {
                console.warn("⚠️ Backend requested compliance action. Re-triggering modal.");
                setShowComplianceWarning(true);
                setIsGenerating(false);
                return;
            }

            setError(responseData?.message || err.message || "An unexpected error occurred during generation.");
            setIsGenerating(false);
        }
    };

    return {
        formData, setFormData,
        profile, loadingProfile,
        isGenerating, generationStep, generationProgress,
        cooldown, error, setError,
        showComplianceWarning, setShowComplianceWarning,
        handleGenerate
    };
};
