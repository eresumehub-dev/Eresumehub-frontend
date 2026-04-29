import React from 'react';
import { 
  Zap, 
  X, 
  ArrowRight, 
  ShieldAlert, 
  MousePointer2, 
  Target 
} from 'lucide-react';
import { MagicNudge as MagicNudgeType } from '../../services/analytics';

interface MagicNudgeProps {
  nudge: MagicNudgeType;
  onDismiss: (type: string, resumeId: string, confidence: number) => void;
  onAction: (resumeId: string) => void;
}

const MagicNudge: React.FC<MagicNudgeProps> = ({ nudge, onDismiss, onAction }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'weak_hook': return <ShieldAlert className="w-6 h-6 text-amber-400" />;
      case 'conversion_leak': return <Target className="w-6 h-6 text-indigo-400" />;
      default: return <Zap className="w-6 h-6 text-blue-400" />;
    }
  };

  return (
    <div className="relative group overflow-hidden rounded-[1.5rem] border border-black/[0.04] bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      {/* 🔮 Intelligence Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#0066CC]/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-[#0066CC]/10 transition-all duration-700" />
      
      <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
        {/* 🧠 Diagnostic Icon Container */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#F5F5F7] border border-black/[0.02] flex items-center justify-center">
            {getIcon(nudge.type)}
        </div>

        <div className="flex-grow space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0066CC]/80 bg-[#0066CC]/5 px-2 py-0.5 rounded">
                Intelligence Trigger
            </span>
            <span className="text-[10px] font-medium text-[#86868B] italic">
                {nudge.resume_title}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
            {nudge.title}
          </h3>
          <p className="text-sm text-[#86868B] leading-relaxed max-w-2xl font-light">
            {nudge.message}
          </p>
        </div>

        {/* ⚡ Priority CTA Container */}
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0 pl-0 md:pl-6 border-l-0 md:border-l border-black/[0.04]">
          <div className="text-center">
             <div className="text-[10px] font-bold text-[#86868B]/40 uppercase tracking-tighter mb-1">
                Confidence
             </div>
             <div className="flex items-center gap-1.5 justify-center">
                <div className="w-12 h-1 bg-[#F5F5F7] rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#0066CC]"
                        style={{ width: `${nudge.confidence * 100}%` }}
                    />
                </div>
                <span className="text-xs font-mono text-[#86868B]">{Math.round(nudge.confidence * 100)}%</span>
             </div>
          </div>

          <button 
            onClick={() => onAction(nudge.resume_id)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1D1D1F] text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
          >
            {nudge.action}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 🤏 Close / Dismiss */}
        <button 
          onClick={() => onDismiss(nudge.type, nudge.resume_id, nudge.confidence)}
          className="absolute top-0 right-0 p-2 text-[#86868B]/40 hover:text-[#FF3B30] transition-colors"
          title="Dismiss optimization"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 🚀 Impact Badge */}
      <div className="mt-4 pt-4 border-t border-black/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-[#86868B]">
                <MousePointer2 className="w-3 h-3" />
                <span>Impact: <span className="text-[#34C759] font-bold">{nudge.impact}</span></span>
            </div>
            <div className="text-[10px] font-medium text-[#86868B]/40 italic">
                Triggered based on v14.0 Autonomous Engine
            </div>
      </div>
    </div>
  );
};

export default MagicNudge;
