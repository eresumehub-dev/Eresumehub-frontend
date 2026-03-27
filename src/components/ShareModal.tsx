import React, { useState } from 'react';
import { X, Copy, Check, Mail, MessageCircle, Globe, Lock, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import { Resume, updateResume } from '../services/resume';

interface ShareModalProps {
    resume: Resume;
    username: string;
    onClose: () => void;
    onUpdate: (updated: Resume) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ resume, username, onClose, onUpdate }) => {
    const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>(resume.visibility || 'public');
    const [isUpdating, setIsUpdating] = useState(false);
    const [copied, setCopied] = useState(false);

    const publicUrl = `${window.location.origin}/${username}/${resume.slug}`;

    const handleVisibilityChange = async (newVal: 'public' | 'unlisted' | 'private') => {
        setIsUpdating(true);
        try {
            const updated = await updateResume(resume.id, { visibility: newVal });
            setVisibility(newVal);
            onUpdate(updated);
        } catch (error) {
            console.error('Failed to update visibility', error);
            alert('Failed to update visibility settings');
        } finally {
            setIsUpdating(false);
        }
    };

    const copyToClipboard = () => {
        if (visibility === 'private') return;
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareEmail = () => {
        const subject = encodeURIComponent(`Resume: ${resume.title}`);
        const body = encodeURIComponent(`Hi,\n\nI'm sharing my resume with you: ${publicUrl}\n\nBest regards.`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
    };

    const shareWhatsApp = () => {
        const text = encodeURIComponent(`Hi, here's my resume: ${publicUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const isShareable = visibility !== 'private';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Share Resume</h2>
                        <p className="text-sm text-slate-500 mt-0.5 truncate max-w-[300px]">{resume.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Visibility Settings */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Who can view this?</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'public', label: 'Public', icon: Globe, desc: 'Anyone' },
                                { id: 'unlisted', label: 'Unlisted', icon: Lock, desc: 'Link only' },
                                { id: 'private', label: 'Private', icon: EyeOff, desc: 'Only you' },
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleVisibilityChange(opt.id as 'public' | 'unlisted' | 'private')}
                                    disabled={isUpdating}
                                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${visibility === opt.id
                                        ? 'border-[#0A2A6B] bg-[#0A2A6B]/5 text-[#0A2A6B]'
                                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                                        }`}
                                >
                                    <opt.icon className={`w-5 h-5 mb-2 ${visibility === opt.id ? 'text-[#0A2A6B]' : 'text-slate-400'}`} />
                                    <span className="text-xs font-bold uppercase tracking-tighter">{opt.label}</span>
                                    <span className="text-[10px] opacity-60 mt-0.5">{opt.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Copy Link Section */}
                    <div className={!isShareable ? 'opacity-40 grayscale pointer-events-none transition-all' : 'transition-all'}>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                            Shareable Link
                            {copied && <span className="text-emerald-600 flex items-center gap-1 normal-case font-bold"><Check className="w-3 h-3" /> Copied!</span>}
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 font-medium truncate">
                                {publicUrl}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="px-5 py-3 bg-[#0A2A6B] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#0A2A6B]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Warning for Private */}
                    {!isShareable && (
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                This resume is currently <strong>Private</strong>. Change visibility to <strong>Public</strong> or <strong>Unlisted</strong> to enable sharing.
                            </p>
                        </div>
                    )}

                    {/* Quick Social Shares */}
                    <div className={`pt-4 grid grid-cols-2 gap-4 ${!isShareable ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                        <button
                            onClick={shareEmail}
                            className="flex items-center justify-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-700 font-bold text-sm transition-all border border-slate-100"
                        >
                            <Mail className="w-5 h-5 text-red-500" />
                            Email Link
                        </button>
                        <button
                            onClick={shareWhatsApp}
                            className="flex items-center justify-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-700 font-bold text-sm transition-all border border-slate-100"
                        >
                            <MessageCircle className="w-5 h-5 text-emerald-500" />
                            WhatsApp
                        </button>
                    </div>
                </div>

                {isUpdating && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#0A2A6B]" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShareModal;
