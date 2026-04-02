import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createResume, pollJobStatus } from '../../../services/resume';
import { getProfile, UserProfile } from '../../../services/profile';

export const useCreateResumeFlow = () => {
    const navigate = useNavigate();
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
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

    // 1. Fetch Profile
    useEffect(() => {
        let mounted = true;
        const fetchProfile = async () => {
            try {
                const { profile: fetchedProfile, exists } = await getProfile();
                if (!mounted) return;
                if (!exists || !fetchedProfile || !fetchedProfile.full_name) {
                    navigate('/profile', { state: { message: 'Complete your profile first.' } });
                    return;
                }
                setProfile(fetchedProfile);
                if (fetchedProfile.country) setFormData(prev => ({ ...prev, country: fetchedProfile.country! }));
            } catch (err) {
                if (mounted) setError('Failed to synchronize profile.');
            } finally {
                if (mounted) setLoadingProfile(false);
            }
        };
        fetchProfile();
        return () => { mounted = false; };
    }, [navigate]);

    // 2. Cooldown Timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown(c => c - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    // 3. Handle Generate
    const handleGenerate = async (override: any = {}) => {
        if (isGenerating || cooldown > 0 || !profile) return;
        
        setIsGenerating(true);
        setError(null);
        setGenerationStep('Initializing...');
        setGenerationProgress(5);

        try {
            // Robust Mapping (moved from component for clarity)
            const userData = {
                full_name: profile.full_name,
                contact: {
                    email: profile.email,
                    phone: profile.phone,
                    linkedin: profile.linkedin_url,
                    city: profile.city
                },
                professional_summary: profile.professional_summary,
                skills: profile.skills || [],
                work_experiences: profile.work_experiences || [],
                educations: profile.educations || [],
                languages: (profile.languages || []).map((l: any) => {
                    const name = typeof l === 'string' ? l : l.name;
                    const level = typeof l === 'string' ? 'Native' : (l.level || l.proficiency_cefr || 'Native');
                    return { language: name, proficiency_cefr: level };
                }),
                certifications: profile.certifications || [],
                profile_pic_url: profile.photo_url
            };

            const response = await createResume({
                title: formData.jobTitle,
                country: formData.country,
                language: formData.language,
                template_style: formData.template,
                user_data: userData,
                job_description: formData.jobDescription,
                job_title: formData.jobTitle,
                ...override
            });

            if (response?.job_id) {
                // Poll with progress updates
                await pollJobStatus(response.job_id, (progress, step) => {
                    setGenerationProgress(progress);
                    setGenerationStep(step);
                });
                navigate('/dashboard');
            } else if (response?.data?.id) {
                navigate('/dashboard');
            }
        } catch (err: any) {
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
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        formData, setFormData,
        profile, loadingProfile,
        isGenerating, generationStep, generationProgress,
        cooldown, error, setError,
        handleGenerate
    };
};
