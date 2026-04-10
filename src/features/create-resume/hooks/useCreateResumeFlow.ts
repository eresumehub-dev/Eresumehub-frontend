import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createResume, pollJobStatus } from '../../../services/resume';
import { useUserProfileQuery } from '../../../hooks/queries/useUserProfileQuery';
import { trackEvent } from '../../../services/event_tracking';
import { ComplianceWarning, evaluateMarketRules } from '../../../utils/compliance_check';

const LS_KEY = 'eresume_form_draft_v2';

export const useCreateResumeFlow = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    // 1. Server State
    const { data: profileData, isLoading: loadingProfile } = useUserProfileQuery();
    const profile = profileData?.profile || null;

    const [isGenerating, setIsGenerating] = useState(false);
    const [cooldown] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [generationStep, setGenerationStep] = useState<string>('');
    const [generationProgress, setGenerationProgress] = useState(0);

    // 2. Drafts
    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem(LS_KEY);
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        return {
            jobTitle: '',
            jobDescription: '',
            country: '',
            language: 'English',
            template: 'executive'
        };
    });

    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(formData));
    }, [formData]);

    // 3. Mutation
    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            trackEvent('generation_started', { title: payload.title });
            console.log("🚀 [v16.4.17] SENDING_PAYLOAD:", payload);

            const response = await createResume(payload);
            if (response?.job_id) {
                await pollJobStatus(response.job_id, (progress, step) => {
                    setGenerationProgress(progress);
                    setGenerationStep(step);
                });
            }
            return response;
        },
        onSuccess: () => {
            trackEvent('generation_succeeded');
            localStorage.removeItem(LS_KEY); 
            queryClient.invalidateQueries({ queryKey: ['resumes'] });
        },
        onError: (err: any) => {
            trackEvent('generation_failed', { error: err.message });
            const status = err.response?.status;
            const responseData = err.response?.data;
            const detail = responseData?.detail;

            if (status === 422) {
                const msg = typeof detail === 'string' ? detail : (detail?.message || 'Required profile information is missing.');
                setError(msg);
            } else {
                setError(detail?.message || err.message || 'Generation failed.');
            }
            setIsGenerating(false);
        }
    });

    const [complianceWarnings, setComplianceWarnings] = useState<ComplianceWarning[]>([]);

    const handleGenerate = async (schema: any = null, override: any = {}) => {
        if (!profile || loadingProfile) return;
        if (isGenerating || cooldown > 0) return;

        // Synchronize with the latest warnings for UI feedback
        const warnings = evaluateMarketRules(profile, schema);
        setComplianceWarnings(warnings);
        
        setIsGenerating(true);
        setError(null);
        setGenerationStep('Architecting your resume...');
        setGenerationProgress(5);

        const p = profile!; 
        const userData = {
            full_name: p.full_name || 'Guest User',
            headline: (p as any).headline || '',
            date_of_birth: p.date_of_birth || null,
            nationality: p.nationality || null,
            contact: {
                email: p.email || '',
                phone: p.phone || '',
                linkedin: p.linkedin_url || '',
                city: p.city || '',
                country: p.country || ''
            },
            summary: p.professional_summary || '',
            skills: p.skills || [],
            experience: (p.work_experiences || []).map((exp: any) => ({
                title: exp.job_title || 'Position',
                company: exp.company || 'Company',
                city: exp.location || '',
                start_date: exp.start_date || '2000-01-01',
                end_date: exp.end_date || null,
                description: Array.isArray(exp.achievements) ? exp.achievements.join('\n') : (exp.achievements || '')
            })),
            education: (p.educations || []).map((edu: any) => ({
                degree: edu.degree || 'Degree',
                institution: edu.institution || 'University',
                city: edu.location || '',
                graduation_date: edu.graduation_date || ''
            })),
            projects: (p.projects || []).map((proj: any) => ({
                title: proj.title || 'Personal Project',
                role: proj.role || '',
                link: proj.link || '',
                description: proj.description || '',
                technologies: Array.isArray(proj.technologies) ? proj.technologies : []
            })),
            languages: (p.languages || []).map((l: any) => {
                const name = typeof l === 'string' ? l : (l.name || l.language || '');
                const level = typeof l === 'string' ? 'Native' : (l.level || l.proficiency_cefr || 'Native');
                return { language: name, proficiency_cefr: level };
            }),
            certifications: (p.certifications || []).map((c: any) => typeof c === 'string' ? c : (c.name || c.title || c)),
            profile_pic_url: p.photo_url || ''
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
                ignore_compliance: true, // [BYPASS ENABLED] (v16.4.17)
                ...override
            });

            if (result.success) {
                setGenerationProgress(100);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            }
        } catch (err) {
            setIsGenerating(false);
        }
    };

    return {
        formData, setFormData,
        profile, loadingProfile,
        isGenerating, generationStep, generationProgress,
        cooldown, error, setError,
        complianceWarnings,
        handleGenerate
    };
};
