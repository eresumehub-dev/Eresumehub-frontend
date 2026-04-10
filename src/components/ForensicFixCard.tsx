import React from 'react';
import { AlertTriangle, Zap, CheckCircle2, XCircle } from 'lucide-react';

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

const ForensicFixCard: React.FC<ForensicFixCardProps> = ({ fix, onFix }) => {
    // Helper to extract country from title if present (e.g. "Title (Germany)")
    const getCountryBadge = (title: string) => {
        const match = title.match(/\((.*?)\)/);
        if (match) return match[1];
        return "Global Standard";
    };

    const country = getCountryBadge(fix.title);
    const cleanTitle = fix.title.replace(/\(.*?\)/, '').trim();

    return (
        <div className="bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-black/[0.03] p-5 flex flex-col">
            {/* Header Row */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#FF3B30]/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4 text-[#FF3B30]" strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#86868B] flex items-center gap-1.5">
                            {country} <span className="opacity-50">•</span> Insight
                        </div>
                        <h3 className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight mt-0.5">
                            {cleanTitle}
                        </h3>
                    </div>
                </div>
                <div className="inline-flex bg-[#34C759]/10 text-[#34C759] px-2 py-1 rounded-lg font-bold text-[11px] items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-current" /> +{fix.points}
                </div>
            </div>

            {/* Minimalist Before/After Box */}
            <div className="bg-[#F5F5F7] rounded-[1rem] p-3.5 mb-4 space-y-2.5">
                <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-[#FF3B30]/60 shrink-0 mt-0.5" />
                    <p className="text-[13px] text-[#86868B] font-medium line-through decoration-[#FF3B30]/30 decoration-2 italic">
                        "{fix.current}"
                    </p>
                </div>
                <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0 mt-0.5" />
                    <p className="text-[13px] text-[#1D1D1F] font-medium leading-relaxed">
                        "{fix.suggested}"
                    </p>
                </div>
            </div>

            {/* Footer / Call to Action */}
            <div className="flex items-center justify-between gap-4 mt-auto">
                <p className="text-[11px] text-[#86868B] leading-snug font-medium flex-1">
                    {fix.reasoning || "Readers are skimming. Missing specific metrics can reduce callback rates by 40%."}
                </p>
                <button 
                    onClick={onFix}
                    className="px-4 py-2 bg-[#1D1D1F] text-white rounded-[10px] text-[12px] font-bold shadow-sm hover:bg-black active:scale-[0.98] transition-all shrink-0"
                >
                    Fix Now
                </button>
            </div>
        </div>
    );
};

export default ForensicFixCard;
