import React from 'react';
import { 
    Zap, Shield, AlertCircle, Check, 
    ChevronRight, Sparkles, Clock, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComplianceWarning } from '../hooks/useReadinessScore';
import Button from '../../../components/shared/ui/Button';
import Card from '../../../components/shared/ui/Card';

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
}

const ReadinessHub: React.FC<ReadinessHubProps> = ({
    score, atsScore, interpretation, warnings,
    isGenerating, generationStep, generationProgress,
    onGenerate, canGenerate
}) => {
    
    const colorMap: Record<string, string> = {
        emerald: 'bg-emerald-500 text-emerald-500 border-emerald-200/50',
        blue: 'bg-blue-500 text-blue-500 border-blue-200/50',
        amber: 'bg-amber-500 text-amber-500 border-amber-200/50',
        slate: 'bg-slate-400 text-slate-400 border-slate-200/50'
    };

    const bgMap: Record<string, string> = {
        emerald: 'bg-emerald-50/50',
        blue: 'bg-blue-50/50',
        amber: 'bg-amber-50/50',
        slate: 'bg-slate-50/50'
    };

    return (
        <aside className="h-[calc(100vh-65px)] sticky top-[65px] flex flex-col p-6 space-y-6 bg-muted/20 border-l border-border">
            
            {/* 1. Readiness Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                            Launch Readiness
                        </h3>
                        <p className={`text-sm font-bold ${interpretation.color === 'emerald' ? 'text-emerald-700' : 'text-foreground'}`}>
                            {interpretation.label}
                        </p>
                    </div>
                    <div className="relative flex items-center justify-center">
                        <svg className="w-12 h-12 -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-muted/30" />
                            <motion.circle 
                                cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent"
                                strokeDasharray={125.6}
                                initial={{ strokeDashoffset: 125.6 }}
                                animate={{ strokeDashoffset: 125.6 - (score / 100) * 125.6 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={colorMap[interpretation.color].split(' ')[1]}
                            />
                        </svg>
                        <span className="absolute text-[10px] font-bold">{score}%</span>
                    </div>
                </div>

                <Card variant="muted" padding="sm" className={`border-none ${bgMap[interpretation.color]}`}>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                        {interpretation.guidance}
                    </p>
                </Card>
            </div>

            {/* 2. Intelligence Metrics */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-background border border-border shadow-sm">
                    <Shield className="w-3.5 h-3.5 text-blue-500 mb-2" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">ATS Projection</p>
                    <p className="text-lg font-bold">~{atsScore}%</p>
                </div>
                <div className="p-3 rounded-xl bg-background border border-border shadow-sm">
                    <Zap className="w-3.5 h-3.5 text-amber-500 mb-2" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">AI Strength</p>
                    <p className="text-lg font-bold">High</p>
                </div>
            </div>

            {/* 3. Compliance Warnings (The "Gating" list) */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Required Fixes
                </h3>
                {warnings.length === 0 ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-100 bg-emerald-50/30">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <p className="text-xs font-medium text-emerald-800">No issues found. Resume compliant.</p>
                    </div>
                ) : (
                    warnings.map((w) => (
                        <div key={w.id} className="flex items-start gap-3 p-3 rounded-xl border border-amber-100 bg-amber-50/30 group hover:border-amber-200 transition-colors">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-amber-900">{w.title}</p>
                                <p className="text-[10px] text-amber-800/70 mt-0.5 leading-relaxed">{w.message}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 4. Launch Sequence */}
            <div className="pt-4 border-t border-border space-y-4">
                <AnimatePresence mode="wait">
                    {isGenerating ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-bold text-foreground animate-pulse flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                                    {generationStep || "AI Processing..."}
                                </span>
                                <span className="text-muted-foreground">{generationProgress}%</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-foreground"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${generationProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <Button variant="outline" disabled className="w-full text-xs opacity-50">
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                                Engine Running...
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <Button 
                                variant={score >= 80 ? 'primary' : 'outline'}
                                size="lg"
                                className="w-full"
                                disabled={!canGenerate}
                                onClick={onGenerate}
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                {score >= 80 ? 'Ready to Generate' : 'Generate Resume'}
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground">
                                High readiness ensures better ATS scoring.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </aside>
    );
};

export default ReadinessHub;
