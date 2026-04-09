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
import { ComplianceWarning } from '../../utils/compliance_check';
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
        showComplianceWarning,
        complianceWarnings,
        handleGenerate
    } = useCreateResumeFlow();

    const {
        readinessScore, projectedAtsScore, interpretation, warnings, isEvaluatingRules, schema
    } = useReadinessScore(
        profile, formData.jobTitle, formData.jobDescription, formData.country, new Set()
    );

    useEffect(() => {
        getAvailableCountries().then(setAvailableCountries);
    }, []);

    if (loadingProfile) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#F1F5F9]">
                <div className="w-12 h-12 rounded-lg bg-[#0F172A] flex items-center justify-center shadow-lg mb-4">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Initializing Environment</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-[#F8FAFC] flex flex-col overflow-hidden font-sans antialiased text-slate-900">
            {/* 1. Slim Top Navigation Bar (High Density) */}
            <nav className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-50">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest group"
                    >
                        <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
                        Back
                    </button>
                    <div className="h-4 w-[1px] bg-slate-200" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0A2A6B]">
                        Intelligence Builder <span className="text-slate-300">v16.4</span>
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700">Real-time Analysis Active</span>
                    </div>
                </div>
            </nav>

            {/* 2. Main High-Precision Workspace */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* Left: Input Console */}
                <main className="flex-1 overflow-y-auto px-8 py-8 md:px-12 lg:px-16 custom-scrollbar bg-white">
                    <div className="max-w-3xl mx-auto">
                        
                        <div className="mb-8 border-b border-slate-100 pb-6">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                                Resume Configuration
                            </h1>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-lg">
                                Define your target parameters below. Our neural engine will architect your 
                                professional narrative to exceed {formData.country || 'market'} regional standards.
                            </p>
                        </div>

                        {/* Error Interface */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="mb-6 flex items-center justify-between gap-4 p-3 bg-red-50 border border-red-100 rounded items-center"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                        <p className="text-[11px] font-bold text-red-700 uppercase tracking-wide">{error}</p>
                                    </div>
                                    <button onClick={() => setError(null)}>
                                        <X className="w-3.5 h-3.5 text-red-400 hover:text-red-600 transition-colors" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pb-12">
                            <FormSections
                                currentStep={0}
                                formData={formData}
                                setFormData={setFormData}
                                countries={availableCountries}
                            />
                        </div>
                    </div>
                </main>

                {/* Right: Readiness Sidebar */}
                <ReadinessHub
                    score={readinessScore}
                    atsScore={projectedAtsScore}
                    interpretation={interpretation}
                    warnings={warnings}
                    isGenerating={isGenerating}
                    generationStep={generationStep}
                    generationProgress={generationProgress}
                    onGenerate={() => handleGenerate(schema)}
                    canGenerate={formData.jobTitle.trim().length > 3 && formData.country !== '' && !loadingProfile}
                    isEvaluatingRules={isEvaluatingRules}
                />
            </div>

            {/* Float Bottom Navigation for Mobile */}
            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[60]">
                <button
                    disabled={isGenerating || isEvaluatingRules || !formData.jobTitle.trim() || !formData.country || loadingProfile}
                    onClick={() => handleGenerate(schema)}
                    className={`
                        w-full py-4 rounded font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all
                        ${(isGenerating || loadingProfile || isEvaluatingRules || !formData.jobTitle.trim() || !formData.country)
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-[#0A2A6B] text-white active:scale-[0.98]'
                        }
                    `}
                >
                    {isEvaluatingRules ? 'Evaluating Rules...' : isGenerating ? (generationStep || 'Generating...') : 'Initiate Generation'}
                </button>
            </div>

            {/* Professional Compliance Interceptor */}
            <AnimatePresence>
                {showComplianceWarning && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white border border-slate-200 shadow-2xl rounded-sm max-w-lg w-full overflow-hidden"
                        >
                            <div className="h-1 bg-amber-500" />
                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
                                        Compliance Delta Detected
                                    </h2>
                                </div>

                                <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
                                    The following data points are required for <strong className="text-slate-800">{formData.country}</strong> market alignment. Failure to include these may result in immediate ATS disqualification.
                                </p>

                                <div className="space-y-2 mb-8 border-l border-amber-100 pl-4">
                                    {complianceWarnings.map((w: ComplianceWarning) => (
                                        <div key={w.id}>
                                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{w.title}</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">{w.message}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="w-full py-3 bg-[#0A2A6B] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-colors"
                                    >
                                        Sync Profile Data
                                    </button>
                                    <button
                                        onClick={() => handleGenerate(schema, { ignoreCompliance: true })}
                                        className="w-full py-3 text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
                                    >
                                        Bypass & Proceed
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CreateResumePage;
