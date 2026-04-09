import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// --- SHARED UI ---
import Card from '../../components/shared/ui/Card';

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

    // 🧪 DEBUG: v3.1.4b Component Render Trace (CACHE BUSTER)
    console.log("🔥 [v3.1.4-2200] CreateResumePage RENDER", {
        country: formData?.country,
        profileExists: !!profile
    });

    // 🧪 DEBUG: v3.1.3 Call-Site Trace
    console.warn("🧠 Passing into useReadinessScore:", {
        targetCountry: formData.country,
        userProfile: profile
    });

    const {
        readinessScore, projectedAtsScore, interpretation, warnings, isEvaluatingRules, schema
    } = useReadinessScore(
        profile, formData.jobTitle, formData.jobDescription, formData.country, new Set()
    );

    // Fetch countries
    useEffect(() => {
        getAvailableCountries().then(setAvailableCountries);
    }, []);

    // Fetch countries
    useEffect(() => {
        getAvailableCountries().then(setAvailableCountries);
    }, []);

    if (loadingProfile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <Loader2 className="w-5 h-5 animate-spin text-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Synchronizing profile intelligence...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden">
            <div className="max-w-6xl mx-auto h-screen flex flex-col">
                
                {/* 1. Header (Simplified Intelligence Branding) */}
                <header className="border-b border-border bg-background/80 backdrop-blur-md z-10">
                    <div className="flex items-center justify-between px-6 py-4">
                        <Link 
                            to="/dashboard" 
                            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all group"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                            Back to Command Center
                        </Link>
                        
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                                Global Market Engine v16.4.9
                            </span>
                        </div>

                        <div className="w-[100px]" /> {/* Spacer for balance */}
                    </div>
                </header>

                {/* 2. Main Workspace */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] overflow-hidden">
                    
                    {/* Left: Interactive Form (Guided Flow) */}
                    <main className="overflow-y-auto p-6 md:p-12 custom-scrollbar">
                        <AnimatePresence>
                            {error && (
                                <Card variant="accent" padding="sm" className="mb-8 border-destructive/20 flex items-center justify-between bg-destructive/5">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-4 h-4 text-destructive" />
                                        <p className="text-sm font-medium text-destructive">{error}</p>
                                    </div>
                                    <button onClick={() => setError(null)} className="text-xs text-destructive hover:underline">Dismiss</button>
                                </Card>
                            )}
                        </AnimatePresence>

                        <div className="max-w-xl mx-auto">
                            <div className="mb-12">
                                <h1 className="text-3xl font-bold tracking-tighter text-foreground mb-2">
                                    Create Your Resume
                                </h1>
                                <p className="text-muted-foreground text-sm">
                                    Optimized for {formData.country} standards and ATS compatibility.
                                </p>
                            </div>

                            <FormSections 
                                currentStep={0}
                                formData={formData}
                                setFormData={setFormData}
                                countries={availableCountries}
                            />
                        </div>
                    </main>

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
            </div>

            {/* Mobile Generate Button (Floating) */}
            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
                {warnings.some(w => w.type === 'error') ? (
                    <button
                        onClick={() => handleGenerate()}
                        className="w-full p-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 font-bold transition-all bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 active:scale-[0.98]"
                    >
                        <AlertCircle className="w-5 h-5" />
                        Resolve {warnings.filter(w => w.type === 'error').length} Issues
                    </button>
                ) : (
                    <button
                        disabled={isGenerating || isEvaluatingRules || !formData.jobTitle.trim() || !formData.country || loadingProfile}
                        onClick={() => handleGenerate()}
                        className={`
                            w-full p-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 font-bold transition-all
                            ${(isGenerating || loadingProfile || isEvaluatingRules) ? 'bg-muted text-muted-foreground' : 'bg-foreground text-background active:scale-[0.98]'}
                        `}
                    >
                        {(isGenerating || loadingProfile || isEvaluatingRules) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {isEvaluatingRules ? 'Evaluating Rules...' : isGenerating ? (generationStep || 'Generating...') : loadingProfile ? 'Synchronizing...' : 'Generate Resume'}
                    </button>
                )}
            </div>

            {/* Compliance Modal - PREMIUM GLASSMORPHIC REDESIGN (v3.4.0) */}
            <AnimatePresence>
                {showComplianceWarning && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="relative bg-white border border-slate-200 shadow-[0_32px_128px_-12px_rgba(0,0,0,0.2)] rounded-[40px] max-w-lg w-full overflow-hidden"
                        >
                            {/* Accent Background Gradient */}
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-amber-50 to-transparent -z-10" />

                            <div className="p-10">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="p-4 bg-amber-50 rounded-[24px] border border-amber-100 shadow-inner">
                                        <AlertCircle className="w-8 h-8 text-amber-600" />
                                    </div>
                                    <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                                        Compliance Delta Detected
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">
                                        Market Integrity Gaps
                                    </h2>
                                    <p className="text-slate-500 font-medium">
                                        Standard protocols for <span className="text-slate-900 font-black">{formData.country}</span> require the following data points for optimal ATS ranking and recruiter trust.
                                    </p>
                                </div>
                                
                                <div className="space-y-4 mb-10">
                                    {complianceWarnings.map((w: ComplianceWarning) => (
                                        <div key={w.id} className="p-5 bg-slate-50/50 rounded-[28px] border border-slate-100/50 flex gap-4 transition-all hover:bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/20 group">
                                            <div className="shrink-0 w-3 h-3 rounded-full bg-amber-500 mt-2 shadow-[0_0_12px_rgba(245,158,11,0.5)] group-hover:scale-125 transition-transform" />
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">{w.title}</h4>
                                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{w.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <Link 
                                        to="/profile" 
                                        className="w-full py-5 px-6 rounded-[24px] font-black bg-[#0A2A6B] text-white text-xs uppercase tracking-[0.2em] text-center shadow-xl shadow-[#0A2A6B]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Optimize Profile Now
                                    </Link>
                                    <button 
                                        onClick={() => handleGenerate(schema, { ignoreCompliance: true })}
                                        className="w-full py-4 px-6 font-bold text-slate-400 hover:text-slate-900 text-[10px] uppercase tracking-[0.15em] text-center transition-all flex items-center justify-center gap-2 group"
                                    >
                                        Proceed with missing data
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-900" />
                                    </button>
                                </div>
                            </div>

                            {/* Decorative Bottom Bar */}
                            <div className="h-2 bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CreateResumePage;
