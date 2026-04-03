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
    <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0B]/80 backdrop-blur-xl p-6 transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.05)]">
      {/* 🔮 Intelligence Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />
      
      <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
        {/* 🧠 Diagnostic Icon Container */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
            {getIcon(nudge.type)}
        </div>

        <div className="flex-grow space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400/80 bg-blue-400/5 px-2 py-0.5 rounded">
                Intelligence Trigger
            </span>
            <span className="text-[10px] font-medium text-white/40 italic">
                {nudge.resume_title}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white tracking-tight">
            {nudge.title}
          </h3>
          <p className="text-sm text-white/60 leading-relaxed max-w-2xl">
            {nudge.message}
          </p>
        </div>

        {/* ⚡ Priority CTA Container */}
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0 pl-0 md:pl-6 border-l-0 md:border-l border-white/5">
          <div className="text-center">
             <div className="text-[10px] font-bold text-white/30 uppercase tracking-tighter mb-1">
                Confidence
             </div>
             <div className="flex items-center gap-1.5 justify-center">
                <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        style={{ width: `${nudge.confidence * 100}%` }}
                    />
                </div>
                <span className="text-xs font-mono text-white/50">{Math.round(nudge.confidence * 100)}%</span>
             </div>
          </div>

          <button 
            onClick={() => onAction(nudge.resume_id)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-black text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/90 active:scale-95 transition-all shadow-lg"
          >
            {nudge.action}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 🤏 Close / Dismiss */}
        <button 
          onClick={() => onDismiss(nudge.type, nudge.resume_id, nudge.confidence)}
          className="absolute top-0 right-0 p-2 text-white/20 hover:text-white/60 transition-colors"
          title="Dismiss optimization"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 🚀 Impact Badge */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-white/40">
                <MousePointer2 className="w-3 h-3" />
                <span>Impact: <span className="text-emerald-400">{nudge.impact}</span></span>
            </div>
            <div className="text-[10px] font-medium text-white/20 italic">
                Triggered based on v14.0 Autonomous Engine
            </div>
      </div>
    </div>
  );
};

export default MagicNudge;
