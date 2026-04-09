import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Sparkles, X } from 'lucide-react';
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
                <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-[#0A2A6B] flex items-center justify-center shadow-lg shadow-[#0A2A6B]/20 mb-6">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-[#4DCFFF]/30 to-[#A855F7]/30 rounded-3xl blur-lg animate-pulse" />
                </div>
                <p className="text-sm font-semibold text-slate-500 mt-4">Synchronizing your profile...</p>
                <p className="text-xs text-slate-400 mt-1">This only takes a moment</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
            {/* ─── Header ─── */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm shadow-slate-100/50">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-[#0A2A6B] transition-all group"
                    >
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-[#0A2A6B]/10 transition-colors">
                            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                        </div>
                        Dashboard
                    </Link>

                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                            AI Engine Active
                        </span>
                    </div>

                    <div className="w-[100px]" />
                </div>
            </header>

            {/* ─── Main Layout ─── */}
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-65px)]">

                {/* ─── Left: Form ─── */}
                <main className="flex-1 px-6 py-10 md:px-12 lg:py-14 overflow-y-auto">

                    {/* Page Hero */}
                    <div className="max-w-2xl mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0A2A6B]/5 border border-[#0A2A6B]/10 rounded-full mb-5">
                            <Sparkles className="w-3.5 h-3.5 text-[#0A2A6B]" />
                            <span className="text-[11px] font-bold text-[#0A2A6B] uppercase tracking-widest">
                                AI-Powered Resume Builder
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">
                            Create Your <br />
                            <span className="bg-gradient-to-r from-[#0A2A6B] via-[#4DCFFF] to-[#A855F7] bg-clip-text text-transparent">
                                Perfect Resume
                            </span>
                        </h1>
                        <p className="text-base text-slate-500 font-medium leading-relaxed">
                            Fill in the details below. Our AI engine will tailor your resume to
                            {formData.country ? <strong className="text-slate-700"> {formData.country}</strong> : ' your target market'} standards automatically.
                        </p>
                    </div>

                    {/* Error Banner */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                className="max-w-2xl mb-8 flex items-center justify-between gap-4 p-4 bg-red-50 border border-red-200 rounded-2xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                                        <AlertCircle className="w-4 h-4 text-red-600" />
                                    </div>
                                    <p className="text-sm font-semibold text-red-700">{error}</p>
                                </div>
                                <button
                                    onClick={() => setError(null)}
                                    className="w-7 h-7 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors shrink-0"
                                >
                                    <X className="w-3.5 h-3.5 text-red-600" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <FormSections
                        currentStep={0}
                        formData={formData}
                        setFormData={setFormData}
                        countries={availableCountries}
                    />
                </main>

                {/* ─── Right: Readiness Hub ─── */}
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

            {/* ─── Mobile Generate Button ─── */}
            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
                <button
                    disabled={isGenerating || isEvaluatingRules || !formData.jobTitle.trim() || !formData.country || loadingProfile}
                    onClick={() => handleGenerate(schema)}
                    className={`
                        w-full p-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 font-bold text-sm transition-all
                        ${(isGenerating || loadingProfile || isEvaluatingRules || !formData.jobTitle.trim() || !formData.country)
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#0A2A6B] to-[#1e3a8a] text-white active:scale-[0.98] hover:shadow-[#0A2A6B]/30'
                        }
                    `}
                >
                    {(isGenerating || loadingProfile || isEvaluatingRules)
                        ? <Loader2 className="w-5 h-5 animate-spin" />
                        : <Sparkles className="w-5 h-5" />
                    }
                    {isEvaluatingRules ? 'Evaluating...' : isGenerating ? (generationStep || 'Generating...') : loadingProfile ? 'Syncing...' : 'Generate Resume'}
                </button>
            </div>

            {/* ─── Compliance Modal ─── */}
            <AnimatePresence>
                {showComplianceWarning && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="relative bg-white rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl shadow-slate-900/20"
                        >
                            {/* Gold accent top bar */}
                            <div className="h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300" />

                            <div className="p-8">
                                {/* Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                                        <AlertCircle className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-0.5">
                                            Data Completeness Check
                                        </p>
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                            Missing {formData.country} Requirements
                                        </h2>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
                                    For <strong className="text-slate-800">{formData.country}</strong> market standards, recruiters expect the following. Completing your profile will significantly improve your ATS score.
                                </p>

                                {/* Warning Items */}
                                <div className="space-y-3 mb-8">
                                    {complianceWarnings.map((w: ComplianceWarning) => (
                                        <div
                                            key={w.id}
                                            className="flex items-start gap-3 p-4 bg-amber-50/60 border border-amber-100 rounded-2xl hover:bg-amber-50 hover:border-amber-200 transition-all"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-sm shadow-amber-400/50" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 mb-0.5">{w.title}</p>
                                                <p className="text-xs text-slate-500 leading-relaxed">{w.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <Link
                                        to="/profile"
                                        className="flex items-center justify-center w-full py-4 px-6 rounded-2xl font-bold text-sm bg-[#0A2A6B] text-white shadow-lg shadow-[#0A2A6B]/20 hover:bg-[#061D4F] hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Complete Profile Now
                                    </Link>
                                    <button
                                        onClick={() => handleGenerate(schema, { ignoreCompliance: true })}
                                        className="w-full py-3 px-6 rounded-2xl font-semibold text-sm text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all text-center"
                                    >
                                        Continue anyway with missing data →
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
