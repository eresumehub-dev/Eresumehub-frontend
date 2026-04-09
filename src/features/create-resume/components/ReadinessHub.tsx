import React from 'react';
import {
    Shield, Check,
    Sparkles, Loader2, PenLine, Info
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
    
    const errors = warnings.filter(w => w.type === 'error');
    const tips = warnings.filter(w => w.type === 'warning' || w.type === 'info');

    return (
        <aside className="w-[360px] bg-slate-50 border-l border-slate-100 flex flex-col h-full flex-shrink-0 relative overflow-hidden">
            
            {/* 1. Friendly Score Diagnostic */}
            <div className="p-8 pb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Your Readiness
                    </h3>
                    <div className="text-xl font-black text-slate-900 pr-1">
                        {score}%
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-slate-900"
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1, ease: "circOut" }}
                        />
                    </div>
                    
                    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                            <p className="text-sm font-bold text-slate-900">{interpretation.label}</p>
                        </div>
                        <p className="text-xs text-slate-500 leading-normal font-normal">{interpretation.guidance}</p>
                    </div>
                </div>
            </div>

            {/* 2. Unified Action Checklist (Replaces Modal) */}
            <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar">
                
                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Checklist
                    </h3>
                    {warnings.length === 0 && (
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Everything looks good
                        </span>
                    )}
                </div>

                <div className="space-y-2 mt-4">
                    {warnings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center pt-8 text-center opacity-40">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                                <Check className="w-6 h-6 text-emerald-500" />
                            </div>
                            <p className="text-xs font-medium text-slate-500 max-w-[180px]">You're all set! Your profile matches the target market standards.</p>
                        </div>
                    ) : (
                        <>
                            {errors.map((w) => (
                                <div key={w.id} className="p-4 bg-white border border-slate-100 rounded-2xl group transition-all hover:border-slate-300">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 bg-amber-50 p-1 rounded-md">
                                            <Info className="w-3 h-3 text-amber-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-900 leading-tight mb-1">{w.title}</p>
                                            <p className="text-[11px] text-slate-500 leading-normal font-normal">{w.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {tips.length > 0 && (
                                <div className="mt-8 pt-4 border-t border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4">Recommended Tips</p>
                                    <div className="space-y-2">
                                        {tips.map((w) => (
                                            <div key={w.id} className="flex items-start gap-3 opacity-60 hover:opacity-100 transition-opacity">
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                <p className="text-[11px] text-slate-500 leading-normal">{w.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* 3. Refined Command Panel */}
            <div className="p-8 bg-white border-t border-slate-100">
                <AnimatePresence mode="wait">
                    {isGenerating ? (
                        <motion.div 
                            key="generating"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-400 animate-pulse">{generationStep}</span>
                                <span className="text-sm font-black text-slate-900">{generationProgress}%</span>
                            </div>
                            <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-slate-900"
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
                                    w-full h-14 flex items-center justify-center gap-3 transition-all rounded-2xl
                                    ${!canGenerate || isEvaluatingRules 
                                        ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
                                        : 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-900/10 active:scale-[0.98]'
                                    }
                                `}
                            >
                                {isEvaluatingRules ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <PenLine className="w-4 h-4" />
                                )}
                                <span className="text-sm font-bold">
                                    {isEvaluatingRules ? 'Checking Market...' : 'Create My Resume'}
                                </span>
                            </button>
                            <div className="flex items-center justify-center gap-2">
                                <Shield className="w-3 h-3 text-slate-300" />
                                <span className="text-[10px] text-slate-400 font-medium">Standard Compliance Guaranteed</span>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </aside>
    );
};

export default ReadinessHub;
