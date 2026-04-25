import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getResume, updateResume, Resume } from '../services/resume';
import { Download, ArrowLeft, Edit3, Save, X, Loader2, Globe, Layout as LayoutIcon, Type } from 'lucide-react';
import { getAvailableCountries } from '../services/schema';

const ViewResume = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [resume, setResume] = useState<Resume | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedData, setEditedData] = useState<Partial<Resume>>({});
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [availableCountries, setAvailableCountries] = useState<string[]>([]);

    useEffect(() => {
        if (id) {
            loadResume(id);
        }
        fetchCountries();
    }, [id]);

    const fetchCountries = async () => {
        const countries = await getAvailableCountries();
        setAvailableCountries(countries);
    };

    const loadResume = async (resumeId: string) => {
        try {
            const data = await getResume(resumeId);
            setResume(data);
            setEditedData({
                title: data.title,
                country: data.country,
                template_style: data.template_style,
                resume_data: { ...data.resume_data }
            });
            updatePreviewUrl(data.pdf_url);
        } catch (error) {
            console.error('Failed to load resume', error);
        } finally {
            setLoading(false);
        }
    };

    const updatePreviewUrl = (url?: string) => {
        if (!url) return;
        const token = localStorage.getItem('token');
        const finalUrl = `${url}${url.includes('?') ? '&' : '?'}token=${token}&t=${Date.now()}`;
        setPreviewUrl(finalUrl);
    };

    const handleSave = async () => {
        if (!id) return;
        setIsSaving(true);
        try {
            const updated = await updateResume(id, editedData);
            setResume(updated);
            setIsEditing(false);
            // Force reload iframe by updating timestamp
            updatePreviewUrl(updated.pdf_url);
        } catch (error) {
            console.error('Failed to update resume', error);
            alert('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const updateNestedData = (field: string, value: any) => {
        setEditedData(prev => ({
            ...prev,
            resume_data: {
                ...prev.resume_data,
                [field]: value
            }
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-[#0A2A6B] mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading your resume...</p>
                </div>
            </div>
        );
    }

    if (!resume) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-sm">
                    <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Resume Not Found</h2>
                    <p className="text-slate-500 mb-6">We couldn't find the resume you're looking for.</p>
                    <Link to="/dashboard" className="inline-flex items-center text-[#0A2A6B] font-bold">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] bg-slate-50 overflow-hidden flex flex-col">
            {/* Top Toolbar */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedData.title}
                                onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                                className="text-lg font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-[#0A2A6B]/20"
                            />
                        ) : (
                            <h1 className="text-xl font-bold text-slate-900 truncate max-w-[300px]">{resume.title}</h1>
                        )}
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            {resume.country} • {resume.language} • {resume.template_style}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-lg transition-all"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-5 py-2 bg-[#0A2A6B] text-white rounded-lg text-sm font-bold shadow-lg shadow-[#0A2A6B]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                disabled={isSaving}
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-all"
                            >
                                <Edit3 className="h-4 w-4" />
                                Edit Resume
                            </button>
                            <a
                                href={previewUrl}
                                download={`${resume.title}.pdf`}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-slate-800 transition-all"
                            >
                                <Download className="h-4 w-4" />
                                Download PDF
                            </a>
                        </>
                    )}
                </div>
            </div>

            {/* Main Editor/Preview Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Editor Form */}
                <div className={`w-full lg:w-1/2 bg-white border-r border-slate-200 overflow-y-auto transition-all ${isEditing ? 'block' : 'hidden lg:block'}`}>
                    <div className="p-8 max-w-2xl mx-auto space-y-8">
                        <div>
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <LayoutIcon className="w-4 h-4" />
                                Resume Content
                            </h2>

                            <div className="space-y-6">
                                {/* Personal Info (Simplified for now) */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2A6B]/10 focus:border-[#0A2A6B] outline-none transition-all"
                                        value={editedData.resume_data?.full_name || ''}
                                        onChange={(e) => updateNestedData('full_name', e.target.value)}
                                        readOnly={!isEditing}
                                    />
                                </div>

                                {/* Summary */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Professional Summary</label>
                                    <textarea
                                        rows={8}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2A6B]/10 focus:border-[#0A2A6B] outline-none transition-all resize-none text-sm leading-relaxed"
                                        placeholder="Briefly describe your professional background and key achievements..."
                                        value={editedData.resume_data?.summary_text || ''}
                                        onChange={(e) => updateNestedData('summary_text', e.target.value)}
                                        readOnly={!isEditing}
                                    />
                                </div>

                                {/* Experience / Education (Showing a simple "AI Text" based editor first) */}
                                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                    <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                                        <Type className="w-4 h-4 text-blue-500" />
                                        Interactive Sections
                                    </h3>
                                    <p className="text-sm text-blue-700 leading-relaxed">
                                        You are currently editing the <strong>Base Text</strong> which the AI uses to generate your PDF.
                                        {isEditing ? ' Changes made here will be reflected in the final document after saving.' : ' Click "Edit Resume" to modify this content.'}
                                    </p>
                                </div>

                                {/* Metadata Settings */}
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                            <Globe className="w-3 h-3" /> Target Country
                                        </label>
                                        <select
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2A6B]/10 outline-none transition-all text-sm appearance-none"
                                            value={editedData.country}
                                            onChange={(e) => setEditedData({ ...editedData, country: e.target.value })}
                                            disabled={!isEditing}
                                        >
                                            {availableCountries.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                            <Type className="w-3 h-3" /> Template
                                        </label>
                                        <select
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2A6B]/10 outline-none transition-all text-sm appearance-none"
                                            value={editedData.template_style}
                                            onChange={(e) => setEditedData({ ...editedData, template_style: e.target.value })}
                                            disabled={!isEditing}
                                        >
                                            <option value="professional">Professional</option>
                                            <option value="modern">Modern</option>
                                            <option value="minimal">Minimal</option>
                                            <option value="executive">Executive</option>
                                            <option value="vibrant">Vibrant</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!isEditing && (
                            <div className="pt-6 border-t border-slate-100 text-center">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-[#0A2A6B] font-bold text-sm hover:underline"
                                >
                                    Need to change something else? Edit now
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: PDF Preview */}
                <div className={`flex-1 bg-slate-200/50 p-4 lg:p-8 overflow-y-auto flex flex-col items-center ${isEditing ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="w-full max-w-4xl bg-white shadow-2xl rounded-sm border border-slate-300 relative group overflow-hidden min-h-[1122px]">
                        {isSaving && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                <div className="text-center bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                                    <Loader2 className="h-10 w-10 animate-spin text-[#0A2A6B] mx-auto mb-3" />
                                    <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">Regenerating PDF...</p>
                                    <p className="text-xs text-slate-500 mt-1">Applying your manual edits</p>
                                </div>
                            </div>
                        )}
                        <iframe
                            src={previewUrl}
                            className="w-full h-[1122px] border-none"
                            title="Resume PDF Preview"
                            sandbox="allow-scripts allow-same-origin"
                            loading="lazy"
                        />
                    </div>

                    <div className="mt-6 flex items-center gap-4 text-slate-400 text-xs font-medium">
                        <p>Preview automatically updates after saving</p>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <p>Standard A4 Format</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewResume;
