import React, { useState } from 'react';
import { 
    FileText, Edit3, Trash2, Download, Eye, Share2, Check, X, Star
} from 'lucide-react';
import { Resume } from '../../services/resume';

interface ResumeCardProps {
    resume: Resume;
    onRename: (id: string, newTitle: string) => Promise<boolean>;
    onDelete: (id: string) => Promise<boolean>;
    onDownload: (resume: Resume) => void;
    onPreview: (resume: Resume) => void;
    onShare: (resume: Resume) => void;
    onEdit: (id: string) => void;
    isRenaming: boolean;
    setIsRenaming: (id: string | null) => void;
}

const ResumeCard: React.FC<ResumeCardProps> = ({ 
    resume, onRename, onDelete, onDownload, onPreview, onShare, onEdit, isRenaming, setIsRenaming
}) => {
    const [newTitle, setNewTitle] = useState(resume.title);

    const handleLocalRename = async () => {
        if (!newTitle.trim()) return;
        const success = await onRename(resume.id, newTitle);
        if (success) setIsRenaming(null);
    };

    return (
        <div className="p-5 hover:bg-slate-50/50 transition-all group relative border-b border-slate-100 last:border-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-14 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-center shadow-sm text-[#0A2A6B] group-hover:border-[#0A2A6B]/20 transition-all">
                        <FileText className="w-6 h-6 opacity-70 group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            {isRenaming ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        autoFocus
                                        className="px-3 py-1.5 border-2 border-[#0A2A6B] rounded-xl text-base font-bold focus:outline-none shadow-sm"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleLocalRename();
                                            if (e.key === 'Escape') setIsRenaming(null);
                                        }}
                                    />
                                    <button onClick={handleLocalRename} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Check className="w-4 h-4" /></button>
                                    <button onClick={() => setIsRenaming(null)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><X className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <>
                                    <h3 className="font-bold text-slate-950 group-hover:text-[#0A2A6B] transition-colors truncate max-w-[200px] md:max-w-md text-lg tracking-tight">
                                        {resume.title}
                                    </h3>
                                    <button
                                        onClick={() => { setIsRenaming(resume.id); setNewTitle(resume.title); }}
                                        className="p-1 text-slate-300 hover:text-[#0A2A6B] transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {resume.country}
                            </div>
                            {resume.resume_data?.score > 0 && (
                                <div className="px-3 py-1 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest border border-indigo-100/50">
                                    ATS: {resume.resume_data.score}
                                </div>
                            )}
                            {resume.is_default && (
                                <div className="px-3 py-1 rounded bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-widest border border-amber-100/50 flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" />
                                    Default
                                </div>
                            )}
                            <div className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${resume.resume_data ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                {resume.resume_data ? 'Completed' : 'Draft'}
                            </div>
                            <div className="text-xs font-medium text-slate-400">
                                Edited {new Date(resume.updated_at || resume.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onShare(resume)}
                        className="p-2.5 text-slate-400 hover:text-[#0A2A6B] hover:bg-[#0A2A6B]/5 rounded-xl transition-all"
                        title="Share"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onPreview(resume)}
                        className="p-2.5 text-slate-400 hover:text-[#0A2A6B] hover:bg-blue-50 rounded-xl transition-all"
                        title="Preview"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onEdit(resume.id)}
                        className="p-2.5 text-slate-400 hover:text-[#0A2A6B] hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDownload(resume)}
                        className="p-2.5 bg-slate-900 text-white rounded-xl shadow-sm hover:bg-black transition-all"
                        title="Download PDF"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(resume.id)}
                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeCard;
