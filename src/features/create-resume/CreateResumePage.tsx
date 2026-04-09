import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, X } from 'lucide-react';
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

    useEffect(() => {
        getAvailableCountries().then(setAvailableCountries);
    }, []);

    if (loadingProfile) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-slate-200 mb-4" />
                <p className="text-sm font-medium text-slate-400">Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-white flex flex-col overflow-hidden font-sans antialiased text-slate-600">
            {/* 1. Simple, Clean Top Nav */}
            <nav className="h-16 flex items-center justify-between px-8 flex-shrink-0 z-50">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Dashboard
                    </button>
                    <div className="h-4 w-[1px] bg-slate-100" />
                    <h1 className="text-sm font-semibold text-slate-900">
                        Create Your Resume
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-slate-400">
                        Draft saved automatically
                    </span>
                </div>
            </nav>

            {/* 2. Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* Left: Interactive Form */}
                <main className="flex-1 overflow-y-auto px-8 md:px-12 lg:px-20 py-12 custom-scrollbar">
                    <div className="max-w-2xl mx-auto">
                        
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
                                Start with the basics
                            </h2>
                            <p className="text-lg text-slate-500 leading-relaxed font-normal">
                                Our AI will help you tailor your resume to perfection. Tell us about the job you want, and we'll handle the rest.
                            </p>
                        </div>

                        {/* Error Feedback */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start justify-between gap-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                        <p className="text-sm font-medium text-red-800">{error}</p>
                                    </div>
                                    <button onClick={() => setError(null)}>
                                        <X className="w-4 h-4 text-red-400 hover:text-red-900 transition-colors" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pb-24">
                            <FormSections
                                currentStep={0}
                                formData={formData}
                                setFormData={setFormData}
                                countries={availableCountries}
                            />
                        </div>
                    </div>
                </main>

                {/* Right: Helpful Guidance Sidebar */}
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

            {/* Progress Pill for Mobile */}
            <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-sm">
                <button
                    disabled={isGenerating || isEvaluatingRules || !formData.jobTitle.trim() || !formData.country || loadingProfile}
                    onClick={() => handleGenerate(schema)}
                    className={`
                        w-full py-4 rounded-2xl font-bold text-base shadow-2xl transition-all
                        ${(isGenerating || loadingProfile || isEvaluatingRules || !formData.jobTitle.trim() || !formData.country)
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-slate-900 text-white active:scale-[0.98]'
                        }
                    `}
                >
                    {isEvaluatingRules ? 'Checking requirements...' : isGenerating ? 'Generating...' : 'Create My Resume'}
                </button>
            </div>
        </div>
    );
};

export default CreateResumePage;
