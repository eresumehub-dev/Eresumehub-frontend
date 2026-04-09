import React from 'react';
import {
    Zap, Shield, AlertCircle, Check,
    Sparkles, Loader2, TrendingUp, Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComplianceWarning } from '../../../utils/compliance_check';
import { Link } from 'react-router-dom';

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

const scoreColorMap: Record<string, { ring: string; text: string; bg: string; bar: string }> = {
    emerald: { ring: '#10b981', text: 'text-emerald-600', bg: 'bg-emerald-500', bar: 'from-emerald-400 to-emerald-600' },
    blue:    { ring: '#3b82f6', text: 'text-blue-600',    bg: 'bg-blue-500',    bar: 'from-blue-400 to-blue-600' },
    amber:   { ring: '#f59e0b', text: 'text-amber-600',   bg: 'bg-amber-500',   bar: 'from-amber-400 to-amber-600' },
    slate:   { ring: '#94a3b8', text: 'text-slate-500',   bg: 'bg-slate-400',   bar: 'from-slate-300 to-slate-500' },
};

const CIRCUMFERENCE = 2 * Math.PI * 44; // r=44

const ReadinessHub: React.FC<ReadinessHubProps> = ({
    score, atsScore, interpretation, warnings,
    isGenerating, generationStep, generationProgress,
    onGenerate, canGenerate, isEvaluatingRules
}) => {
    const colors = scoreColorMap[interpretation.color] || scoreColorMap.slate;
    const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
    const hasErrors = warnings.some(w => w.type === 'error');

    return (
        <aside className="lg:w-[340px] xl:w-[380px] flex-shrink-0 bg-white border-l border-slate-100 flex flex-col sticky top-[65px] h-[calc(100vh-65px)] self-start hidden lg:flex">
            {/* Gradient accent top */}
            <div className="h-1 bg-gradient-to-r from-[#0A2A6B] via-[#4DCFFF] to-[#A855F7]" />

            <div className="flex-1 overflow-y-auto p-7 space-y-6">

                {/* ── 1. Readiness Score ── */}
                <div className="flex items-center gap-5">
                    {/* Circular Progress */}
                    <div className="relative flex-shrink-0">
                        <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
                            {/* Track */}
                            <circle
                                cx="50" cy="50" r="44"
                                fill="none"
                                stroke="#f1f5f9"
                                strokeWidth="8"
                            />
                            {/* Progress */}
                            <motion.circle
                                cx="50" cy="50" r="44"
                                fill="none"
                                stroke={colors.ring}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={CIRCUMFERENCE}
                                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                                animate={{ strokeDashoffset: offset }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-xl font-black ${colors.text}`}>{score}%</span>
                        </div>
                    </div>

                    <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Launch Readiness</p>
                        <p className={`text-base font-black ${colors.text} mb-1`}>{interpretation.label}</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{interpretation.guidance}</p>
                    </div>
                </div>

                {/* ── 2. Intel Metrics ── */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Shield className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ATS Score</p>
                        </div>
                        <p className="text-2xl font-black text-slate-900">~{atsScore}<span className="text-base text-slate-400">%</span></p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Projected</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">AI Strength</p>
                        </div>
                        <p className="text-2xl font-black text-slate-900">High</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Model: v16.4</p>
                    </div>
                </div>

                {/* ── 3. Profile Completeness Bar ── */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Completeness</p>
                        <span className={`text-[11px] font-black ${colors.text}`}>{score}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${colors.bar}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* ── 4. Compliance Warnings ── */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Required Fixes</p>
                        {warnings.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black">
                                {warnings.length} item{warnings.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {warnings.length === 0 ? (
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                            <div className="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-emerald-800">All Systems Clear</p>
                                <p className="text-[10px] text-emerald-600">Resume is market-compliant</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {warnings.map((w) => {
                                const isError = w.type === 'error';
                                return (
                                    <motion.div
                                        key={w.id}
                                        layout
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`p-3.5 rounded-2xl border transition-all ${
                                            isError
                                                ? 'bg-red-50 border-red-100 hover:border-red-200'
                                                : 'bg-amber-50/60 border-amber-100 hover:border-amber-200'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <AlertCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isError ? 'text-red-500' : 'text-amber-500'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-bold mb-0.5 ${isError ? 'text-red-800' : 'text-amber-900'}`}>
                                                    {w.title}
                                                </p>
                                                <p className={`text-[10px] leading-relaxed ${isError ? 'text-red-600' : 'text-amber-700'}`}>
                                                    {w.message}
                                                </p>
                                                {w.actionLink && (
                                                    <Link
                                                        to={w.actionLink}
                                                        className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold hover:underline ${
                                                            isError ? 'text-red-600' : 'text-amber-700'
                                                        }`}
                                                    >
                                                        <LinkIcon className="w-2.5 h-2.5" />
                                                        {w.actionLabel}
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── 5. Generate CTA — Pinned Bottom ── */}
            <div className="p-5 border-t border-slate-100 bg-white/80 backdrop-blur-sm space-y-3">
                <AnimatePresence mode="wait">
                    {isGenerating ? (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="space-y-3"
                        >
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-700 flex items-center gap-2 animate-pulse">
                                    <Sparkles className="w-3.5 h-3.5 text-[#4DCFFF]" />
                                    {generationStep || 'AI Processing...'}
                                </span>
                                <span className="text-slate-400 font-mono">{generationProgress}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-[#0A2A6B] via-[#4DCFFF] to-[#A855F7] rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${generationProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <button
                                disabled
                                className="w-full py-4 rounded-2xl bg-slate-100 text-slate-400 text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                            >
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="space-y-2"
                        >
                            <button
                                disabled={!canGenerate || isEvaluatingRules}
                                onClick={onGenerate}
                                data-testid={hasErrors ? 'resolve-button' : 'generate-button'}
                                className={`
                                    w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-200
                                    ${!canGenerate || isEvaluatingRules
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : hasErrors
                                            ? 'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98] shadow-lg shadow-red-500/20'
                                            : score >= 80
                                                ? 'bg-gradient-to-r from-[#0A2A6B] to-[#1e3a8a] text-white hover:shadow-[#0A2A6B]/30 hover:shadow-lg active:scale-[0.98]'
                                                : 'bg-[#0A2A6B] text-white hover:bg-[#061D4F] active:scale-[0.98] shadow-md shadow-[#0A2A6B]/20'
                                    }
                                `}
                            >
                                {isEvaluatingRules ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating Rules...</>
                                ) : hasErrors ? (
                                    <><AlertCircle className="w-4 h-4" /> Resolve {warnings.filter(w => w.type === 'error').length} Issues</>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        {score >= 80 ? 'Generate Resume →' : 'Generate Resume'}
                                        {score >= 80 && <TrendingUp className="w-4 h-4" />}
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] text-center text-slate-400 font-medium">
                                {canGenerate
                                    ? score >= 80
                                        ? '✨ High readiness ensures top ATS scoring'
                                        : 'Complete more sections to improve your score'
                                    : 'Enter a job title and country to continue'
                                }
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </aside>
    );
};

export default ReadinessHub;
