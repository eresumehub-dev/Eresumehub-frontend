import React from 'react';
import { 
    Sparkles, 
    AlertCircle, 
    Loader2,
    CheckCircle2,
    ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComplianceWarning } from '../../../utils/compliance_check';

interface ReadinessHubProps {
    score: number;
    interpretation: { label: string; color: string; guidance: string };
    warnings: ComplianceWarning[];
    isGenerating: boolean;
    generationStep: string;
    generationProgress: number;
    onGenerate: () => void;
    canGenerate: boolean;
    isEvaluatingRules?: boolean;
}

const ReadinessHub: React.FC<ReadinessHubProps> = ({
    score, interpretation, warnings,
    isGenerating, generationStep, generationProgress,
    onGenerate, canGenerate, isEvaluatingRules
}) => {
    
    const errors = (warnings || []).filter(w => w.type === 'error');
    const tips = (warnings || []).filter(w => w.type === 'warning' || w.type === 'info');

    return (
        <div className="h-full flex flex-col p-8 md:p-10 bg-[#F5F5F7] backdrop-blur-3xl overflow-y-auto custom-scrollbar">
            <div className="flex-1">
                {/* Header Context */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Sparkles className="w-5 h-5 text-[#1D1D1F]" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-[17px] font-semibold tracking-tight text-[#1D1D1F]">
                            Resume Intelligence
                        </h3>
                        <p className="text-[12px] text-[#86868B] font-medium uppercase tracking-widest">Diagnostic Engine</p>
                    </div>
                </div>

                {/* Score Circular Visualizer */}
                <div className="bg-white rounded-[2.5rem] p-10 flex flex-col items-center justify-center border border-black/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.02)] mb-10 relative overflow-hidden">
                    <svg className="w-36 h-36 transform -rotate-90">
                        <circle cx="72" cy="72" r="64" fill="none" stroke="#F5F5F7" strokeWidth="6" />
                        <motion.circle 
                            cx="72" cy="72" r="64" 
                            fill="none" 
                            stroke="#1D1D1F" 
                            strokeWidth="6"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: "402", strokeDashoffset: "402" }}
                            animate={{ strokeDashoffset: 402 - (402 * score) / 100 }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
                        <motion.span 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[3.25rem] font-medium text-[#1D1D1F] tracking-tighter leading-none"
                        >
                            {score}
                        </motion.span>
                        <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-[0.2em] mt-2">Readiness</span>
                    </div>
                </div>

                {/* Interpretations & Analysis */}
                <div className="space-y-4 mb-8">
                    <div className="p-5 rounded-[1.5rem] bg-white border border-black/[0.04] shadow-sm">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#34C759] shrink-0 mt-0.5" strokeWidth={1.5}/>
                            <div>
                                <h4 className="text-[15px] font-semibold text-[#1D1D1F] mb-1">{interpretation?.label || 'Calculating...'}</h4>
                                <p className="text-[14px] text-[#86868B] leading-relaxed">
                                    {interpretation.guidance}
                                </p>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {errors.map((w) => (
                            <motion.div 
                                key={w.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-5 rounded-[1.5rem] bg-amber-50/50 border border-amber-100 text-amber-900"
                            >
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5}/>
                                    <div>
                                        <p className="text-[14px] font-semibold leading-relaxed mb-0.5">{w.title}</p>
                                        <p className="text-[13px] opacity-80 leading-snug">{w.message}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {tips.length > 0 && (
                        <div className="pt-2">
                            <h4 className="text-[11px] font-bold text-[#86868B] uppercase tracking-widest mb-4 ml-1">Optimization Tips</h4>
                            <div className="space-y-3">
                                {tips.slice(0, 3).map((w) => (
                                    <div key={w.id} className="flex items-start gap-3 ml-1 group cursor-default">
                                        <div className="w-1 h-1 rounded-full bg-[#1D1D1F] mt-2 group-hover:scale-150 transition-transform" />
                                        <p className="text-[13px] text-[#86868B] leading-relaxed group-hover:text-[#1D1D1F] transition-colors">{w.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Panel */}
            <div className="pt-8 border-t border-black/[0.04]">
                <AnimatePresence mode="wait">
                    {isGenerating ? (
                        <motion.div 
                            key="gen"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#F5F5F7] rounded-2xl p-6 border border-black/[0.02] flex flex-col items-center gap-4"
                        >
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-5 h-5 animate-spin text-[#1D1D1F]" strokeWidth={1.5} />
                                <span className="text-[15px] font-medium text-[#1D1D1F]">{generationStep}</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-[#1D1D1F]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${generationProgress}%` }}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            <button
                                disabled={!canGenerate || isEvaluatingRules}
                                onClick={onGenerate}
                                className={`
                                    w-full py-4 rounded-2xl font-medium text-[16px] tracking-tight transition-all duration-300 flex items-center justify-center gap-2
                                    ${(!canGenerate || isEvaluatingRules || errors.length > 0)
                                        ? 'bg-white text-[#86868B] border border-black/[0.04]'
                                        : 'bg-[#1D1D1F] text-white hover:bg-black shadow-[0_4px_14px_rgba(0,0,0,0.1)] active:scale-[0.98]'
                                    }
                                `}
                            >
                                {isEvaluatingRules ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                {isEvaluatingRules ? 'Identifying Market Rules...' : errors.length > 0 ? 'Review Market Alerts' : 'Generate Perfect Resume'}
                                {!isEvaluatingRules && <ArrowUpRight className="w-4 h-4" />}
                            </button>
                            <p className="text-[11px] text-[#86868B] text-center font-medium">Precision alignment with target RAG schemas. <span className="text-[#1D1D1F]">v16.4.20</span></p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ReadinessHub;
