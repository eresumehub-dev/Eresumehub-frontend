import React, { useState, useEffect, useRef, useCallback } from 'react';
import RefineTooltip from '../components/RefineTooltip';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Clock, Check, AlertCircle,
    Copy, Archive, GitBranch, Star, Sparkles, MoreVertical,
    Eye, FileText, ArrowUpRight, TrendingUp, Wand2, Plus, X, AlignLeft,
    Loader2, User, Briefcase, GraduationCap, Globe, CheckCircle2, AlertTriangle
} from 'lucide-react';

import {
    getResume,
    updateResume,
    cloneResume,
    createVersion,
    getScoreHistory,
    archiveResume,
    setDefaultResume,
    enhanceResume
} from '../services/resume';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '../hooks/useDebounce';
import { Resume } from '../services/resume';
import api from '../services/api';

// ─── Toast Notification System ────────────────────────────────────────────────
// FIX #6: Replaces all alert() / confirm() native dialogs with non-blocking toasts.
type ToastType = 'success' | 'error' | 'info' | 'warning';
interface Toast { id: number; message: string; type: ToastType; }

const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: number) => void }> = ({ toasts, onRemove }) => (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
            {toasts.map(t => (
                <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-[1rem] shadow-2xl text-[13px] font-medium min-w-[260px] max-w-[360px] ${
                        t.type === 'success' ? 'bg-[#1D1D1F] text-white' :
                        t.type === 'error'   ? 'bg-[#FF3B30] text-white' :
                        t.type === 'warning' ? 'bg-[#FF9F0A] text-white' :
                        'bg-white border border-black/[0.08] text-[#1D1D1F] shadow-xl'
                    }`}
                >
                    {t.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                    {t.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
                    {t.type === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0" />}
                    <span className="flex-1">{t.message}</span>
                    <button onClick={() => onRemove(t.id)} className="opacity-60 hover:opacity-100 transition-opacity">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </motion.div>
            ))}
        </AnimatePresence>
    </div>
);

// ─── Confirm Dialog (replaces window.confirm) ─────────────────────────────────
interface ConfirmDialogProps {
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ message, confirmLabel = 'Confirm', onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[1.5rem] shadow-2xl border border-black/[0.06] p-8 max-w-sm w-full mx-4"
        >
            <AlertTriangle className="w-8 h-8 text-[#FF9F0A] mb-4" />
            <p className="text-[15px] font-medium text-[#1D1D1F] mb-6 leading-relaxed">{message}</p>
            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 py-2.5 px-4 bg-[#F5F5F7] text-[#1D1D1F] rounded-full text-[13px] font-semibold hover:bg-[#E8E8ED] transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="flex-1 py-2.5 px-4 bg-[#FF3B30] text-white rounded-full text-[13px] font-semibold hover:bg-[#D70015] transition-colors"
                >
                    {confirmLabel}
                </button>
            </div>
        </motion.div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ResumeEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const incomingSuggestion = location.state?.suggestion;

    // Resume state
    const [resume, setResume] = useState<Resume | null>(null);
    const [resumeContent, setResumeContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showSuggestion, setShowSuggestion] = useState(true);

    // Save state
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    // FIX #7: Dirty flag prevents auto-save from firing on initial load
    const isDirty = useRef(false);

    // ATS Score state
    const [currentScore, setCurrentScore] = useState<number>(0);
    const [scoreHistory, setScoreHistory] = useState<any[]>([]);

    // UI state
    const [showActions, setShowActions] = useState(false);
    const [previewTimestamp, setPreviewTimestamp] = useState<number>(Date.now());
    const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

    // Toast system
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastCounter = useRef(0);
    const toast = useCallback((message: string, type: ToastType = 'info') => {
        const id = ++toastCounter.current;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);
    const removeToast = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

    // Confirm dialog state
    const [confirm, setConfirm] = useState<{ message: string; label?: string; onConfirm: () => void } | null>(null);
    const showConfirm = (message: string, label: string, onConfirm: () => void) => {
        setConfirm({ message, label, onConfirm });
    };

    // Debounced content for auto-save
    const debouncedContent = useDebounce(resumeContent, 2000);

    // Load resume
    useEffect(() => {
        if (!id) return;

        const loadResumeData = async () => {
            try {
                setLoading(true);
                // FIX #1 is in resume.ts — getResume now calls /resume/${id} (singular)
                const data = await getResume(id);
                setResume(data);
                setResumeContent(data.resume_data);
                setCurrentScore(data.ats_score || data.resume_data?.score || 0);

                // FIX #3: getScoreHistory endpoint corrected in resume.ts
                try {
                    const scores = await getScoreHistory(id);
                    setScoreHistory(scores || []);
                } catch {
                    // Score history is non-critical; don't block the editor
                    setScoreHistory([]);
                }

                setLoading(false);
            } catch (error) {
                console.error('Failed to load resume:', error);
                setLoading(false);
            }
        };

        loadResumeData();
    }, [id]);

    const queryClient = useQueryClient();
    const updateMutation = useMutation({
        mutationFn: (data: any) => updateResume(id!, data),
        onSuccess: (_data: any, variables: any) => {
            setSaveStatus('saved');
            setLastSaved(new Date());
            isDirty.current = false;

            queryClient.invalidateQueries({ queryKey: ['resume', id] });
            queryClient.invalidateQueries({ queryKey: ['resumes'] });

            if (variables.regenerate_pdf) {
                // Let the user know the PDF is rendering
                toast('Rendering updated PDF...', 'info');
                
                // Add a 4-second delay to allow the backend PDF pipeline to finish and upload
                setTimeout(() => {
                    setPreviewTimestamp(Date.now());
                    toast('PDF updated successfully!', 'success');
                }, 4000); 

                // Keep the score history fetch slightly after the PDF
                setTimeout(async () => {
                    if (!id) return;
                    try {
                        const scores = await getScoreHistory(id);
                        if (scores && scores.length > 0) {
                            setCurrentScore(scores[0].score);
                            setScoreHistory(scores);
                        }
                    } catch {}
                }, 5000);
            }
        },
        // FIX #8: Don't access updateMutation.variables here — use the closure variable
        onError: (_error: any, variables: any) => {
            console.error('Save failed:', _error);
            setSaveStatus('error');
            if (variables.regenerate_pdf) {
                toast('Failed to save and refresh preview. Please try again.', 'error');
            } else {
                toast('Auto-save failed. Your changes are not saved.', 'warning');
            }
        }
    });

    // Auto-save when content changes
    // FIX #7: Only save when content has been intentionally changed (isDirty flag)
    useEffect(() => {
        if (!debouncedContent || !resume || loading || !isDirty.current) return;

        setSaveStatus('saving');
        updateMutation.mutate({
            resume_data: debouncedContent,
            regenerate_pdf: false
        });
    }, [debouncedContent, resume?.id]);

    // Warn user about unsaved changes before navigating away (FIX #12)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty.current) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    const handleManualSave = () => {
        if (!resume || !resumeContent) return;
        setSaveStatus('saving');
        updateMutation.mutate({
            resume_data: resumeContent,
            regenerate_pdf: true
        });
    };

    const handleContentChange = (field: string, value: any) => {
        isDirty.current = true;
        setResumeContent((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClone = async () => {
        if (!resume) return;
        try {
            const cloned = await cloneResume(resume.id, `${resume.title} (Copy)`);
            navigate(`/resume/edit/${cloned.id}`);
            toast('Resume cloned successfully!', 'success');
        } catch (error) {
            console.error('Clone failed:', error);
            toast('Failed to clone resume. Please try again.', 'error');
        }
    };

    const handleCreateVersion = async () => {
        if (!resume) return;
        try {
            await createVersion(resume.id);
            toast('Version snapshot saved!', 'success');
        } catch (error) {
            console.error('Version creation failed:', error);
            toast('Failed to save version. Please try again.', 'error');
        }
    };

    const handleArchive = async () => {
        if (!resume) return;
        // FIX #6: Replace window.confirm with custom dialog
        showConfirm(
            'Archive this resume? It will be hidden from your dashboard but can be restored later.',
            'Archive',
            async () => {
                setConfirm(null);
                try {
                    await archiveResume(resume.id);
                    navigate('/dashboard');
                } catch (error) {
                    console.error('Archive failed:', error);
                    toast('Failed to archive resume. Please try again.', 'error');
                }
            }
        );
    };

    const handleSetDefault = async () => {
        if (!resume) return;
        try {
            await setDefaultResume(resume.id);
            toast('Set as your default resume!', 'success');
        } catch (error) {
            console.error('Set default failed:', error);
            toast('Failed to set default. Please try again.', 'error');
        }
    };

    const handleEnhanceWithAI = async () => {
        if (!resume) return;
        try {
            setSaveStatus('saving');
            // FIX #4: enhanceResume in resume.ts now calls /resume/${id}/enhance (singular)
            const enhancedResume = await enhanceResume(resume.id);
            setResume(enhancedResume);
            setResumeContent(enhancedResume.resume_data);
            setCurrentScore(enhancedResume.ats_score || enhancedResume.resume_data?.score || 0);
            setSaveStatus('saved');
            setLastSaved(new Date());
            isDirty.current = false;
            setPreviewTimestamp(Date.now());
            toast('Resume enhanced with AI successfully!', 'success');
        } catch (error: any) {
            console.error('Enhancement failed:', error);
            setSaveStatus('error');
            toast(`Enhancement failed: ${error.message || 'Unknown error'}`, 'error');
        }
    };

    // AI Refinement Logic
    const [refineState, setRefineState] = useState<{
        visible: boolean;
        position: { x: number; y: number };
        selectedText: string;
        sectionId: string;
    }>({
        visible: false,
        position: { x: 0, y: 0 },
        selectedText: '',
        sectionId: ''
    });

    const handleTextSelect = (e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>, sectionId: string) => {
        const target = e.currentTarget;
        const start = target.selectionStart;
        const end = target.selectionEnd;

        if (start !== null && end !== null && start !== end) {
            const text = target.value.substring(start, end);
            if (text.trim().length > 3) {
                const rect = target.getBoundingClientRect();
                setRefineState({
                    visible: true,
                    position: {
                        x: rect.left + (rect.width / 2),
                        y: rect.top + window.scrollY - 100
                    },
                    selectedText: text,
                    sectionId: sectionId
                });
                return;
            }
        }
    };

    const handleRefineSubmit = async (instruction: string, sectionId: string) => {
        if (!resume) return;
        // FIX #2: This endpoint /resume/refine now needs to be added to resume_routes.py.
        // The frontend call is correct; see resume_routes.py patch in the audit output.
        try {
            const response = await api.post('/resume/refine', {
                resumeId: resume.id,
                selectedText: refineState.selectedText,
                userInstruction: instruction,
                sectionId: sectionId
            });

            const data = response.data;
            if (data.success && data.updatedText) {
                isDirty.current = true;
                setResumeContent((prev: any) => {
                    const newState = JSON.parse(JSON.stringify(prev));
                    const keys = sectionId.replace(/\]/g, '').split(/[.[]/);
                    let current = newState;
                    for (let i = 0; i < keys.length - 1; i++) {
                        if (!current[keys[i]]) current[keys[i]] = {};
                        current = current[keys[i]];
                    }
                    const lastKey = keys[keys.length - 1];
                    const oldValue = current[lastKey];

                    if (typeof oldValue === 'string') {
                        current[lastKey] = oldValue.replace(refineState.selectedText, data.updatedText);
                    } else {
                        current[lastKey] = data.updatedText;
                    }
                    return newState;
                });
            } else {
                throw new Error(data.error || 'Refinement failed');
            }
        } catch (error) {
            console.error('Refine error:', error);
            throw error;
        }
    };

    // FIX #11: Normalize language entries — backend can return strings OR objects
    const normalizeLang = (lang: any): { language: string; proficiency: string } => {
        if (typeof lang === 'string') return { language: lang, proficiency: '' };
        return { language: lang?.language || '', proficiency: lang?.proficiency || '' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F5F5F7] font-['IBM_Plex_Sans']">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-[#1D1D1F] animate-spin" />
                    <p className="text-[12px] font-bold text-[#86868B] uppercase tracking-widest">Opening Workspace</p>
                </div>
            </div>
        );
    }

    if (!resume) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#F5F5F7]">
                <div className="text-center bg-white p-12 rounded-[2rem] shadow-xl border border-black/[0.04]">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-[#1D1D1F] font-bold">Resume not found</p>
                    <p className="text-[13px] text-[#86868B] mt-2">This resume may have been deleted or you don't have access to it.</p>
                    <button onClick={() => navigate('/dashboard')} className="mt-6 text-[#0066CC] font-bold hover:underline">Back to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#F5F5F7] font-['IBM_Plex_Sans'] text-[#1D1D1F] selection:bg-[#1D1D1F] selection:text-white overflow-hidden">

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* Confirm Dialog */}
            <AnimatePresence>
                {confirm && (
                    <ConfirmDialog
                        message={confirm.message}
                        confirmLabel={confirm.label}
                        onConfirm={confirm.onConfirm}
                        onCancel={() => setConfirm(null)}
                    />
                )}
            </AnimatePresence>

            {/* AI Refine Tooltip */}
            <RefineTooltip
                visible={refineState.visible}
                position={refineState.position}
                selectedText={refineState.selectedText}
                sectionId={refineState.sectionId}
                onRefine={handleRefineSubmit}
                onClose={() => setRefineState(prev => ({ ...prev, visible: false }))}
            />

            {/* ── HEADER ─────────────────────────────────────────────── */}
            <header className="shrink-0 h-16 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] flex items-center px-4 sm:px-6 gap-3 sm:gap-4 z-50 shadow-sm">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-9 h-9 flex items-center justify-center hover:bg-[#F5F5F7] rounded-full transition-colors focus:outline-none"
                >
                    <ChevronLeft className="w-5 h-5 text-[#1D1D1F]" />
                </button>

                <div className="flex-1 min-w-0">
                    <h1 className="text-[14px] font-bold text-[#1D1D1F] truncate">{resume.title}</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        {saveStatus === 'saved' && lastSaved && (
                            <div className="flex items-center gap-1 text-[11px] text-[#86868B]">
                                <Check className="w-3 h-3 text-[#34C759]" />
                                <span>Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        )}
                        {saveStatus === 'saving' && (
                            <div className="flex items-center gap-1 text-[11px] text-[#86868B]">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Saving...</span>
                            </div>
                        )}
                        {saveStatus === 'error' && (
                            <div className="flex items-center gap-1 text-[11px] text-[#FF3B30]">
                                <AlertCircle className="w-3 h-3" />
                                <span>Save failed</span>
                            </div>
                        )}
                        {saveStatus === 'saved' && !lastSaved && (
                            <div className="flex items-center gap-1 text-[11px] text-[#86868B]">
                                <Clock className="w-3 h-3" />
                                <span>Auto-save on</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ATS Score Badge */}
                {currentScore > 0 && (
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#F5F5F7] rounded-full">
                        <div className={`w-2 h-2 rounded-full ${currentScore >= 80 ? 'bg-[#34C759]' : currentScore >= 60 ? 'bg-[#FF9F0A]' : 'bg-[#FF3B30]'}`}></div>
                        <span className="text-[13px] font-bold text-[#1D1D1F]">{currentScore}</span>
                        <span className="text-[11px] text-[#86868B] font-medium">ATS</span>
                        {/* FIX #14: Guard scoreHistory[1] access */}
                        {scoreHistory.length >= 2 && (
                            <div className="flex items-center gap-0.5 text-[11px]">
                                {currentScore > scoreHistory[1].score ? (
                                    <>
                                        <TrendingUp className="w-2.5 h-2.5 text-[#34C759]" />
                                        <span className="text-[#34C759]">+{currentScore - scoreHistory[1].score}</span>
                                    </>
                                ) : (
                                    <span className="text-[#86868B]">OPT.</span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={handleEnhanceWithAI}
                    disabled={saveStatus === 'saving'}
                    className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#AF52DE] text-white rounded-full text-[13px] font-semibold shadow-[0_8px_20px_rgba(175,82,222,0.3)] hover:bg-[#9741C4] active:scale-95 transition-all disabled:opacity-50"
                >
                    <Sparkles className="w-4 h-4" /> Enhance with AI
                </button>

                <button
                    onClick={async () => {
                        if (!resume || !resumeContent) return;
                        try {
                            setSaveStatus('saving');
                            await updateResume(resume.id, {
                                resume_data: resumeContent,
                                regenerate_pdf: false
                            });
                            isDirty.current = false;
                            setSaveStatus('saved');
                            setLastSaved(new Date());
                            navigate('/dashboard');
                        } catch (error) {
                            setSaveStatus('error');
                            toast('Failed to save. Please try again.', 'error');
                        }
                    }}
                    disabled={saveStatus === 'saving'}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-black/[0.08] text-[#1D1D1F] rounded-full text-[13px] font-semibold hover:bg-[#F5F5F7] active:scale-95 transition-all shadow-sm"
                >
                    {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin text-[#0066CC]" /> : <Check className="w-4 h-4 text-[#34C759]" />}
                    Save & Finish
                </button>

                <button
                    onClick={handleManualSave}
                    disabled={saveStatus === 'saving'}
                    className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-[#1D1D1F] text-white rounded-full text-[13px] font-semibold hover:bg-black active:scale-95 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
                >
                    {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    Save & Refresh
                </button>

                <div className="relative">
                    <button
                        onClick={() => setShowActions(!showActions)}
                        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-[#F5F5F7] hover:bg-[#E8E8ED] rounded-full transition-colors focus:outline-none"
                    >
                        <MoreVertical className="w-5 h-5 text-[#1D1D1F]" />
                    </button>
                    <AnimatePresence>
                        {showActions && (
                            <>
                                {/* Backdrop to close menu */}
                                <div className="fixed inset-0 z-[99]" onClick={() => setShowActions(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-xl rounded-[1.25rem] shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-black/[0.04] py-2.5 z-[100] overflow-hidden"
                                >
                                    {/* Mobile Only: Save Actions */}
                                    <div className="sm:hidden border-b border-black/[0.04] mb-2 pb-2">
                                        <button onClick={() => { handleManualSave(); setShowActions(false); }} className="w-full text-left px-5 py-3 hover:bg-black/[0.03] flex items-center gap-3 text-[14px] font-bold text-[#0066CC]">
                                            <Wand2 className="w-4 h-4" /> Save & Refresh
                                        </button>
                                        <button onClick={() => { handleEnhanceWithAI(); setShowActions(false); }} className="w-full text-left px-5 py-3 hover:bg-black/[0.03] flex items-center gap-3 text-[14px] font-bold text-[#AF52DE]">
                                            <Sparkles className="w-4 h-4" /> AI Enhance
                                        </button>
                                    </div>

                                    <button onClick={() => { handleClone(); setShowActions(false); }} className="w-full text-left px-5 py-3 hover:bg-black/[0.03] flex items-center gap-3 text-[14px] font-medium text-[#1D1D1F]">
                                        <Copy className="w-4 h-4 text-[#86868B]" /> Clone Resume
                                    </button>
                                    <button onClick={() => { handleCreateVersion(); setShowActions(false); }} className="w-full text-left px-5 py-3 hover:bg-black/[0.03] flex items-center gap-3 text-[14px] font-medium text-[#1D1D1F]">
                                        <GitBranch className="w-4 h-4 text-[#86868B]" /> Save Version
                                    </button>
                                    <button onClick={() => { handleSetDefault(); setShowActions(false); }} className="w-full text-left px-5 py-3 hover:bg-black/[0.03] flex items-center gap-3 text-[14px] font-medium text-[#1D1D1F]">
                                        <Star className="w-4 h-4 text-[#86868B]" /> Set as Default
                                    </button>
                                    <div className="h-px bg-black/[0.04] my-2 mx-5"></div>
                                    <button onClick={() => { setShowActions(false); handleArchive(); }} className="w-full text-left px-5 py-3 hover:bg-red-50 flex items-center gap-3 text-[14px] font-medium text-[#FF3B30]">
                                        <Archive className="w-4 h-4" /> Archive
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* ── MOBILE TABS ────────────────────────────────────────── */}
            <div className="lg:hidden p-4 bg-white border-b border-black/[0.04] shrink-0 z-40">
                <div className="flex bg-[#F5F5F7] p-1 rounded-[1rem]">
                    <button
                        onClick={() => setMobileTab('editor')}
                        className={`flex-1 py-2 text-[13px] font-medium rounded-[12px] transition-all duration-300 ${mobileTab === 'editor' ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B]'}`}
                    >
                        Editor
                    </button>
                    <button
                        onClick={() => setMobileTab('preview')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-[13px] font-medium rounded-[12px] transition-all duration-300 ${mobileTab === 'preview' ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B]'}`}
                    >
                        <Eye className="w-4 h-4" /> PDF Preview
                    </button>
                </div>
            </div>

            {/* ── MAIN WORKSPACE ─────────────────────────────────────── */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT PANE: Editor */}
                <main className={`w-full lg:w-[50%] overflow-y-auto bg-white relative custom-scrollbar ${mobileTab === 'editor' ? 'block' : 'hidden lg:block'} border-r border-black/[0.04]`}>
                    <div className="max-w-[700px] mx-auto p-6 md:p-10 space-y-12 pb-32">

                        {/* Premium AI Suggestion Card */}
                        <AnimatePresence>
                            {showSuggestion && incomingSuggestion && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -20 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -20 }}
                                    className="bg-[#FFF9F0] border border-[#FF9F0A]/20 rounded-[1.5rem] p-6 shadow-sm overflow-hidden"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-[#FF9F0A]/10 text-[#FF9F0A] rounded-[10px] flex items-center justify-center shrink-0 mt-1">
                                            <Wand2 className="w-5 h-5" strokeWidth={2} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-[15px] font-semibold text-[#1D1D1F]">AI Refinement Found</h4>
                                                <button onClick={() => setShowSuggestion(false)} className="text-[#86868B] hover:text-[#1D1D1F] transition-colors"><X className="w-4 h-4" /></button>
                                            </div>
                                            <p className="text-[14px] text-[#86868B] leading-relaxed font-light mb-4 text-justify">
                                                Replace <span className="line-through decoration-[#FF3B30]/40 text-[#1D1D1F]">"{incomingSuggestion.current}"</span> with <span className="font-medium text-[#34C759]">"{incomingSuggestion.suggested}"</span> to boost ATS impact.
                                            </p>
                                            {/* FIX #9: Apply suggestion actually patches the content now */}
                                            <button
                                                onClick={() => {
                                                    if (incomingSuggestion?.current && incomingSuggestion?.suggested) {
                                                        setResumeContent((prev: any) => {
                                                            const str = JSON.stringify(prev);
                                                            const updated = str.replace(
                                                                incomingSuggestion.current,
                                                                incomingSuggestion.suggested
                                                            );
                                                            return JSON.parse(updated);
                                                        });
                                                        isDirty.current = true;
                                                        toast(`Suggestion applied! (+${incomingSuggestion.points || 0} pts)`, 'success');
                                                    }
                                                    setShowSuggestion(false);
                                                }}
                                                className="px-4 py-2 bg-white border border-black/[0.06] rounded-[10px] text-[13px] font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] shadow-sm transition-all"
                                            >
                                                Apply Suggestion (+{incomingSuggestion.points} PTS)
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* SECTION: Personal Info */}
                        <section className="space-y-5">
                            <h3 className="text-[12px] font-bold text-[#86868B] uppercase tracking-widest flex items-center gap-2">
                                <User className="w-4 h-4" /> Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5 pl-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={resumeContent?.full_name || ''}
                                        onChange={(e) => handleContentChange('full_name', e.target.value)}
                                        className="w-full px-4 py-3.5 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-black/[0.08] focus:ring-4 focus:ring-black/5 transition-all outline-none text-[15px] font-medium text-[#1D1D1F] placeholder-[#86868B]/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5 pl-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={resumeContent?.contact?.email || ''}
                                        onChange={(e) => handleContentChange('contact', { ...resumeContent.contact, email: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-black/[0.08] focus:ring-4 focus:ring-black/5 transition-all outline-none text-[15px] font-medium text-[#1D1D1F] placeholder-[#86868B]/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5 pl-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={resumeContent?.contact?.phone || ''}
                                        onChange={(e) => handleContentChange('contact', { ...resumeContent.contact, phone: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-black/[0.08] focus:ring-4 focus:ring-black/5 transition-all outline-none text-[15px] font-medium text-[#1D1D1F] placeholder-[#86868B]/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5 pl-1">City</label>
                                    <input
                                        type="text"
                                        value={resumeContent?.contact?.city || ''}
                                        onChange={(e) => handleContentChange('contact', { ...resumeContent.contact, city: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-black/[0.08] focus:ring-4 focus:ring-black/5 transition-all outline-none text-[15px] font-medium text-[#1D1D1F] placeholder-[#86868B]/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5 pl-1">LinkedIn</label>
                                    <input
                                        type="url"
                                        value={resumeContent?.contact?.linkedin || ''}
                                        onChange={(e) => handleContentChange('contact', { ...resumeContent.contact, linkedin: e.target.value })}
                                        placeholder="linkedin.com/in/yourname"
                                        className="w-full px-4 py-3.5 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-black/[0.08] focus:ring-4 focus:ring-black/5 transition-all outline-none text-[15px] font-medium text-[#1D1D1F] placeholder-[#86868B]/50"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* SECTION: Executive Summary */}
                        <section className="space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[12px] font-bold text-[#86868B] uppercase tracking-widest flex items-center gap-2">
                                    <AlignLeft className="w-4 h-4" /> {resume?.country === 'India' && (resumeContent?.work_experiences?.length || 0) <= 1 ? 'Career Objective' : 'Professional Summary'}
                                </h3>
                                <button
                                    onClick={handleEnhanceWithAI}
                                    className="text-[12px] font-semibold text-[#AF52DE] bg-[#AF52DE]/10 hover:bg-[#AF52DE]/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors focus:outline-none"
                                >
                                    <Sparkles className="w-3.5 h-3.5" /> Rewrite with AI
                                </button>
                            </div>
                            <textarea
                                value={resumeContent?.professional_summary || ''}
                                onChange={(e) => handleContentChange('professional_summary', e.target.value)}
                                onSelect={(e) => handleTextSelect(e, 'professional_summary')}
                                rows={5}
                                className="w-full px-5 py-4 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-black/[0.08] focus:ring-4 focus:ring-black/5 transition-all outline-none text-[15px] text-[#1D1D1F] leading-relaxed resize-none placeholder-[#86868B]/50"
                                placeholder="A concise summary of your professional background, key achievements, and career goals..."
                            />
                        </section>

                        {/* SECTION: Experience */}
                        <section className="space-y-5">
                            <div className="flex items-center justify-between border-b border-black/[0.04] pb-3">
                                <h3 className="text-[12px] font-bold text-[#86868B] uppercase tracking-widest flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" /> Experience
                                </h3>
                                <button
                                    onClick={() => {
                                        const newExp = [...(resumeContent.work_experiences || []), { job_title: '', company: '', start_date: '', end_date: '', description: [''] }];
                                        handleContentChange('work_experiences', newExp);
                                    }}
                                    className="text-[12px] font-semibold text-[#1D1D1F] hover:opacity-70 flex items-center gap-1 transition-opacity focus:outline-none"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Role
                                </button>
                            </div>

                            <div className="space-y-6">
                                {resumeContent?.work_experiences?.map((exp: any, idx: number) => (
                                    <div key={idx} className="group p-6 bg-white border border-black/[0.06] rounded-[1.5rem] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all relative">

                                        <button
                                            onClick={() => {
                                                const newExp = resumeContent.work_experiences.filter((_: any, i: number) => i !== idx);
                                                handleContentChange('work_experiences', newExp);
                                            }}
                                            className="absolute -top-2 -right-2 bg-white border border-black/[0.08] text-[#86868B] hover:text-[#FF3B30] rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-sm transition-all focus:outline-none"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>

                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <input
                                                    className="w-full bg-transparent font-semibold text-[16px] text-[#1D1D1F] border-none p-0 focus:ring-0 outline-none placeholder-[#86868B]/50"
                                                    value={exp.job_title || ''}
                                                    onChange={(e) => {
                                                        const newExp = [...resumeContent.work_experiences];
                                                        newExp[idx].job_title = e.target.value;
                                                        handleContentChange('work_experiences', newExp);
                                                    }}
                                                    onSelect={(e) => handleTextSelect(e, `work_experiences[${idx}].job_title`)}
                                                    placeholder="Job Title"
                                                />
                                                <input
                                                    className="w-full bg-transparent text-[#0066CC] font-medium text-[15px] border-none p-0 focus:ring-0 outline-none placeholder-[#86868B]/50"
                                                    value={exp.company || ''}
                                                    onChange={(e) => {
                                                        const newExp = [...resumeContent.work_experiences];
                                                        newExp[idx].company = e.target.value;
                                                        handleContentChange('work_experiences', newExp);
                                                    }}
                                                    placeholder="Company Name"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 text-[13px] text-[#86868B]">
                                                <input
                                                    className="bg-transparent border-none p-0 focus:ring-0 outline-none w-28 placeholder-[#86868B]/50 text-[13px]"
                                                    value={exp.start_date || ''}
                                                    onChange={(e) => {
                                                        const newExp = [...resumeContent.work_experiences];
                                                        newExp[idx].start_date = e.target.value;
                                                        handleContentChange('work_experiences', newExp);
                                                    }}
                                                    placeholder="Start Date"
                                                />
                                                <span>–</span>
                                                <input
                                                    className="bg-transparent border-none p-0 focus:ring-0 outline-none w-28 placeholder-[#86868B]/50 text-[13px]"
                                                    value={exp.end_date || ''}
                                                    onChange={(e) => {
                                                        const newExp = [...resumeContent.work_experiences];
                                                        newExp[idx].end_date = e.target.value;
                                                        handleContentChange('work_experiences', newExp);
                                                    }}
                                                    placeholder="End Date / Present"
                                                />
                                            </div>

                                            {/* Bullet Points */}
                                            <div className="space-y-2 mt-2">
                                                {(exp.description || []).map((bullet: string, bIdx: number) => (
                                                    <div key={bIdx} className="flex items-start gap-2 group/bullet">
                                                        <span className="text-[#86868B] mt-2 text-[10px] shrink-0">●</span>
                                                        <div className="flex-1 flex items-center gap-1">
                                                            <input
                                                                className="flex-1 bg-transparent text-[14px] text-[#1D1D1F] border-none p-0 py-1.5 focus:ring-0 outline-none placeholder-[#86868B]/50 leading-relaxed"
                                                                value={bullet}
                                                                onChange={(e) => {
                                                                    const newExp = [...resumeContent.work_experiences];
                                                                    newExp[idx].description[bIdx] = e.target.value;
                                                                    handleContentChange('work_experiences', newExp);
                                                                }}
                                                                onSelect={(e) => handleTextSelect(e, `work_experiences[${idx}].description[${bIdx}]`)}
                                                                placeholder="Describe your impact and achievements..."
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newExp = [...resumeContent.work_experiences];
                                                                    newExp[idx].description = newExp[idx].description.filter((_: any, i: number) => i !== bIdx);
                                                                    handleContentChange('work_experiences', newExp);
                                                                }}
                                                                className="opacity-0 group-hover/bullet:opacity-100 text-[#86868B] hover:text-[#FF3B30] transition-all focus:outline-none shrink-0"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        const newExp = [...resumeContent.work_experiences];
                                                        if (!newExp[idx].description) newExp[idx].description = [];
                                                        newExp[idx].description.push("");
                                                        handleContentChange('work_experiences', newExp);
                                                    }}
                                                    className="text-[13px] font-medium text-[#86868B] hover:text-[#1D1D1F] flex items-center gap-1.5 mt-2 transition-colors focus:outline-none"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Add Bullet
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* SECTION: Academic Background */}
                        <section className="space-y-5">
                            <div className="flex items-center justify-between border-b border-black/[0.04] pb-3">
                                <h3 className="text-[12px] font-bold text-[#86868B] uppercase tracking-widest flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4" /> Education
                                </h3>
                                <button
                                    onClick={() => {
                                        const newEdu = [...(resumeContent.educations || []), { institution: '', degree: '', graduation_date: '' }];
                                        handleContentChange('educations', newEdu);
                                    }}
                                    className="text-[12px] font-semibold text-[#1D1D1F] hover:opacity-70 flex items-center gap-1 transition-opacity focus:outline-none"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Degree
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {(resumeContent?.educations || []).map((edu: any, idx: number) => (
                                    <div key={idx} className="group p-5 bg-white border border-black/[0.06] rounded-[1.25rem] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all relative">
                                        <button
                                            onClick={() => {
                                                const newEdu = resumeContent.educations.filter((_: any, i: number) => i !== idx);
                                                handleContentChange('educations', newEdu);
                                            }}
                                            className="absolute -top-2 -right-2 bg-white border border-black/[0.08] text-[#86868B] hover:text-[#FF3B30] rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-sm transition-all focus:outline-none"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="space-y-3">
                                            <input
                                                className="w-full bg-transparent font-medium text-[16px] text-[#1D1D1F] border-none p-0 focus:ring-0 outline-none placeholder-[#86868B]/50"
                                                value={edu.institution}
                                                onChange={(e) => {
                                                    const newEdu = [...resumeContent.educations];
                                                    newEdu[idx].institution = e.target.value;
                                                    handleContentChange('educations', newEdu);
                                                }}
                                                placeholder="Institution"
                                            />
                                            <div className="flex items-center justify-between gap-4 text-[14px]">
                                                <input
                                                    className="w-full bg-transparent text-[#0066CC] font-medium border-none p-0 focus:ring-0 outline-none placeholder-[#86868B]/50"
                                                    value={edu.degree}
                                                    onChange={(e) => {
                                                        const newEdu = [...resumeContent.educations];
                                                        newEdu[idx].degree = e.target.value;
                                                        handleContentChange('educations', newEdu);
                                                    }}
                                                    placeholder="Degree"
                                                />
                                                <input
                                                    className="bg-transparent font-medium text-[#86868B] text-right border-none p-0 focus:ring-0 outline-none w-32 placeholder-[#86868B]/50"
                                                    value={edu.graduation_date}
                                                    onChange={(e) => {
                                                        const newEdu = [...resumeContent.educations];
                                                        newEdu[idx].graduation_date = e.target.value;
                                                        handleContentChange('educations', newEdu);
                                                    }}
                                                    placeholder="Year"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* SECTION: Skills */}
                        <section className="space-y-4">
                            <h3 className="text-[12px] font-bold text-[#86868B] uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" /> Technical Arsenal
                            </h3>
                            <div className="flex flex-wrap gap-2.5 bg-white p-5 rounded-[1.5rem] border border-black/[0.04] shadow-sm">
                                {(resumeContent?.skills || []).map((skill: string, idx: number) => (
                                    <div key={idx} className="flex items-center bg-[#F5F5F7] text-[#1D1D1F] px-3.5 py-1.5 rounded-lg text-[13px] font-medium border border-black/[0.02]">
                                        {skill}
                                        <button
                                            onClick={() => {
                                                const newSkills = resumeContent.skills.filter((_: any, i: number) => i !== idx);
                                                handleContentChange('skills', newSkills);
                                            }}
                                            className="ml-2 text-[#86868B] hover:text-[#FF3B30] transition-colors focus:outline-none"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <input
                                    type="text"
                                    placeholder="+ Add Skill"
                                    className="bg-transparent border-none px-2 py-1.5 text-[13px] font-medium text-[#86868B] placeholder-[#86868B]/50 focus:text-[#1D1D1F] outline-none min-w-[100px]"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const target = e.currentTarget;
                                            const val = target.value.trim();
                                            if (val) {
                                                handleContentChange('skills', [...(resumeContent.skills || []), val]);
                                                target.value = '';
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </section>

                        {/* SECTION: Languages */}
                        <section className="space-y-5">
                            <div className="flex items-center justify-between border-b border-black/[0.04] pb-3">
                                <h3 className="text-[12px] font-bold text-[#86868B] uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> Spoken Languages
                                </h3>
                                <button
                                    onClick={() => {
                                        const newLangs = [...(resumeContent.languages || []), { language: '', proficiency: '' }];
                                        handleContentChange('languages', newLangs);
                                    }}
                                    className="text-[12px] font-semibold text-[#1D1D1F] hover:opacity-70 flex items-center gap-1 transition-opacity focus:outline-none"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Language
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* FIX #11: normalizeLang handles both string and object formats from backend */}
                                {(resumeContent?.languages || []).map((langRaw: any, idx: number) => {
                                    const lang = normalizeLang(langRaw);
                                    return (
                                        <div key={idx} className="group flex items-center bg-white border border-black/[0.06] rounded-[1rem] p-2 pl-4 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
                                            <input
                                                className="flex-1 bg-transparent font-medium text-[14px] text-[#1D1D1F] border-none p-0 focus:ring-0 outline-none placeholder-[#86868B]/50"
                                                value={lang.language}
                                                onChange={(e) => {
                                                    const newLangs = [...resumeContent.languages].map(normalizeLang);
                                                    newLangs[idx].language = e.target.value;
                                                    handleContentChange('languages', newLangs);
                                                }}
                                                placeholder="German"
                                            />
                                            <div className="w-[1px] h-6 bg-black/[0.06] mx-3 shrink-0"></div>
                                            <input
                                                className="w-24 shrink-0 bg-transparent text-[13px] font-medium text-[#0066CC] border-none p-0 focus:ring-0 outline-none placeholder-[#86868B]/50 text-right"
                                                value={lang.proficiency}
                                                onChange={(e) => {
                                                    const newLangs = [...resumeContent.languages].map(normalizeLang);
                                                    newLangs[idx].proficiency = e.target.value;
                                                    handleContentChange('languages', newLangs);
                                                }}
                                                placeholder="B2"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newLangs = resumeContent.languages.filter((_: any, i: number) => i !== idx);
                                                    handleContentChange('languages', newLangs);
                                                }}
                                                className="text-[#86868B] hover:text-[#FF3B30] p-2 transition-colors focus:outline-none shrink-0"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <div className="pb-10 pt-10 text-center">
                            <p className="text-[12px] text-[#86868B] font-medium tracking-wide">WORKSPACE END</p>
                            <p className="text-[11px] text-[#86868B]/60 mt-2">Changes save automatically to your cloud workspace.</p>
                        </div>
                    </div>
                </main>

                {/* RIGHT PANE: PDF Viewer */}
                <aside className={`w-full lg:w-[50%] bg-[#525659] flex-col relative overflow-hidden ${mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>

                    {/* PDF Viewer Toolbar */}
                    <div className="h-12 bg-[#323639] border-b border-black/20 flex items-center justify-between px-4 shadow-sm z-20 shrink-0 text-white/80">
                        <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-white/60" />
                            <span className="text-[13px] font-medium truncate max-w-[200px]">{resume?.title || 'Resume'}_Preview.pdf</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => {
                                    const url = resume?.pdf_url;
                                    if (url) window.open(url, '_blank');
                                }}
                                className="p-1.5 hover:bg-white/10 rounded-md transition-colors focus:outline-none"
                                title="Open in New Tab"
                            >
                                <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex justify-center py-4 sm:py-8 px-2 sm:px-4">
                        <div className="w-full max-w-[794px] aspect-[1/1.414] sm:min-h-[1123px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-col relative overflow-hidden">

                            {resume?.pdf_url ? (
                                <iframe
                                    src={`${resume.pdf_url}?inline=true&t=${previewTimestamp}`}
                                    className="w-full h-full border-none absolute inset-0"
                                    title="Resume Preview"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#86868B] gap-4">
                                    <FileText className="w-12 h-12 opacity-20" />
                                    <p className="text-[12px] font-bold uppercase tracking-widest text-center">
                                        No PDF Preview Generated Yet.<br />
                                        <span className="text-[#0066CC] cursor-pointer hover:underline" onClick={handleManualSave}>Click 'Save & Refresh' to generate.</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.15); border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.25); }
            `}} />
        </div>
    );
};

export default ResumeEditor;
