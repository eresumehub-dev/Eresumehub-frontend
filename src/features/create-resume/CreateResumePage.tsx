import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// --- SHARED UI ---
import Card from '../../components/shared/ui/Card';

// --- FEATURE COMPONENTS ---
import StepIndicator from './components/StepIndicator';
import ReadinessHub from './components/ReadinessHub';
import FormSections from './components/FormSections';

// --- FEATURE HOOKS ---
import { useCreateResumeFlow } from './hooks/useCreateResumeFlow';
import { useReadinessScore } from './hooks/useReadinessScore';

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
        readinessScore, projectedAtsScore, interpretation, warnings, isEvaluatingRules
    } = useReadinessScore(
        profile, formData.jobTitle, formData.jobDescription, formData.country, new Set()
    );

    // Step logic: Progressive disclosure
    const steps = ['Role', 'Context', 'Customize'];
    const [currentStep, setCurrentStep] = useState(0);

    // Effect: Auto-advance context if jobTitle is filled
    useEffect(() => {
        if (formData.jobTitle.trim().length > 3 && currentStep === 0) {
            // Lightest friction: don't auto-jump but allow manual
        }
    }, [formData.jobTitle, currentStep]);

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
                
                {/* 1. Header (Interactive Step Navigator) */}
                <header className="border-b border-border bg-background z-10">
                    <div className="flex items-center justify-between px-6 py-4">
                        <Link 
                            to="/dashboard" 
                            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all group"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                            Back
                        </Link>
                        
                        <StepIndicator 
                            currentStep={currentStep} 
                            steps={steps} 
                            onStepClick={setCurrentStep} 
                        />

                        <div className="w-[60px]" /> {/* Spacer for balance */}
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
                                currentStep={currentStep}
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
                        onGenerate={() => handleGenerate()}
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

            {/* Compliance Modal */}
            <AnimatePresence>
                {showComplianceWarning && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-background border border-border shadow-2xl rounded-2xl p-6 max-w-md w-full overflow-hidden"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Mandatory Market Requirements</h2>
                                    <p className="text-sm text-muted-foreground">Required for {formData.country} Compliance</p>
                                </div>
                            </div>
                            
                            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 mb-6">
                                <p className="text-sm text-amber-900 mb-3 font-medium">To proceed with generation, we recommend fixing these gaps:</p>
                                <ul className="space-y-3 mb-4">
                                    {complianceWarnings.map(w => (
                                        <li key={w.id} className="flex items-start gap-2">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-amber-900">{w.title}</p>
                                                <p className="text-xs text-amber-800/70 leading-relaxed">{w.message}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-xs font-bold text-amber-900 uppercase tracking-widest bg-amber-100/50 p-2 rounded-lg text-center">
                                    Generative AI works best with full identification data.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Link to="/profile" className="w-full py-3 px-4 rounded-xl font-bold bg-foreground text-background text-sm text-center">
                                    Fix Now
                                </Link>
                                <button 
                                    onClick={() => handleGenerate([], { ignoreCompliance: true })}
                                    className="w-full py-2 px-4 font-medium text-muted-foreground hover:text-foreground text-xs text-center transition-colors underline decoration-border underline-offset-4"
                                >
                                    Force generation anyway (Not Recommended)
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CreateResumePage;
