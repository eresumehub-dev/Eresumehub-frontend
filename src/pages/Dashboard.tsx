import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, FileText, ArrowRight, Sparkles, Clock, Lightbulb } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Hooks
import { useAuth } from '../context/AuthContext';
import { useResumesQuery } from '../hooks/queries/useResumesQuery';
import { useAnalyticsQuery } from '../hooks/queries/useAnalyticsQuery';
import { useUserProfileQuery, getUserInitials } from '../hooks/queries/useUserProfileQuery';
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

    // 1. DATA LAYER (TanStack Query)
    const { 
        resumes, isLoading: resumesLoading, 
        deleteResumeAction, renameResumeAction 
    } = useResumesQuery();
    
    const { 
        data: analyticsData, isLoading: analyticsLoading, refetch: fetchAnalytics 
    } = useAnalyticsQuery();
    
    const { 
        data: profileData, isLoading: profileLoading 
    } = useUserProfileQuery();

    const activities = analyticsData?.activities || [];
    const userProfile = profileData?.profile;

    // 2. SHARED UI STATE (Zustand)
    // Sidebar state is handled internally by the Sidebar component via useUIStore

    const { 
        isOpen: isConfirmOpen, title: confirmTitle, message: confirmMessage, 
        confirmAction, close: closeConfirm, handleConfirm 
    } = useConfirmModal();

    // Local Component UI State (Minimal)
    const [isRenaming, setIsRenaming] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [sharingResume, setSharingResume] = useState<any>(null);

    // Derived state
    const firstName = (userProfile?.full_name || user?.user_metadata?.full_name || 'there').split(' ')[0];
    const totalViews = analyticsData?.summary?.total_views || 0;
    const totalDownloads = analyticsData?.summary?.total_downloads || 0;

    const handleDownload = (resume: any) => {
        if (resume.pdf_url) {
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
                userProfile={userProfile || null} 
                resumeCount={resumes.length}
                totalViews={totalViews}
                initials={getUserInitials(userProfile?.full_name)} 
            />

            <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                {isLoading ? (
                    <DashboardSkeleton />
                ) : (
                    <>
                        {/* 1. PERSONALIZED HEADER */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-950 tracking-tight">
                                    Welcome back, {firstName}.
                                </h1>
                                <p className="text-slate-500 mt-1 text-sm font-medium">
                                    {resumes.length === 0
                                        ? "Let's build your first resume and start getting noticed."
                                        : totalViews > 0
                                            ? <span>Your resumes have been viewed <strong className="text-[#0A2A6B]">{totalViews} time{totalViews !== 1 ? 's' : ''}</strong> total.</span>
                                            : <span>Share your resume link to start tracking views.</span>
                                    }
                                </p>
                            </div>
                            {/* Secondary CTA — visible on all viewports */}
                            <Link
                                to="/create"
                                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#0A2A6B]/20 text-[#0A2A6B] rounded-xl font-semibold text-sm hover:bg-[#0A2A6B]/5 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                New Resume
                            </Link>
                        </div>

                        {/* 2. ACTION ZONE — ForensicFixCard is TOP PRIORITY */}
                        {analyticsData?.recommendation && (
                            <ForensicFixCard
                                fix={analyticsData.recommendation.fix}
                                resumeTitle={analyticsData.recommendation.resume_title}
                                isFallback={!analyticsData.recommendation.resume_id}
                                onFix={() => {
                                    const rect = analyticsData.recommendation!;
                                    const rid = rect.resume_id || (resumes.length > 0 ? resumes[0].id : null);
                                    if (rid) navigate(`/resume/edit/${rid}`, {
                                        state: { suggestion: rect.fix }
                                    });
                                }}
                                onNext={fetchAnalytics}
                            />
                        )}

                        {/* 3. PERFORMANCE STATS */}
                        <StatsGrid analyticsData={analyticsData} />

                        {/* 4. CONTENT: Resumes + Activity */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="xl:col-span-2 space-y-6">
                                {/* Resume List */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/20 overflow-hidden">
                                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                        <h2 className="text-base font-bold text-slate-950 flex items-center gap-2.5">
                                            <FileText className="w-4 h-4 text-[#0A2A6B]" />
                                            Your Resumes
                                        </h2>
                                        <span className="text-xs font-medium text-slate-400">
                                            {resumes.length} {resumes.length === 1 ? 'document' : 'documents'}
                                        </span>
                                    </div>

                                    {resumes.length === 0 ? (
                                        /* GUIDED EMPTY STATE — outcome-driven */
                                        <div className="p-10 text-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-[#0A2A6B]/5 to-[#4DCFFF]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                                <Sparkles className="w-7 h-7 text-[#0A2A6B]" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-950 mb-2">Get discovered by recruiters</h3>
                                            <p className="text-sm text-slate-500 mb-1 max-w-sm mx-auto">
                                                Create a resume to start tracking who's viewing it, where they're from, and how long they read.
                                            </p>
                                            <p className="text-xs text-slate-400 mb-6 flex items-center justify-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                Takes less than 2 minutes · 100% free
                                            </p>
                                            <Link 
                                                to="/create" 
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A2A6B] text-white rounded-xl text-sm font-bold shadow-md shadow-[#0A2A6B]/20 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            >
                                                Create Resume
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100/50">
                                            {resumes.map((resume: any) => (
                                                <ResumeCard 
                                                    key={resume.id}
                                                    resume={resume}
                                                    isRenaming={isRenaming === resume.id}
                                                    setIsRenaming={setIsRenaming}
                                                    onRename={async (id, title) => {
                                                        try {
                                                            await renameResumeAction({ id, title });
                                                            return true;
                                                        } catch (err) {
                                                            console.error('Rename failed:', err);
                                                            return false;
                                                        }
                                                    }}
                                                    onDelete={async (id: string) => {
                                                        return new Promise<boolean>((resolve) => {
                                                            confirmAction(
                                                                "Delete Resume?", 
                                                                "This action cannot be undone. All analytics for this link will be lost.",
                                                                async () => {
                                                                    try {
                                                                        await deleteResumeAction(id);
                                                                        resolve(true);
                                                                    } catch (err) {
                                                                        console.error('Delete failed:', err);
                                                                        resolve(false);
                                                                    }
                                                                }
                                                            );
                                                        });
                                                    }}
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

                            {/* RIGHT SIDEBAR — Quick Tips (replaces fake Competitive Edge) */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-lg shadow-slate-200/10">
                                    <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                        <Lightbulb className="w-3.5 h-3.5" />
                                        Quick Tips
                                    </h3>
                                    <div className="space-y-4">
                                        {resumes.length === 0 ? (
                                            <>
                                                <TipItem 
                                                    text="Import an existing resume to get started in seconds"
                                                    action="Import"
                                                    onClick={() => navigate('/profile')}
                                                />
                                                <TipItem 
                                                    text="Run a free ATS check to see how your resume scores"
                                                    action="Check"
                                                    onClick={() => navigate('/ats-checker')}
                                                />
                                            </>
                                        ) : totalViews === 0 ? (
                                            <>
                                                <TipItem 
                                                    text="Share your resume link to start getting views"
                                                    action="Share"
                                                    onClick={() => {
                                                        if (resumes[0]) {
                                                            setSharingResume(resumes[0]);
                                                            setIsShareModalOpen(true);
                                                        }
                                                    }}
                                                />
                                                <TipItem 
                                                    text="Run an ATS analysis to improve your score"
                                                    action="Analyze"
                                                    onClick={() => navigate('/ats-checker')}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <TipItem 
                                                    text={`${totalViews} view${totalViews !== 1 ? 's' : ''} and ${totalDownloads} download${totalDownloads !== 1 ? 's' : ''} across your resumes`}
                                                />
                                                <TipItem 
                                                    text="Keep your resume updated to maintain high ATS scores"
                                                    action="Edit"
                                                    onClick={() => resumes[0] && navigate(`/resume/edit/${resumes[0].id}`)}
                                                />
                                            </>
                                        )}
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

            {isShareModalOpen && sharingResume && userProfile && (
                <ShareModal
                    resume={sharingResume}
                    username={(userProfile as any).username}
                    onClose={() => setIsShareModalOpen(false)}
                    onUpdate={() => {
                        setIsShareModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

/* ─── Inline Sub-component: Tip Item ─── */
const TipItem: React.FC<{ text: string; action?: string; onClick?: () => void }> = ({ text, action, onClick }) => (
    <div className="flex items-start gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#4DCFFF] mt-2 shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
            {action && onClick && (
                <button 
                    onClick={onClick}
                    className="text-xs font-bold text-[#0A2A6B] hover:text-[#4DCFFF] transition-colors mt-1"
                >
                    {action} →
                </button>
            )}
        </div>
    </div>
);

export default Dashboard;
