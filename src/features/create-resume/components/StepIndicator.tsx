import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
// import { motion } from 'framer-motion';

interface StepIndicatorProps {
    currentStep: number;
    steps: string[];
    onStepClick: (index: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps, onStepClick }) => {
    return (
        <div className="flex items-center gap-1">
            {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isComplete = index < currentStep;
                const isClickable = index <= currentStep || isComplete;

                return (
                    <React.Fragment key={step}>
                        <button
                            onClick={() => isClickable && onStepClick(index)}
                            disabled={!isClickable}
                            className={`
                                group px-3 py-1 flex items-center gap-2 rounded-lg transition-all
                                ${isActive 
                                    ? 'bg-foreground/5 text-foreground ring-1 ring-foreground/20 shadow-sm' 
                                    : isComplete 
                                        ? 'text-foreground/60 hover:bg-foreground/5' 
                                        : 'text-muted-foreground/30'
                                }
                                ${!isClickable ? 'cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            <div className={`
                                w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors
                                ${isActive 
                                    ? 'bg-foreground text-background shadow-md shadow-foreground/20' 
                                    : isComplete 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-muted/50 text-muted-foreground'
                                }
                            `}>
                                {isComplete ? <Check className="w-3 h-3" /> : index + 1}
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-widest hidden sm:inline">
                                {step}
                            </span>
                        </button>
                        {index < steps.length - 1 && (
                            <ChevronRight className={`w-4 h-4 ${index < currentStep ? 'text-foreground/30' : 'text-muted/50'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default StepIndicator;
