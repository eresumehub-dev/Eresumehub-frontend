import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Sparkles, Check } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// --- SHARED UI ---
import Card from '../../components/shared/ui/Card';

// --- FEATURE COMPONENTS ---
import StepIndicator from './components/StepIndicator';
import ReadinessHub from './components/ReadinessHub';
import FormSections from './components/FormSections';

// --- FEATURE HOOKS ---
import { useCreateResumeFlow } from './hooks/useCreateResumeFlow';
import { useReadinessScore } from './hooks/useReadinessScore';
import * as resumeService from '../../services/resume';
import * as profileQuery from '../../hooks/queries/useUserProfileQuery';

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
        readinessScore, projectedAtsScore, interpretation, warnings
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

                    {/* Right: The Launch Pad (Readiness Hub) */}
                    <ReadinessHub 
                        score={readinessScore}
                        atsScore={projectedAtsScore}
                        interpretation={interpretation}
                        warnings={warnings}
                        isGenerating={isGenerating}
                        generationStep={generationStep}
                        generationProgress={generationProgress}
                        onGenerate={handleGenerate}
                        canGenerate={formData.jobTitle.trim().length > 3}
                    />
                </div>
            </div>

            {/* Mobile Generate Button (Floating) */}
            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
                <button
                    disabled={isGenerating || !formData.jobTitle.trim()}
                    onClick={handleGenerate}
                    className={`
                        w-full p-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 font-bold transition-all
                        ${isGenerating ? 'bg-muted text-muted-foreground' : 'bg-foreground text-background active:scale-[0.98]'}
                    `}
                >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isGenerating ? (generationStep || 'Generating...') : 'Generate Resume'}
                </button>
            </div>
        </div>
    );
};

export default CreateResumePage;
