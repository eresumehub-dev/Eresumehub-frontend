import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Loader2, 
    AlertCircle, 
    X, 
    CheckCircle2 
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// --- FEATURE COMPONENTS ---
import ReadinessHub from './components/ReadinessHub';
import FormSections from './components/FormSections';

// --- FEATURE HOOKS ---
import { useCreateResumeFlow } from './hooks/useCreateResumeFlow';
import { useReadinessScore } from './hooks/useReadinessScore';
// --- SERVICES ---
import { getAvailableCountries } from '../../services/schema';

const CreateResumePage: React.FC = () => {
    const navigate = useNavigate();
    const [availableCountries, setAvailableCountries] = useState<string[]>(['Germany', 'India', 'Japan']);
    
    // 1. Business Logic State
    const {
        formData, setFormData,
        profile, loadingProfile,
        isGenerating, generationStep, generationProgress,
        error, setError,
        handleGenerate
    } = useCreateResumeFlow();

    const {
        readinessScore, interpretation, warnings, isEvaluatingRules, schema
    } = useReadinessScore(
        profile, formData.jobTitle, formData.jobDescription, formData.country, new Set()
    );

    // 2. Initial Setup
    useEffect(() => {
        getAvailableCountries().then(setAvailableCountries);
        
        // Inject IBM Plex Sans
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => { if (document.head.contains(link)) document.head.removeChild(link); };
    }, []);

    // 3. Animation Variants
    const fadeUpVariant = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    if (loadingProfile) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#F5F5F7]" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    <Loader2 className="w-8 h-8 animate-spin text-[#1D1D1F] mb-6" strokeWidth={1.5} />
                    <p className="text-xs font-semibold text-[#86868B] tracking-[0.2em] uppercase">Architecting Workspace</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-[#F5F5F7] flex flex-col overflow-hidden antialiased text-[#1D1D1F]" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            
            {/* 1. Ultra-Minimal Top Navigation (Redesigned matching snippet) */}
            <nav className="h-[72px] flex items-center justify-between px-6 md:px-10 flex-shrink-0 z-50 bg-white/70 backdrop-blur-xl border-b border-black/[0.04]">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-[14px] font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2} />
                        Dashboard
                    </button>
                    <div className="h-4 w-[1px] bg-[#E5E5EA]" />
                    <h1 className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight">
                        Resume Architect
                    </h1>
                </div>

                <div className="flex items-center gap-3 bg-[#F5F5F7] px-3.5 py-1.5 rounded-full border border-black/[0.03]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" strokeWidth={2.5}/>
                    <span className="text-[12px] font-semibold text-[#1D1D1F] tracking-wide">
                        Draft Saved
                    </span>
                </div>
            </nav>

            {/* 2. Main Workspace */}
            <div className="flex-1 flex justify-center overflow-hidden w-full">
                
                {/* Left: Interactive Form Canvas */}
                <main className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-20 py-12 custom-scrollbar scroll-smooth">
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariant}
                        className="max-w-2xl mx-auto"
                    >
                        {/* Typography */}
                        <div className="mb-14 mt-4">
                            <h2 className="text-[2.75rem] font-medium text-[#1D1D1F] tracking-tight leading-[1.1] mb-5">
                                Define your target.
                            </h2>
                            <p className="text-[1.125rem] text-[#86868B] leading-relaxed font-light max-w-xl">
                                Precision matters. Detail the exact role and location, and our engine will perfectly align your profile to the requirements.
                            </p>
                        </div>

                        {/* Error Feedback */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                    className="mb-10 overflow-hidden"
                                >
                                    <div className="p-4 bg-[#FFF0F0] rounded-2xl flex items-start justify-between gap-4 border border-[#FF3B30]/10">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 text-[#FF3B30] shrink-0" strokeWidth={2} />
                                            <p className="text-[15px] font-medium text-[#FF3B30]">{error}</p>
                                        </div>
                                        <button onClick={() => setError(null)} className="p-1 hover:bg-[#FF3B30]/10 rounded-full transition-colors">
                                            <X className="w-4 h-4 text-[#FF3B30]" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form Context (Refactoring FormSections to match style internally) */}
                        <div className="pb-8 bg-white p-8 md:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02] mb-32 lg:mb-12">
                            <FormSections
                                formData={formData}
                                setFormData={setFormData}
                                countries={availableCountries}
                            />
                        </div>
                    </motion.div>
                </main>

                {/* Right: Helpful Guidance Sidebar (Refactoring ReadinessHub to match style) */}
                <div className="hidden lg:block w-[400px] xl:w-[480px] bg-[#F5F5F7] border-l border-black/[0.04] z-10">
                    <ReadinessHub
                        score={readinessScore}
                        interpretation={interpretation}
                        warnings={warnings}
                        isGenerating={isGenerating}
                        generationStep={generationStep}
                        generationProgress={generationProgress}
                        onGenerate={() => handleGenerate(schema)}
                        canGenerate={formData.jobTitle.trim().length > 2 && formData.country !== '' && !loadingProfile}
                        isEvaluatingRules={isEvaluatingRules}
                    />
                </div>
            </div>

            {/* Floating Action Button (Mobile/Tablet) */}
            <div className="lg:hidden fixed bottom-8 left-0 right-0 px-6 z-[60] pointer-events-none">
                <div className="max-w-md mx-auto pointer-events-auto">
                    <button
                        disabled={isGenerating || !formData.jobTitle.trim() || !formData.country || loadingProfile}
                        onClick={() => handleGenerate(schema)}
                        className={`
                            w-full py-4 rounded-[1.25rem] font-medium text-[17px] tracking-wide transition-all duration-300
                            backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex justify-center items-center gap-2
                            ${(isGenerating || !formData.jobTitle.trim() || !formData.country || loadingProfile)
                                ? 'bg-white/80 text-[#86868B] cursor-not-allowed border border-white/40'
                                : 'bg-[#1D1D1F]/90 text-white hover:bg-black active:scale-[0.98] border border-white/10'
                            }
                        `}
                    >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        {isGenerating ? 'Engineering Resume...' : 'Generate Perfect Resume'}
                    </button>
                </div>
            </div>
            
            {/* Global styles for custom scrollbar */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #E5E5EA;
                    border-radius: 10px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: #C7C7CC;
                }
            `}} />
        </div>
    );
};

export default CreateResumePage;
