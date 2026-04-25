import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AIMotivationModalProps {
    isOpen: boolean;
    onClose: () => void;
    draft: string | null;
    isLoading: boolean;
}

const AIMotivationModal: React.FC<AIMotivationModalProps> = ({ isOpen, onClose, draft, isLoading }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        if (draft) {
            navigator.clipboard.writeText(draft);
            setCopied(true);
            toast.success("Motivation draft copied!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.1)] border border-black/[0.03] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-black/[0.04] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-[#1D1D1F]" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-[17px] font-semibold text-[#1D1D1F]">AI Motivation Draft</h3>
                                    <p className="text-[12px] text-[#86868B] font-medium uppercase tracking-widest">Optimized for Japanese Market</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors">
                                <X className="w-5 h-5 text-[#86868B]" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#1D1D1F]" strokeWidth={1.5} />
                                    <p className="text-[14px] text-[#86868B] font-medium animate-pulse">Engineering your draft...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-6 bg-[#F5F5F7] rounded-2xl border border-black/[0.02]">
                                        <p className="text-[15px] text-[#434345] leading-relaxed whitespace-pre-wrap font-light">
                                            {draft || "No draft generated yet."}
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <button
                                            onClick={handleCopy}
                                            disabled={!draft}
                                            className="w-full sm:flex-1 bg-[#1D1D1F] text-white py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            {copied ? 'Copied to Clipboard' : 'Copy and Review'}
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="w-full sm:w-auto px-8 py-4 bg-white text-[#1D1D1F] border border-black/[0.08] rounded-xl font-bold text-[15px] hover:bg-[#F5F5F7] transition-all"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                    
                                    <p className="text-[11px] text-[#86868B] text-center px-4">
                                        AI drafts are meant as a starting point. Always review and personalize your motivation statement to reflect your unique voice and goals.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AIMotivationModal;
