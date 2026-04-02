import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Hooks
import { useAuth } from '../context/AuthContext';
import { useResumes } from '../hooks/useResumes';
import { useAnalytics } from '../hooks/useAnalytics';
import { useUserProfile } from '../hooks/useUserProfile';
import { useConfirmModal } from '../hooks/useConfirmModal';

// Components
import Sidebar from '../components/dashboard/Sidebar';
import StatsGrid from '../components/dashboard/StatsGrid';
import ResumeCard from '../components/dashboard/ResumeCard';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import ConfirmModal from '../components/dashboard/ConfirmModal';
import ShareModal from '../components/ShareModal';
import ForensicFixCard from '../components/ForensicFixCard';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Custom Hooks
    const { 
        resumes, loading: resumesLoading, fetchResumes, 
        deleteResumeAction, renameResumeAction 
    } = useResumes();
    
    const { 
        analyticsData, activities, loading: analyticsLoading, fetchAnalytics 
    } = useAnalytics();
    
    const { 
        userProfile, activeUser, loading: profileLoading, 
        fetchProfileData, userInitials 
    } = useUserProfile();
    
    const { 
        isOpen: isConfirmOpen, title: confirmTitle, message: confirmMessage, 
        confirmAction, close: closeConfirm, handleConfirm 
    } = useConfirmModal();

    // Local UI State
    const [isRenaming, setIsRenaming] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [sharingResume, setSharingResume] = useState<any>(null);
    const systemStatus = 'HEALTHY';

    useEffect(() => {
        if (user) {
            Promise.allSettled([
                fetchResumes(),
                fetchAnalytics(),
                fetchProfileData()
            ]);
        }
    }, [user, fetchResumes, fetchAnalytics, fetchProfileData]);

    const handleDownload = (resume: any) => {
        if (resume.pdf_url) {
            // Standardizing download URLs (removing manual token injection where possible)
            window.open(resume.pdf_url, '_blank');
        } else {
            toast.error('PDF is not available for this resume.');
        }
    };

    const isLoading = resumesLoading || analyticsLoading || profileLoading;

    return (
        <div className="flex bg-[#F8FAFC] min-h-[calc(100vh-64px)] relative">
            <Sidebar 
                user={user} 
                userProfile={userProfile} 
                systemStatus={systemStatus} 
                initials={userInitials(user, userProfile)} 
            />

            <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                {isLoading ? (
                    <DashboardSkeleton />
                ) : (
                    <>
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                    Command Center.
                                </h1>
                                <p className="text-slate-500 mt-1 text-sm font-medium opacity-80">
                                    Is your resume working? <span className="text-[#0A2A6B] font-bold">Check your numbers.</span>
                                </p>
                            </div>
                            <Link
                                to="/create"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A2A6B] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#0A2A6B]/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                            >
                                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                                New Resume
                            </Link>
                        </div>

                        <StatsGrid analyticsData={analyticsData} />

                        {analyticsData?.recommendation && (
                            <ForensicFixCard
                                fix={analyticsData.recommendation.fix}
                                resumeTitle={analyticsData.recommendation.resume_title}
                                isFallback={!analyticsData.recommendation.resume_id}
                                onFix={() => {
                                    const rid = analyticsData.recommendation.resume_id || (resumes.length > 0 ? resumes[0].id : null);
                                    if (rid) navigate(`/resume/edit/${rid}`, {
                                        state: { suggestion: analyticsData.recommendation.fix }
                                    });
                                }}
                                onNext={fetchAnalytics}
                            />
                        )}

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="xl:col-span-2 space-y-6">
                                {/* Resume List Container */}
                                <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-[#0A2A6B]" />
                                            Portfolio Assets
                                        </h2>
                                    </div>

                                    {resumes.length === 0 ? (
                                        <div className="p-20 text-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 ring-8 ring-slate-50/50">
                                                <Plus className="w-10 h-10" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">Build your first masterpiece</h3>
                                            <Link to="/create" className="inline-flex items-center gap-2 px-8 py-3 bg-[#0A2A6B] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#0A2A6B]/20 hover:scale-[1.05] transition-all">
                                                New Resume
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100/50">
                                            {resumes.map((resume) => (
                                                <ResumeCard 
                                                    key={resume.id}
                                                    resume={resume}
                                                    isRenaming={isRenaming === resume.id}
                                                    setIsRenaming={setIsRenaming}
                                                    onRename={renameResumeAction}
                                                    onDelete={(id) => new Promise((resolve) => {
                                                        confirmAction(
                                                            "Delete Resume?", 
                                                            "This action cannot be undone. All analytics for this link will be lost.",
                                                            async () => {
                                                                const success = await deleteResumeAction(id);
                                                                resolve(success);
                                                            }
                                                        );
                                                    })}
                                                    onDownload={handleDownload}
                                                    onPreview={(r) => r.pdf_url && window.open(`${r.pdf_url}${r.pdf_url.includes('?') ? '&' : '?'}inline=true`, '_blank')}
                                                    onShare={(r) => { setSharingResume(r); setIsShareModalOpen(true); }}
                                                    onEdit={(id) => navigate(`/resume/edit/${id}`)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <ActivityTimeline activities={activities} />
                            </div>

                            <div className="space-y-6">
                                {/* Performance Ranking Area (Simplified/Fixed) */}
                                <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-xl shadow-slate-200/10">
                                    <h3 className="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-[0.2em]">Competitive Edge</h3>
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-slate-900">Reach Ranking</span>
                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded uppercase tracking-widest">Optimized</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }}></div>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Optimization</span>
                                            <span className="text-xs font-bold text-slate-900">{resumes.length} Scans</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            <ConfirmModal 
                isOpen={isConfirmOpen}
                title={confirmTitle}
                message={confirmMessage}
                onConfirm={handleConfirm}
                onClose={closeConfirm}
            />

            {isShareModalOpen && sharingResume && activeUser && (
                <ShareModal
                    resume={sharingResume}
                    username={activeUser.username}
                    onClose={() => setIsShareModalOpen(false)}
                    onUpdate={(updated) => {
                        fetchResumes(); // Re-fetch to sync sharing state
                        setSharingResume(updated);
                    }}
                />
            )}
        </div>
    );
};

export default Dashboard;
