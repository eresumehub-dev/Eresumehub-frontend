import React from 'react';
import { AlertTriangle, ArrowRight, Zap, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface Fix {
    title: string;
    current: string;
    suggested: string;
    reasoning?: string;
    points: number;
}

interface ForensicFixCardProps {
    fix: Fix;
    resumeTitle?: string | null;
    onFix: () => void;
    onNext?: () => void;
    isFallback?: boolean;
}

const ForensicFixCard: React.FC<ForensicFixCardProps> = ({ fix, resumeTitle, onFix, onNext, isFallback = false }) => {
    // Helper to extract country from title if present (e.g. "Title (Germany)")
    const getCountryBadge = (title: string) => {
        const match = title.match(/\((.*?)\)/);
        if (match) return match[1];
        return "Global Standard";
    };

    const country = getCountryBadge(fix.title);
    const cleanTitle = fix.title.replace(/\(.*?\)/, '').trim();

    return (
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col group transition-all hover:shadow-2xl hover:border-blue-200/50">
            {/* 1. HEADER: Context & Stakes */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-slate-200 text-slate-600">
                            {country}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            • {resumeTitle ? `Checking "${resumeTitle}"` : "General Audit"}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="bg-red-100 text-red-600 p-1 rounded-md">
                            <AlertTriangle className="w-4 h-4" />
                        </span>
                        {cleanTitle}
                    </h3>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-sm border border-emerald-100 shadow-sm flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        +{fix.points} PTS
                    </div>
                </div>
            </div>

            {/* 2. THE CRIME SCENE: Before vs After */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current (The Error) */}
                <div className="bg-red-50/50 rounded-xl p-4 border border-red-100 relative group/bad">
                    <div className="absolute top-3 right-3 opacity-50">
                        <XCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest mb-2">
                        DETECTED ISSUE
                    </p>
                    <p className="font-medium text-slate-600 line-through decoration-red-300 decoration-2 opacity-80 text-sm">
                        "{fix.current}"
                    </p>
                </div>

                {/* Suggested (The Fix) */}
                <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 relative group/good">
                    <div className="absolute top-3 right-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-2">
                        OPTIMIZED FORMAT
                    </p>
                    <p className="font-bold text-slate-900 text-sm leading-relaxed">
                        "{fix.suggested}"
                    </p>
                </div>
            </div>

            {/* 3. THE VERDICT: Dominator Footer */}
            <div className="bg-slate-900 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-auto">
                <div className="flex gap-3">
                    <div className="mt-0.5 shrink-0">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                            COMPLIANCE WARNING
                        </p>
                        <p className="text-sm font-medium text-slate-200 leading-snug max-w-2xl">
                            {fix.reasoning || "This error may cause automated rejection by ATS parsers. Correct immediately."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {onNext && isFallback && (
                        <button
                            onClick={onNext}
                            className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            title="Next Tip"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    )}

                    <button
                        onClick={onFix}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-100 active:scale-95 transition-all shadow-lg shadow-white/10"
                    >
                        Fix Now <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForensicFixCard;
