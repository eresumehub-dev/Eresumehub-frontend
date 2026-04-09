import React, { useState, useEffect } from 'react';
import { 
    Loader2, 
    AlertCircle, 
    X 
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
            
            {/* 1. Main Workspace (Header removed as requested) */}
            <div className="flex-1 flex justify-center overflow-hidden w-full">
                
                {/* Left: Interactive Form Canvas (Scroll bar removed, fitting enhanced) */}
                <main className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-20 py-8 scroll-smooth">
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={fadeUpVariant}
                        className="max-w-2xl mx-auto"
                    >
                        {/* Typography */}
                        <div className="mb-8 mt-2">
                            <h2 className="text-[2.5rem] font-medium text-[#1D1D1F] tracking-tight leading-[1.1] mb-4">
                                Define your target.
                            </h2>
                            <p className="text-[1rem] text-[#86868B] leading-relaxed font-light max-w-xl">
                                Detail the exact role and location, and our engine will perfectly align your profile.
                            </p>
                        </div>

                        {/* Error Feedback */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                    className="mb-6 overflow-hidden"
                                >
                                    <div className="p-4 bg-[#FFF0F0] rounded-2xl flex items-start justify-between gap-4 border border-[#FF3B30]/10">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 text-[#FF3B30] shrink-0" strokeWidth={2} />
                                            <p className="text-[14px] font-medium text-[#FF3B30]">{error}</p>
                                        </div>
                                        <button onClick={() => setError(null)} className="p-1 hover:bg-[#FF3B30]/10 rounded-full transition-colors">
                                            <X className="w-4 h-4 text-[#FF3B30]" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form Context */}
                        <div className="pb-8 bg-white p-6 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-black/[0.01] mb-12">
                            <FormSections
                                formData={formData}
                                setFormData={setFormData}
                                countries={availableCountries}
                            />
                        </div>
                    </motion.div>
                </main>

                {/* Right: Helpful Guidance Sidebar */}
                <div className="hidden lg:block w-[380px] xl:w-[440px] bg-[#F5F5F7] border-l border-black/[0.03] z-10">
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

            {/* Mobile Action Button */}
            <div className="lg:hidden fixed bottom-6 left-0 right-0 px-6 z-[60] pointer-events-none">
                <div className="max-w-md mx-auto pointer-events-auto">
                    <button
                        disabled={isGenerating || !formData.jobTitle.trim() || !formData.country || loadingProfile}
                        onClick={() => handleGenerate(schema)}
                        className={`
                            w-full py-4 rounded-[1.25rem] font-medium text-[16px] tracking-wide transition-all duration-300
                            backdrop-blur-xl shadow-xl flex justify-center items-center gap-2
                            ${(isGenerating || !formData.jobTitle.trim() || !formData.country || loadingProfile)
                                ? 'bg-white/80 text-[#86868B] cursor-not-allowed border border-white/40'
                                : 'bg-[#1D1D1F] text-white hover:bg-black active:scale-[0.98]'
                            }
                        `}
                    >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        {isGenerating ? 'Engineering...' : 'Generate Perfect Resume'}
                    </button>
                </div>
            </div>
            
        </div>
    );
};

export default CreateResumePage;
