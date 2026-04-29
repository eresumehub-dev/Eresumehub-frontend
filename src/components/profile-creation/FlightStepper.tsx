import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface Step {
    id: number;
    title: string;
    icon: any;
}

interface FlightStepperProps {
    steps: Step[];
    currentStep: number;
    onStepClick: (stepId: number) => void;
    stepValidity: Record<number, 'valid' | 'invalid'>;
}

const springConfig = {
    type: "spring" as const,
    mass: 1,
    stiffness: 80,
    damping: 20,
};

const FlightStepper: React.FC<FlightStepperProps> = ({ steps, currentStep, onStepClick, stepValidity }) => {
    return (
        <LayoutGroup>
            <div className="relative w-full overflow-hidden select-none">
                {/* Main Stepper Content */}
                <div className="relative px-2 pt-2 pb-10 md:px-6">

                    {/* Progress Track (Segmented) */}
                    <div className="relative mx-4">

                        {/* Connecting Lines Container - Aligned to button centers */}
                        <div className="absolute top-1/2 left-[15px] right-[15px] h-[3px] -translate-y-1/2 flex items-center z-0">
                            {steps.slice(0, -1).map((_, i) => {
                                const stepId = i + 1;
                                const isPast = currentStep > stepId; // Segment is "filled" if we have passed this step
                                const status = stepValidity[stepId];

                                return (
                                    <div key={i} className="h-full flex-1 relative bg-black/5 first:rounded-l-full last:rounded-r-full overflow-hidden">
                                        {/* Filled Progress Segment */}
                                        <motion.div
                                            className={`absolute inset-y-0 left-0 h-full ${status === 'invalid'
                                                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                                                : 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]'
                                                }`}
                                            initial={{ width: "0%" }}
                                            animate={{ width: isPast ? "101%" : "0%" }} // 101% to prevent sub-pixel gaps
                                            transition={{ duration: 0.6, delay: i * 0.1, ease: "circOut" }}
                                        >
                                            {/* Shine Effect */}
                                            {isPast && (
                                                <div className="absolute inset-0 bg-white/30 skew-x-12 translate-x-full animate-[shimmer_2s_infinite]" />
                                            )}
                                        </motion.div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Step Gauges */}
                        <div className="relative flex items-center justify-between z-10">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const stepNumber = index + 1;
                                const isCompleted = stepNumber < currentStep;
                                const isCurrent = stepNumber === currentStep;

                                const isValid = stepValidity[stepNumber] !== 'invalid';

                                return (
                                    <motion.button
                                        key={step.id}
                                        type="button"
                                        onClick={() => onStepClick(step.id)}
                                        className="relative flex flex-col items-center group focus:outline-none cursor-pointer"
                                        whileTap={{ scale: 0.9 }}
                                        whileHover={{ scale: 1.05 }}
                                        transition={springConfig}
                                    >
                                        {/* Gauge Container */}
                                        <div
                                            className={`
                        w-10 h-10 md:w-14 md:h-14 rounded-full 
                        flex items-center justify-center transition-all duration-300 bg-white
                        ${isCompleted ? (isValid ? 'border-emerald-500 bg-emerald-50' : 'border-amber-400 bg-amber-50') : ''}
                        ${isCurrent ? 'border-primary text-primary-foreground shadow-xl shadow-primary/30 bg-primary scale-110' : ''}
                        ${!isCompleted && !isCurrent ? 'border-black/10' : ''}
                        border-[2px] z-20
                      `}
                                        >
                                            <motion.div layout transition={springConfig}>
                                                {isCompleted ? (
                                                    isValid ? (
                                                        <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                                                    ) : (
                                                        <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
                                                    )
                                                ) : (
                                                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isCurrent ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                                )}
                                            </motion.div>
                                        </div>

                                        {/* Step Label */}
                                        <div className="absolute top-[4.5rem] text-center hidden md:block w-32">
                                            <motion.span
                                                className={`
                          block text-xs font-mono uppercase tracking-widest
                          transition-colors duration-300
                          ${isCurrent ? 'text-foreground font-bold' : 'text-muted-foreground/70'}
                        `}
                                            >
                                                {step.title}
                                            </motion.span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </LayoutGroup>
    );
};

export default FlightStepper;
