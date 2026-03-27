import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Check, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RefineTooltipProps {
    visible: boolean;
    position: { x: number; y: number };
    selectedText: string;
    sectionId: string; // The data-path
    onRefine: (instruction: string, sectionId: string) => Promise<void>;
    onClose: () => void;
}

const RefineTooltip: React.FC<RefineTooltipProps> = ({
    visible,
    position,
    selectedText,
    sectionId,
    onRefine,
    onClose
}) => {
    const [instruction, setInstruction] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on appear
    useEffect(() => {
        if (visible && status === 'idle') {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [visible, status]);

    // Reset when hidden
    useEffect(() => {
        if (!visible) {
            setInstruction('');
            setStatus('idle');
        }
    }, [visible]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!instruction.trim()) return;

        setStatus('loading');
        try {
            await onRefine(instruction, sectionId);
            setStatus('success');
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error(error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    if (!visible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-slate-200 p-3 w-80 font-sans"
                style={{
                    left: Math.min(window.innerWidth - 340, Math.max(20, position.x - 160)),
                    top: position.y - 80 // Position above selection
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-indigo-600">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">AI Magic Edit</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Content based on status */}
                {status === 'loading' ? (
                    <div className="py-4 flex flex-col items-center justify-center text-center space-y-2">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                        <p className="text-xs font-medium text-slate-500 animate-pulse">Refining text...</p>
                    </div>
                ) : status === 'success' ? (
                    <div className="py-4 flex flex-col items-center justify-center text-center space-y-2">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-emerald-600">Updated Successfully!</p>
                    </div>
                ) : status === 'error' ? (
                    <div className="py-4 text-center">
                        <p className="text-xs font-bold text-red-500">Failed to refine. Try again.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="bg-slate-50 rounded-lg p-2 mb-2 text-xs text-slate-500 italic border border-slate-100 line-clamp-2">
                            "{selectedText}"
                        </div>
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={instruction}
                                onChange={(e) => setInstruction(e.target.value)}
                                placeholder="e.g. Remove the phone part..."
                                className="w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            />
                            <button
                                type="submit"
                                disabled={!instruction.trim()}
                                className="absolute right-1 top-1 p-1.5 bg-indigo-600 text-white rounded-md disabled:opacity-50 hover:bg-indigo-700 transition-all"
                            >
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default RefineTooltip;
