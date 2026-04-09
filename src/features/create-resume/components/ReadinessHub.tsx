import React from 'react';
import {
    Zap, Shield, AlertCircle, Check,
    Sparkles, Loader2, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComplianceWarning } from '../../../utils/compliance_check';

interface ReadinessHubProps {
    score: number;
    atsScore: number;
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
    score, atsScore, interpretation, warnings,
    isGenerating, generationStep, generationProgress,
    onGenerate, canGenerate, isEvaluatingRules
}) => {
    
    const hasError = warnings.some(w => w.type === 'error');

    return (
        <aside className="w-[320px] bg-slate-50 border-l border-slate-200 flex flex-col h-full flex-shrink-0 relative">
            
            {/* 1. Readiness Diagnostic (Professional Meter) */}
            <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Launch Integrity
                    </h3>
                    <div className="px-2 py-0.5 bg-slate-200 rounded text-[9px] font-black uppercase tracking-tighter text-slate-600">
                        {score}%
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-[#0A2A6B]"
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                        />
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded">
                        <BarChart3 className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#0A2A6B] mb-0.5">{interpretation.label}</p>
                            <p className="text-[9px] text-slate-500 leading-tight font-medium italic">{interpretation.guidance}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Intelligence Metrics (High Density) */}
            <div className="p-6 border-b border-slate-200 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-white border border-slate-100 rounded">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Shield className="w-3 h-3 text-slate-300" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">ATS Opt.</span>
                        </div>
                        <p className="text-xl font-black text-slate-900 tracking-tighter">~{atsScore}%</p>
                    </div>
                    <div className="p-3 bg-white border border-slate-100 rounded">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Zap className="w-3 h-3 text-slate-300" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">AI Power</span>
                        </div>
                        <p className="text-xl font-black text-slate-900 tracking-tighter">MAX</p>
                    </div>
                </div>
            </div>

            {/* 3. Global Compliance Scan */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Validation Log
                    </h3>
                    <span className="text-[9px] font-bold text-slate-300">v16.4</span>
                </div>

                {warnings.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded">
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Verification Successful</span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {warnings.map((w) => (
                            <div key={w.id} className={`p-3 border rounded transition-colors group ${w.type === 'error' ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-start gap-2.5">
                                    <AlertCircle className={`w-3 h-3 shrink-0 mt-0.5 ${w.type === 'error' ? 'text-red-500' : 'text-slate-300'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-[10px] uppercase tracking-widest font-black leading-tight ${w.type === 'error' ? 'text-red-800' : 'text-slate-600'}`}>{w.title}</p>
                                        <p className="text-[9px] text-slate-400 mt-1 leading-normal font-medium">{w.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 4. Executive Control Panel (Pinned Bottom) */}
            <div className="p-6 bg-white border-t border-slate-200">
                <AnimatePresence mode="wait">
                    {isGenerating ? (
                        <motion.div 
                            key="generating"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">{generationStep || "Neural Processing"}</span>
                                <span className="text-[9px] font-bold text-[#0A2A6B]">{generationProgress}%</span>
                            </div>
                            <div className="h-0.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-[#0A2A6B]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${generationProgress}%` }}
                                />
                            </div>
                            <button disabled className="w-full h-11 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-inner">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Processing Sequence
                            </button>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            <button
                                disabled={!canGenerate || isEvaluatingRules}
                                onClick={onGenerate}
                                className={`
                                    w-full h-12 flex items-center justify-center gap-2 transition-all group
                                    ${!canGenerate || isEvaluatingRules 
                                        ? 'bg-slate-50 border border-slate-200 text-slate-300 cursor-not-allowed' 
                                        : hasError
                                            ? 'bg-red-600 text-white shadow-[0_8px_16px_rgba(220,38,38,0.2)] hover:bg-red-700'
                                            : 'bg-[#0A2A6B] text-white shadow-[0_8px_16px_rgba(10,42,107,0.2)] hover:bg-slate-900'
                                    }
                                `}
                            >
                                {isEvaluatingRules ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Sparkles className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                                )}
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                    {isEvaluatingRules ? 'Recalculating...' : hasError ? `Action Required (${warnings.filter(w => w.type === 'error').length})` : 'Generate Resume'}
                                </span>
                            </button>
                            <p className="text-[8px] text-center text-slate-400 font-bold uppercase tracking-widest opacity-50">
                                Standard-compliant neural architecture
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </aside>
    );
};

export default ReadinessHub;
