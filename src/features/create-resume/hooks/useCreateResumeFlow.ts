import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createResume, pollJobStatus } from '../../../services/resume';
import { useUserProfileQuery } from '../../../hooks/queries/useUserProfileQuery';
import { trackEvent } from '../../../services/event_tracking';
import { checkMarketCompliance, ComplianceWarning } from '../../../utils/compliance_check';

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

        // 2. SYNCHRONOUS COMPLIANCE GATE (v3.2.0)
        // We re-calculate warnings from fresh profile data to avoid race conditions with UI state.
        const freshWarnings = checkMarketCompliance(profile, formData.country);
        const errorWarnings = freshWarnings.filter((w: ComplianceWarning) => w.type === 'error');
        
        console.log("ALL FRESH WARNINGS:", freshWarnings);
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

        // 1. Sanitization Helper: Strip DB internal metadata to reduce payload bloat
        // Uses optional parameter to ensure TS compliance (v7.1.0)
        const sanitize = (items?: any[]) => (items || []).map(({ 
            id, profile_id, user_id, created_at, updated_at, display_order, ...rest 
        }: any) => rest);

        // 2. Map user data - Aligning with backend 'UserData' schema (v7.1.0)
        const userData = {
            full_name: profile.full_name,
            date_of_birth: profile.date_of_birth,
            nationality: profile.nationality,
            contact: {
                email: profile.email,
                phone: profile.phone,
                linkedin: profile.linkedin_url,
                city: profile.city
            },
            summary: profile.professional_summary,
            skills: profile.skills || [],
            experience: sanitize(profile.work_experiences),
            education: sanitize(profile.educations),
            projects: sanitize(profile.projects),
            languages: (profile.languages || []).map((l: any) => {
                const name = typeof l === 'string' ? l : l.name;
                const level = typeof l === 'string' ? 'Native' : (l.level || l.proficiency_cefr || 'Native');
                return { language: name, proficiency_cefr: level };
            }),
            certifications: (profile.certifications || []).map((c: any) => typeof c === 'string' ? c : c.name),
            profile_pic_url: profile.photo_url
        };

        mutation.mutate({
            title: formData.jobTitle,
            country: formData.country,
            language: formData.language,
            template_style: formData.template,
            user_data: userData,
            job_description: formData.jobDescription,
            job_title: formData.jobTitle,
            ...override
        });
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
