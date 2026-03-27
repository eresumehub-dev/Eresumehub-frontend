import React, { useState, useEffect } from 'react';
import RefineTooltip from '../components/RefineTooltip';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Download, Clock, Check, AlertCircle,
    Copy, Archive, GitBranch, Star, Sparkles, MoreVertical,
    Eye, FileText, ArrowUpRight, TrendingUp
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
import { Resume } from '../services/resume';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

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

    // ATS Score state
    const [currentScore, setCurrentScore] = useState<number>(0);
    const [scoreHistory, setScoreHistory] = useState<any[]>([]);

    // UI state
    const [showActions, setShowActions] = useState(false);
    const [previewTimestamp, setPreviewTimestamp] = useState<number>(Date.now());
    const [viewMode, setViewMode] = useState<'enhanced' | 'original'>('enhanced');

    // Debounced content for auto-save
    const debouncedContent = useDebounce(resumeContent, 2000);

    // Load resume
    useEffect(() => {
        if (!id) return;

        const loadResumeData = async () => {
            try {
                setLoading(true);
                const data = await getResume(id);
                setResume(data);
                setResumeContent(data.resume_data);
                setCurrentScore(data.resume_data?.score || 0);

                // Load score history
                const scores = await getScoreHistory(id);
                setScoreHistory(scores);

                setLoading(false);
            } catch (error) {
                console.error('Failed to load resume:', error);
                setLoading(false);
            }
        };

        loadResumeData();
    }, [id]);

    // Auto-save when content changes
    useEffect(() => {
        if (!debouncedContent || !resume || loading) return;

        const saveChanges = async () => {
            try {
                setSaveStatus('saving');
                // Auto-save silently updates data without regenerating PDF
                await updateResume(resume.id, {
                    resume_data: debouncedContent,
                    regenerate_pdf: false
                });
                setSaveStatus('saved');
                setLastSaved(new Date());
            } catch (error) {
                console.error('Auto-save failed:', error);
                setSaveStatus('error');
            }
        };

        saveChanges();
    }, [debouncedContent, resume?.id]);

    const handleManualSave = async () => {
        if (!resume || !resumeContent) return;
        try {
            setSaveStatus('saving');
            // Manual save triggers PDF regeneration
            await updateResume(resume.id, {
                resume_data: resumeContent,
                regenerate_pdf: true
            });
            setSaveStatus('saved');
            setLastSaved(new Date());
            setPreviewTimestamp(Date.now()); // Force preview refresh

            // Refresh analytics/score
            setTimeout(async () => {
                if (!resume.id) return;
                const scores = await getScoreHistory(resume.id);
                if (scores && scores.length > 0) {
                    setCurrentScore(scores[0].score);
                    setScoreHistory(scores);
                }
            }, 2000);
        } catch (error) {
            console.error('Manual save failed:', error);
            setSaveStatus('error');
            alert('Failed to save and refresh preview');
        }
    };

    // Actions
    const handleClone = async () => {
        if (!resume) return;
        try {
            const cloned = await cloneResume(resume.id, `${resume.title} (Copy)`);
            navigate(`/resume/edit/${cloned.id}`);
        } catch (error) {
            console.error('Clone failed:', error);
        }
    };

    const handleCreateVersion = async () => {
        if (!resume) return;
        try {
            await createVersion(resume.id);
            alert('Version saved successfully!');
        } catch (error) {
            console.error('Version creation failed:', error);
        }
    };

    const handleArchive = async () => {
        if (!resume) return;
        if (confirm('Archive this resume?')) {
            try {
                await archiveResume(resume.id);
                navigate('/dashboard');
            } catch (error) {
                console.error('Archive failed:', error);
            }
        }
    };

    // Enhance with AI
    const handleEnhanceWithAI = async () => {
        if (!resume) return;
        try {
            setSaveStatus('saving'); // Reuse saving spinner for UI feedback
            const enhancedResume = await enhanceResume(resume.id);

            // Update local state with optimized data
            setResume(enhancedResume);
            setResumeContent(enhancedResume.resume_data);
            setCurrentScore(enhancedResume.resume_data.score || 0);

            setSaveStatus('saved');
            setLastSaved(new Date());
            setPreviewTimestamp(Date.now()); // Refresh preview
            alert("Resume Enhanced with AI!");
        } catch (error: any) {
            console.error('Enhancement failed:', error);
            setSaveStatus('error');
            alert(`Enhancement Failed: ${error.message || "Unknown error"}`);
        }
    };

    const handleSetDefault = async () => {
        if (!resume) return;
        try {
            await setDefaultResume(resume.id);
            alert('Set as default resume!');
        } catch (error) {
            console.error('Set default failed:', error);
        }
    };

    // ==========================================
    // AI REFINEMENT LOGIC
    // ==========================================
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
            // Only show for meaningful selections
            if (text.trim().length > 3) {
                // Calculate position 
                const rect = target.getBoundingClientRect();
                setRefineState({
                    visible: true,
                    position: {
                        x: rect.left + (rect.width / 2),
                        y: rect.top + window.scrollY - 100 // Adjust status bar offset
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

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/resume/refine`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    resumeId: resume.id,
                    selectedText: refineState.selectedText,
                    userInstruction: instruction,
                    sectionId: sectionId
                })
            });

            const data = await response.json();

            if (data.success && data.updatedText) {
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

    // ... (rest of component)
    // ...

    const handleContentChange = (field: string, value: any) => {
        setResumeContent((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#0A2A6B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Loading resume...</p>
                </div>
            </div>
        );
    }

    if (!resume) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
                <div className="text-center bg-white p-12 rounded-3xl shadow-xl border border-slate-200">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-slate-600 font-bold">Resume not found</p>
                    <button onClick={() => navigate('/dashboard')} className="mt-6 text-[#0A2A6B] font-bold hover:underline">Back to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#F8FAFC]">
            <RefineTooltip
                visible={refineState.visible}
                position={refineState.position}
                selectedText={refineState.selectedText}
                sectionId={refineState.sectionId}
                onRefine={handleRefineSubmit}
                onClose={() => setRefineState(prev => ({ ...prev, visible: false }))}
            />
            {/* Header */}
            <header className="h-16 bg-[#0A2A6B] text-white flex items-center justify-between px-6 shadow-lg z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <input
                            type="text"
                            value={resume.title}
                            onChange={(e) => setResume({ ...resume, title: e.target.value })}
                            className="font-bold text-base bg-transparent border-none focus:ring-0 p-0 placeholder-white/50"
                            placeholder="Untitled Resume"
                        />
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/60">
                            {saveStatus === 'saving' && (
                                <>
                                    <Clock className="w-3 h-3 animate-spin" />
                                    <span>Auto-saving...</span>
                                </>
                            )}
                            {saveStatus === 'saved' && (
                                <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Saved {lastSaved && `at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</span>
                                </>
                            )}
                            {saveStatus === 'error' && (
                                <>
                                    <AlertCircle className="w-3 h-3 text-red-400" />
                                    <span>Sync error</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* LOGIC WARNINGS BANNER */}
                {resumeContent?.logic_warnings && resumeContent.logic_warnings.length > 0 && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-amber-50 border border-amber-200 text-amber-900 px-6 py-3 rounded-xl shadow-lg flex items-center gap-4 animate-in fade-in slide-in-from-top-4 max-w-2xl">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">Timeline Logic Conflict</span>
                            <div className="text-sm font-medium space-y-1">
                                {resumeContent.logic_warnings.map((w: string, i: number) => (
                                    <div key={i}>• {w}</div>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                const newContent = { ...resumeContent };
                                delete newContent.logic_warnings;
                                setResumeContent(newContent);
                            }}
                            className="p-1 hover:bg-amber-100 rounded-full ml-4"
                        >
                            <span className="sr-only">Dismiss</span>
                            <Check className="w-4 h-4 text-amber-600" />
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-6 mr-6 text-right">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-tight">ATS Power Score</span>
                            <div className="flex items-center gap-2 justify-end">
                                <span className={`text-sm font-bold ${currentScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{currentScore}/100</span>
                                {scoreHistory.length > 1 && (
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-black">
                                        {currentScore > scoreHistory[1].score ? (
                                            <>
                                                <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                                                <span className="text-emerald-400">+{currentScore - scoreHistory[1].score}</span>
                                            </>
                                        ) : (
                                            <span className="text-white/40">STABLE</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>



                    <button
                        onClick={handleEnhanceWithAI}
                        disabled={saveStatus === 'saving'}
                        className={`hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full text-sm font-bold shadow-lg border border-white/20 hover:shadow-purple-500/30 transition-all hover:scale-105 mr-2 ${saveStatus === 'saving' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Sparkles className="w-4 h-4" />
                        Enhance with AI
                    </button>

                    <button
                        onClick={handleManualSave}
                        className="flex items-center gap-2 px-6 py-2 bg-white text-[#0A2A6B] rounded-full text-sm font-bold shadow-xl hover:scale-105 transition-all"
                        disabled={saveStatus === 'saving'}
                    >
                        {saveStatus === 'saving' ? (
                            <Clock className="w-4 h-4 animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                        Save & Refresh
                    </button>

                    <button
                        onClick={() => {
                            if (resume.pdf_url) {
                                window.open(resume.pdf_url, '_blank');
                            }
                        }}
                        className="p-2.5 bg-[#0D368A] text-white/80 hover:text-white rounded-full transition-all"
                        title="Download PDF"
                    >
                        <Download className="w-5 h-5" />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowActions(!showActions)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        <AnimatePresence>
                            {showActions && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 text-slate-700"
                                >
                                    <button onClick={handleClone} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm font-medium">
                                        <Copy className="w-4 h-4 text-slate-400" /> Clone
                                    </button>
                                    <button onClick={handleCreateVersion} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm font-medium">
                                        <GitBranch className="w-4 h-4 text-slate-400" /> Save Version
                                    </button>
                                    <button onClick={handleSetDefault} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm font-medium">
                                        <Star className="w-4 h-4 text-slate-400" /> Set Default
                                    </button>
                                    <div className="h-px bg-slate-100 my-2"></div>
                                    <button onClick={handleArchive} className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-3 text-sm font-medium text-red-600">
                                        <Archive className="w-4 h-4" /> Archive
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Main Content Side-by-Side */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Pane */}
                <main className="w-1/2 overflow-y-auto p-8 border-r border-slate-200 bg-white relative">
                    {incomingSuggestion && showSuggestion && (
                        <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 shadow-sm animate-in slide-in-from-top duration-500">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-orange-600 text-white rounded-lg shadow-lg shrink-0">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-slate-900 mb-1">AI Fix Recommendation</h4>
                                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                                        Replace <span className="p-0.5 bg-white rounded border border-orange-200 text-orange-700 italic">"{incomingSuggestion.current}"</span> with <span className="p-1 bg-emerald-100 rounded border border-emerald-200 text-emerald-800 font-bold">"{incomingSuggestion.suggested}"</span> to potentially boost your score by <span className="text-orange-600 font-black">+{incomingSuggestion.points}</span>.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setShowSuggestion(false)}
                                            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600"
                                        >
                                            Dismiss Tip
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="max-w-2xl mx-auto space-y-10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Personal Information</h2>
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                <Sparkles className="w-3 h-3" /> AI Enhanced
                            </div>
                        </div>

                        {/* Profile Section */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={resumeContent?.full_name || ''}
                                    onChange={(e) => handleContentChange('full_name', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2A6B] focus:bg-white transition-all text-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={resumeContent?.contact?.email || ''}
                                    onChange={(e) => handleContentChange('contact', { ...resumeContent.contact, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2A6B] focus:bg-white transition-all text-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    value={resumeContent?.contact?.phone || ''}
                                    onChange={(e) => handleContentChange('contact', { ...resumeContent.contact, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2A6B] focus:bg-white transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    {resume?.country === 'India' && (resumeContent?.work_experiences?.length || 0) <= 1 ? 'Career Objective' : 'Professional Summary'}
                                </h3>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(resumeContent?.professional_summary || '');
                                        alert("Summary copied to clipboard!");
                                    }}
                                    className="flex items-center gap-1 text-[10px] font-bold text-[#0A2A6B] uppercase tracking-widest hover:underline"
                                    title="Copy text to paste into your original document"
                                >
                                    <Copy className="w-3 h-3" /> Copy Text
                                </button>
                            </div>
                            <textarea
                                value={resumeContent?.professional_summary || ''}
                                onChange={(e) => handleContentChange('professional_summary', e.target.value)}
                                onSelect={(e) => handleTextSelect(e, 'professional_summary')}
                                rows={6}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#0A2A6B] focus:bg-white transition-all text-sm font-medium leading-relaxed"
                                placeholder="Describe your professional achievements..."
                            />
                        </section>

                        {/* Experience Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Work Experience</h3>
                                <button className="text-[10px] font-bold text-[#0A2A6B] uppercase tracking-widest hover:underline">+ Add Entry</button>
                            </div>
                            <div className="space-y-6">
                                {resumeContent?.work_experiences?.map((exp: any, idx: number) => (
                                    <div key={idx} className="group relative p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-[#0A2A6B]/30 hover:shadow-md transition-all">
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    const text = `${exp.job_title} at ${exp.company}\n${(exp.description || []).join('\n')}`;
                                                    navigator.clipboard.writeText(text);
                                                    alert("Experience entry copied!");
                                                }}
                                                className="p-1.5 bg-white text-[#0A2A6B] rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50"
                                                title="Copy Entry"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="grid gap-4">
                                            <input
                                                className="bg-transparent font-bold text-lg text-slate-900 border-none p-0 focus:ring-0 w-full pr-8"
                                                value={exp.job_title}
                                                onChange={(e) => {
                                                    const newExp = [...resumeContent.work_experiences];
                                                    newExp[idx].job_title = e.target.value;
                                                    handleContentChange('work_experiences', newExp);
                                                }}
                                                onSelect={(e) => handleTextSelect(e, `work_experiences[${idx}].job_title`)}
                                                placeholder="Job Title"
                                            />
                                            <input
                                                className="bg-transparent text-sm font-bold text-[#0A2A6B] border-none p-0 focus:ring-0 w-full"
                                                value={exp.company}
                                                onChange={(e) => {
                                                    const newExp = [...resumeContent.work_experiences];
                                                    newExp[idx].company = e.target.value;
                                                    handleContentChange('work_experiences', newExp);
                                                }}
                                                onSelect={(e) => handleTextSelect(e, `work_experiences[${idx}].company`)}
                                                placeholder="Company Name"
                                            />
                                            <div className="flex gap-4">
                                                <input
                                                    className="bg-transparent text-xs text-slate-500 border-none p-0 focus:ring-0"
                                                    value={exp.start_date}
                                                    onChange={(e) => {
                                                        const newExp = [...resumeContent.work_experiences];
                                                        newExp[idx].start_date = e.target.value;
                                                        handleContentChange('work_experiences', newExp);
                                                    }}
                                                    placeholder="Start Date"
                                                />
                                                <span className="text-slate-300">-</span>
                                                <input
                                                    className="bg-transparent text-xs text-slate-500 border-none p-0 focus:ring-0"
                                                    value={exp.end_date || 'Present'}
                                                    onChange={(e) => {
                                                        const newExp = [...resumeContent.work_experiences];
                                                        newExp[idx].end_date = e.target.value;
                                                        handleContentChange('work_experiences', newExp);
                                                    }}
                                                    placeholder="End Date"
                                                />
                                            </div>

                                            {/* Description Bullets */}
                                            <div className="space-y-3 mt-2">
                                                {(exp.description || []).map((desc: string, descIdx: number) => (
                                                    <div key={descIdx} className="flex gap-2">
                                                        <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                                        <textarea
                                                            value={desc}
                                                            onChange={(e) => {
                                                                const newExp = [...resumeContent.work_experiences];
                                                                newExp[idx].description[descIdx] = e.target.value;
                                                                handleContentChange('work_experiences', newExp);
                                                            }}
                                                            onSelect={(e) => handleTextSelect(e, `work_experiences[${idx}].description[${descIdx}]`)}
                                                            rows={2}
                                                            className="w-full bg-transparent border-none p-0 text-sm text-slate-600 focus:ring-0 leading-relaxed resize-none"
                                                            placeholder="• Achieved X by doing Y..."
                                                        />
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        const newExp = [...resumeContent.work_experiences];
                                                        if (!newExp[idx].description) newExp[idx].description = [];
                                                        newExp[idx].description.push("New achievement...");
                                                        handleContentChange('work_experiences', newExp);
                                                    }}
                                                    className="ml-3.5 text-xs font-bold text-slate-400 hover:text-[#0A2A6B] flex items-center gap-1 transition-colors"
                                                >
                                                    + Add Bullet
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Projects Section */}
                        {resumeContent?.projects && resumeContent.projects.length > 0 && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Projects</h3>
                                    <button className="text-[10px] font-bold text-[#0A2A6B] uppercase tracking-widest hover:underline">+ Add Project</button>
                                </div>
                                <div className="space-y-6">
                                    {resumeContent.projects.map((proj: any, idx: number) => (
                                        <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-[#0A2A6B]/30 hover:shadow-md transition-all">
                                            <div className="grid gap-4">
                                                <input
                                                    className="bg-transparent font-bold text-lg text-slate-900 border-none p-0 focus:ring-0 w-full"
                                                    value={proj.title}
                                                    onChange={(e) => {
                                                        const newProj = [...resumeContent.projects];
                                                        newProj[idx].title = e.target.value;
                                                        handleContentChange('projects', newProj);
                                                    }}
                                                    placeholder="Project Title"
                                                />
                                                <input
                                                    className="bg-transparent text-sm font-bold text-[#0A2A6B] border-none p-0 focus:ring-0 w-full"
                                                    value={proj.role}
                                                    onChange={(e) => {
                                                        const newProj = [...resumeContent.projects];
                                                        newProj[idx].role = e.target.value;
                                                        handleContentChange('projects', newProj);
                                                    }}
                                                    placeholder="Role (e.g. Developer)"
                                                />
                                                <div className="space-y-3 mt-2">
                                                    {(proj.description || []).map((desc: string, descIdx: number) => (
                                                        <div key={descIdx} className="flex gap-2">
                                                            <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                                            <textarea
                                                                value={desc}
                                                                onChange={(e) => {
                                                                    const newProj = [...resumeContent.projects];
                                                                    newProj[idx].description[descIdx] = e.target.value;
                                                                    handleContentChange('projects', newProj);
                                                                }}
                                                                rows={2}
                                                                className="w-full bg-transparent border-none p-0 text-sm text-slate-600 focus:ring-0 leading-relaxed resize-none"
                                                                placeholder="Project details..."
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Education Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Education</h3>
                            </div>
                            <div className="space-y-4">
                                {resumeContent?.educations?.map((edu: any, idx: number) => (
                                    <div key={idx} className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                                        <input
                                            className="w-full bg-transparent font-bold text-slate-900 border-none p-0 focus:ring-0 text-sm mb-1"
                                            value={edu.institution}
                                            onChange={(e) => {
                                                const newEdu = [...resumeContent.educations];
                                                newEdu[idx].institution = e.target.value;
                                                handleContentChange('educations', newEdu);
                                            }}
                                            placeholder="Institution"
                                        />
                                        <div className="flex justify-between items-center text-xs">
                                            <input
                                                className="bg-transparent text-[#0A2A6B] font-medium border-none p-0 focus:ring-0 flex-1"
                                                value={edu.degree}
                                                onChange={(e) => {
                                                    const newEdu = [...resumeContent.educations];
                                                    newEdu[idx].degree = e.target.value;
                                                    handleContentChange('educations', newEdu);
                                                }}
                                                placeholder="Degree"
                                            />
                                            <input
                                                className="bg-transparent text-slate-400 text-right border-none p-0 focus:ring-0 w-24"
                                                value={edu.graduation_date}
                                                onChange={(e) => {
                                                    const newEdu = [...resumeContent.educations];
                                                    newEdu[idx].graduation_date = e.target.value;
                                                    handleContentChange('educations', newEdu);
                                                }}
                                                placeholder="Date"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Skills Section */}
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Technical Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {(resumeContent?.skills || []).map((skill: string, idx: number) => (
                                    <div key={idx} className="flex items-center bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200">
                                        {skill}
                                        <button
                                            onClick={() => {
                                                const newSkills = resumeContent.skills.filter((_: any, i: number) => i !== idx);
                                                handleContentChange('skills', newSkills);
                                            }}
                                            className="ml-2 text-slate-400 hover:text-red-500"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <input
                                    type="text"
                                    placeholder="+ Add Skill"
                                    className="bg-transparent border-none p-1 text-xs font-bold text-[#0A2A6B] focus:ring-0 w-24"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const target = e.currentTarget;
                                            const newSkill = target.value.trim();
                                            if (newSkill) {
                                                const newSkills = [...(resumeContent.skills || []), newSkill];
                                                handleContentChange('skills', newSkills);
                                                target.value = '';
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </section>

                        {/* Languages Section */}
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Languages</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {(resumeContent?.languages || []).map((lang: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <input
                                            className="bg-transparent text-sm font-bold text-slate-900 border-none p-0 focus:ring-0"
                                            value={lang.language}
                                            onChange={(e) => {
                                                const newLangs = [...resumeContent.languages];
                                                newLangs[idx].language = e.target.value;
                                                handleContentChange('languages', newLangs);
                                            }}
                                        />
                                        <input
                                            className="bg-transparent text-xs text-[#0A2A6B] font-medium border-none p-0 focus:ring-0 text-right w-24"
                                            value={lang.proficiency}
                                            onChange={(e) => {
                                                const newLangs = [...resumeContent.languages];
                                                newLangs[idx].proficiency = e.target.value;
                                                handleContentChange('languages', newLangs);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="pb-12 text-center">
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.6em]">Document End</p>
                        </div>
                    </div>
                </main>

                {/* Preview Pane */}
                <aside className="w-1/2 bg-slate-100 flex flex-col items-center justify-center p-8 relative">
                    <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                            {resume?.resume_data?.original_pdf_url ? (
                                <div className="flex bg-white/90 backdrop-blur rounded-full p-1 shadow-lg border border-white/20">
                                    <button
                                        onClick={() => setViewMode('enhanced')}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'enhanced' ? 'bg-[#0A2A6B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Enhanced
                                    </button>
                                    <button
                                        onClick={() => setViewMode('original')}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'original' ? 'bg-[#0A2A6B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Original Upload
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] shadow-lg border border-white/20">
                                    <Eye className="w-3 h-3 text-[#0A2A6B]" /> Live Preview
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <a
                                href={viewMode === 'original' ? resume?.resume_data?.original_pdf_url : resume?.pdf_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 bg-white/90 backdrop-blur hover:bg-white rounded-xl shadow-lg transition-all border border-white/20"
                                title="Open in New Tab"
                            >
                                <ArrowUpRight className="w-4 h-4 text-slate-600" />
                            </a>
                        </div>
                    </div>

                    <div className="w-full max-w-[21cm] bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] rounded-sm border border-slate-300 overflow-hidden aspect-[1/1.414]">
                        {(() => {
                            const urlToUse = viewMode === 'original' ? resume?.resume_data?.original_pdf_url : resume?.pdf_url;
                            if (urlToUse) {
                                return (
                                    <iframe
                                        src={`${urlToUse}?inline=true&t=${previewTimestamp}`}
                                        className="w-full h-full border-none"
                                        title="Resume Preview"
                                    />
                                );
                            } else {
                                return (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                                        <FileText className="w-12 h-12 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-center mt-4">
                                            Preview not available.<br />
                                            <span className="text-[#0A2A6B]">Click 'Save & Refresh' to generate.</span>
                                        </p>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ResumeEditor;
