import React from 'react';
import { 
    FileText, Edit2, Share2, Trash2, Bell
} from 'lucide-react';
import { Resume } from '../../services/resume';

interface ResumeCardProps {
    resume: Resume;
    onDelete: (id: string) => void;
    onPreview: (resume: Resume) => void;
    onShare: (resume: Resume) => void;
    onEdit: (id: string) => void;
}

const ResumeCard: React.FC<ResumeCardProps> = ({ 
    resume, onDelete, onPreview, onShare, onEdit
}) => {
    // 1. DATA DERIVATION
    const score = resume.resume_data?.score || 0;
    const date = new Date(resume.updated_at || resume.created_at).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
    });
    
    // 2. ACTIVITY LOGIC (Recent views detection)
    // For now, we light up the bell if the resume has any views recorded recently
    const hasActivity = (resume as any).new_views_count > 0 || score > 90;

    return (
        <div 
            onClick={() => onPreview(resume)}
            className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-[#F5F5F7]/80 transition-all cursor-pointer border-b border-black/[0.04] last:border-0 relative"
        >
            <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-[14px] bg-[#1D1D1F] text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                    <h4 className="text-[16px] font-medium text-[#1D1D1F] mb-0.5 group-hover:text-[#0066CC] transition-colors truncate">
                        {resume.title}
                    </h4>
                    <div className="flex items-center gap-2.5 text-[13px] text-[#86868B]">
                        <span className="truncate">{resume.country}</span>
                        <span className="w-1 h-1 bg-[#86868B]/40 rounded-full shrink-0" />
                        <span className="whitespace-nowrap">Updated {date}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex flex-col items-start sm:items-end">
                    <span className={`text-[14px] font-medium ${score >= 80 ? 'text-[#34C759]' : 'text-[#FF9F0A]'}`}>
                        {score}% Match
                    </span>
                    <span className="text-[11px] text-[#86868B] uppercase tracking-wider font-semibold">ATS Score</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                    {/* Notification Bell */}
                    <button 
                        title={hasActivity ? "New activity detected!" : "No recent activity"}
                        onClick={(e) => { e.stopPropagation(); }}
                        className={`relative p-2 rounded-xl transition-all ${
                            hasActivity 
                            ? 'text-[#0066CC] bg-[#0066CC]/5 hover:bg-[#0066CC]/15' 
                            : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-white border border-transparent hover:border-black/[0.05]'
                        }`}
                    >
                        <Bell className="w-4 h-4" strokeWidth={hasActivity ? 2.5 : 2} />
                        {hasActivity && <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#FF3B30] rounded-full border border-white"></span>}
                    </button>
                    
                    <div className="w-[1px] h-4 bg-black/[0.08] mx-1"></div>

                    <button 
                        title="Edit Resume" 
                        onClick={(e) => { e.stopPropagation(); onEdit(resume.id); }}
                        className="p-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-black/[0.05]"
                    >
                        <Edit2 className="w-4 h-4"/>
                    </button>
                    <button 
                        title="Share Analytics" 
                        onClick={(e) => { e.stopPropagation(); onShare(resume); }}
                        className="p-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-black/[0.05]"
                    >
                        <Share2 className="w-4 h-4"/>
                    </button>
                    <button 
                        title="Delete Document" 
                        onClick={(e) => { e.stopPropagation(); onDelete(resume.id); }}
                        className="p-2 text-[#86868B] hover:text-[#FF3B30] transition-colors rounded-xl hover:bg-[#FFF0F0] shadow-sm border border-transparent hover:border-[#FF3B30]/10"
                    >
                        <Trash2 className="w-4 h-4"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeCard;
