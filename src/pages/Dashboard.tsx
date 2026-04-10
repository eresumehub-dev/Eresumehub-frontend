import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, FileText, TrendingUp, Sparkles, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

// Hooks
import { useAuth } from '../context/AuthContext';
import { useBootstrapQuery } from '../hooks/queries/useBootstrapQuery';
import { useResumesQuery } from '../hooks/queries/useResumesQuery';
import { useAnalyticsQuery } from '../hooks/queries/useAnalyticsQuery';
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
import Footer from '../components/shared/Footer';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const { data: bootData, isLoading: bootLoading } = useBootstrapQuery();
    const { data: analyticsData } = useAnalyticsQuery();
    const { deleteResumeAction } = useResumesQuery();

    const resumes = bootData?.resumes || [];
    const userProfile = bootData?.profile;
    const activities = analyticsData?.activities || [];

    const { 
        isOpen: isConfirmOpen, title: confirmTitle, message: confirmMessage, 
        confirmAction, close: closeConfirm, handleConfirm 
    } = useConfirmModal();

    // UI state
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [sharingResume, setSharingResume] = useState<any>(null);

    const firstName = (userProfile?.full_name || user?.user_metadata?.full_name || 'there').split(' ')[0];
    const totalViews = analyticsData?.summary?.total_views || 0;

    // Derived: First available resume for the recommendation
    const firstResume = resumes.length > 0 ? resumes[0] : null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
    };

    if (bootLoading) return <div className="bg-[#F5F5F7] min-h-screen pt-[72px]"><Sidebar /><main className="flex-1 p-12 lg:ml-64"><DashboardSkeleton /></main></div>;

    return (
        <div className="bg-[#F5F5F7] min-h-screen relative antialiased text-[#1D1D1F] pt-[72px]">
            <Sidebar />

            <main className="flex-1 lg:ml-64 p-6 md:p-10 lg:p-12 xl:p-16 max-w-[1600px] mx-auto w-full overflow-y-auto">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-10"
                >
                    {/* 1. HEADER */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/[0.04]">
                        <div className="mt-2">
                            <h1 className="text-[2.5rem] md:text-[2.75rem] font-medium text-[#1D1D1F] tracking-tight leading-[1.1] mb-3">
                                Welcome back, {firstName}.
                            </h1>
                            <p className="text-[1.125rem] text-[#86868B] font-light">
                                {totalViews > 0 ? (
                                    <>All your resumes have been viewed <strong className="text-[#1D1D1F] font-medium">{totalViews.toLocaleString()} times!</strong></>
                                ) : (
                                    "Your dashboard is ready. Start by creating or sharing your first resume."
                                )}
                            </p>
                        </div>
                        
                        <button 
                            onClick={() => navigate('/create')}
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#1D1D1F]/90 text-white rounded-[1.25rem] font-medium text-[15px] hover:bg-black active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(0,0,0,0.12)] border border-white/10 shrink-0 self-start md:self-auto"
                        >
                            <Plus className="w-5 h-5" strokeWidth={2} />
                            New Resume
                        </button>
                    </motion.div>

                    {/* 2. PERFORMANCE STATS (Using real-time data) */}
                    <motion.div variants={itemVariants}>
                        <StatsGrid analyticsData={analyticsData} resumeCount={resumes.length} />
                    </motion.div>

                    {/* 3. CONTENT: Resumes + Insights */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        
                        {/* LEFT SIDE: Documents List */}
                        <div className="xl:col-span-2">
                            <div className="bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/[0.02] overflow-hidden">
                                <div className="p-6 md:px-8 border-b border-black/[0.04] flex items-center justify-between bg-white/50 backdrop-blur-md">
                                    <h2 className="text-[17px] font-semibold text-[#1D1D1F] tracking-tight flex items-center gap-2.5">
                                        <FileText className="w-4 h-4 text-[#86868B]" strokeWidth={2} />
                                        Your Documents
                                    </h2>
                                    <span className="text-[12px] font-medium text-[#86868B] bg-[#F5F5F7] px-3 py-1 rounded-full">
                                        {resumes.length} Active
                                    </span>
                                </div>

                                {resumes.length === 0 ? (
                                    <div className="p-16 text-center">
                                        <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            <Sparkles className="w-7 h-7 text-[#1D1D1F]" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-[#1D1D1F] mb-2">Build your first one.</h3>
                                        <p className="text-[15px] text-[#86868B] mb-8 max-w-sm mx-auto font-light">
                                            Create a resume perfectly tailored for global markets in under 2 minutes.
                                        </p>
                                        <button 
                                            onClick={() => navigate('/create')}
                                            className="px-8 py-3.5 bg-[#1D1D1F] text-white rounded-xl font-medium shadow-md hover:bg-black transition-all"
                                        >
                                            Create Resume
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        {resumes.map((resume: any) => (
                                            <ResumeCard 
                                                key={resume.id} 
                                                resume={resume} 
                                                onEdit={(id) => navigate(`/resume/edit/${id}`)}
                                                onPreview={(r) => r.pdf_url && window.open(`${r.pdf_url}${r.pdf_url.includes('?') ? '&' : '?'}inline=true`, '_blank')}
                                                onShare={(r) => { setSharingResume(r); setIsShareModalOpen(true); }}
                                                onDelete={async (id) => {
                                                    return new Promise<boolean>((resolve) => {
                                                        confirmAction(
                                                            "Delete Document?", 
                                                            "This cannot be undone. All activity tracking will be lost.",
                                                            async () => {
                                                                try {
                                                                    await deleteResumeAction(id);
                                                                    resolve(true);
                                                                } catch (err) {
                                                                    resolve(false);
                                                                }
                                                            }
                                                        );
                                                    });
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Activity Feed */}
                            <div className="mt-12">
                                <ActivityTimeline activities={activities} />
                            </div>
                        </div>

                        {/* RIGHT SIDE: Actionable Insights */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-[14px] font-semibold text-[#86868B] uppercase tracking-widest">
                                    Actionable Insights
                                </h2>
                            </div>
                            
                            {analyticsData?.recommendation ? (
                                <ForensicFixCard
                                    fix={analyticsData.recommendation.fix}
                                    resumeTitle={analyticsData.recommendation.resume_title}
                                    onFix={() => {
                                        const rid = analyticsData.recommendation?.resume_id || firstResume?.id;
                                        if (rid) navigate(`/resume/edit/${rid}`);
                                    }}
                                />
                            ) : (
                                <div className="bg-white rounded-[1.5rem] p-6 border border-black/[0.03] shadow-sm flex flex-col items-center text-center">
                                    <div className="w-12 h-12 bg-[#34C759]/10 rounded-full flex items-center justify-center mb-4">
                                        <TrendingUp className="w-6 h-6 text-[#34C759]" />
                                    </div>
                                    <h4 className="text-[16px] font-medium text-[#1D1D1F] mb-1">Your profile looks solid!</h4>
                                    <p className="text-[13px] text-[#86868B]">No immediate compliance risks detected.</p>
                                </div>
                            )}

                            {/* Static Info card */}
                            <div className="bg-[#1D1D1F] rounded-[1.5rem] p-6 text-white relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h4 className="text-[17px] font-medium mb-2 pr-12">Global Markets are changing.</h4>
                                    <p className="text-[13px] text-white/70 font-light leading-relaxed mb-6">
                                        Germany and USA now prioritize specific metric-driven achievements. Optimize your documents today.
                                    </p>
                                    <button 
                                        onClick={() => navigate('/ats-checker')}
                                        className="inline-flex items-center gap-2 text-[13px] font-bold text-white hover:gap-3 transition-all"
                                    >
                                        Run Free Scan <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
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
                    onUpdate={() => setIsShareModalOpen(false)}
                />
            )}
            <Footer />
        </div>
    );
};

export default Dashboard;
