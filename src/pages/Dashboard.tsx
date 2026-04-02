import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Plus, FileText, BarChart3, Settings, Download, Trash2, Edit3,
    ChevronRight, HelpCircle,
    Home, Layout, User, X, Check, Share2,
    Clock, Eye, Activity, Star
} from 'lucide-react';
import { getResumes, deleteResume, updateResume, Resume } from '../services/resume';
import { getProfile, UserProfile } from '../services/profile';
import { getMe } from '../services/auth';
import ShareModal from '../components/ShareModal';
import { getDashboardAnalytics } from '../services/analytics';
import ForensicFixCard from '../components/ForensicFixCard';

const Dashboard: React.FC = () => {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRenaming, setIsRenaming] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [activeUser, setActiveUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [sharingResume, setSharingResume] = useState<Resume | null>(null);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [systemStats, setSystemStats] = useState<any>(null);

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                // Run all API calls in parallel
                await Promise.allSettled([
                    fetchResumes(),
                    fetchUserDetails(),
                    fetchAnalytics(),
                    fetchSystemHealth(),
                    fetchProfile()
                ]);
            } catch (error) {
                console.error('Dashboard load error:', error);
            } finally {
                // Always clear loading state, even if requests fail
                setLoading(false);
            }
        };

        if (user) {
            loadDashboard();
        }
    }, [user]);

    const fetchSystemHealth = async () => {
        try {
            const response = await api.get('/system/stats');
            setSystemStats(response.data);
        } catch {
            setSystemStats({ status: "OFFLINE" });
        }
    };

    const fetchAnalytics = async () => {
        try {
            const data = await getDashboardAnalytics();
            setAnalyticsData(data.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            setAnalyticsData(null);
        }
    };

    const fetchProfile = async () => {
        try {
            const { profile } = await getProfile();
            setUserProfile(profile);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            setUserProfile(null);
        }
    };

    const fetchUserDetails = async () => {
        try {
            const data = await getMe();
            setActiveUser(data.data);
        } catch (error) {
            console.error('Failed to fetch user details:', error);
            setActiveUser(null);
        }
    };

    const fetchResumes = async () => {
        try {
            const data = await getResumes();
            setResumes(data);
        } catch (error: any) {
            console.error('Failed to fetch resumes:', error);
            setResumes([]);
        }
    };


    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this resume?')) {
            try {
                await deleteResume(id);
                setResumes(resumes.filter(r => r.id !== id));
            } catch (error) {
                console.error('Failed to delete resume:', error);
            }
        }
    };

    const handleRename = async (id: string) => {
        if (!newTitle.trim()) return;
        try {
            await updateResume(id, { title: newTitle });
            setResumes(resumes.map(r => r.id === id ? { ...r, title: newTitle } : r));
            setIsRenaming(null);
            setNewTitle('');
        } catch (error) {
            console.error('Failed to rename resume:', error);
            alert('Failed to rename resume');
        }
    };

    const handleDownload = (resume: Resume) => {
        if (resume.pdf_url) {
            const token = localStorage.getItem('token');
            const downloadUrl = token
                ? `${resume.pdf_url}${resume.pdf_url.includes('?') ? '&' : '?'}token=${token}`
                : resume.pdf_url;
            window.open(downloadUrl, '_blank');
        } else {
            alert('PDF is not available for this resume.');
        }
    };

    const getUserInitials = () => {
        const name = user?.user_metadata?.full_name || user?.email || 'User';
        return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0A2A6B] border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-[#1E293B] font-medium">Loading your workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-[#F8FAFC] min-h-[calc(100vh-64px)] relative">

            {/* SIDE NAVIGATION */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-[calc(100vh-64px)]">
                <div className="p-4 border-b border-slate-100 mb-2">
                    <Link
                        to="/create"
                        className="flex items-center justify-center gap-3 w-full py-4 bg-[#0A2A6B] text-white rounded-lg font-bold text-sm shadow-lg shadow-[#0A2A6B]/20 hover:bg-[#061A44] transition-all group"
                    >
                        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                        <span>Create New Resume</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 pt-0 space-y-1 overflow-y-auto">
                    {[
                        { to: "/dashboard", icon: Home, label: "Dashboard", active: true },
                        { to: "/dashboard/resumes", icon: FileText, label: "My Resumes" },
                        { to: "/ats-checker", icon: BarChart3, label: "ATS Checker" },
                        { to: "/templates", icon: Layout, label: "Templates" },
                        { to: "/profile", icon: User, label: "Profile Data" },
                    ].map((item) => (
                        <Link
                            key={item.label}
                            to={item.to}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all group ${item.active
                                ? 'bg-[#0A2A6B]/5 text-[#0A2A6B]'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-[#0A2A6B]'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-4 h-4 ${item.active ? 'text-[#0A2A6B]' : 'text-slate-400 group-hover:text-[#0A2A6B]'}`} />
                                <span className={item.active ? 'font-bold' : ''}>{item.label}</span>
                            </div>
                            <ChevronRight className={`w-3 h-3 transition-opacity ${item.active ? 'opacity-40' : 'opacity-0 group-hover:opacity-40'}`} />
                        </Link>
                    ))}

                    <div className="pt-6 mt-6 border-t border-slate-100">
                        <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preferences</p>
                        <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-all group">
                            <Settings className="w-4 h-4 text-slate-400 group-hover:text-[#0A2A6B]" />
                            <span className="group-hover:text-[#0A2A6B]">Settings</span>
                        </Link>
                        <Link to="/help" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-all group">
                            <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-[#0A2A6B]" />
                            <span className="group-hover:text-[#0A2A6B]">Support</span>
                        </Link>
                    </div>
                </nav>

                <div className="p-3 border-t border-slate-100">
                    {/* Pipeline Status Indicator (Staff+ Elite) */}
                    <div className="flex items-center justify-between px-3 py-2 mb-2 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${systemStats?.status === 'HEALTHY' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Generation Pipeline</span>
                        </div>
                        <span className={`text-[9px] font-bold ${systemStats?.status === 'HEALTHY' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {systemStats?.status || "LOADING"}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                        <div className={`w-8 h-8 rounded-lg border border-white shadow-sm shrink-0 ${userProfile?.photo_url ? 'overflow-hidden' : 'bg-gradient-to-br from-[#0A2A6B] to-[#1E3A8A] flex items-center justify-center text-white font-bold text-[10px]'}`}>
                            {userProfile?.photo_url ? (
                                <img
                                    src={userProfile.photo_url}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.classList.remove('overflow-hidden');
                                        (e.target as HTMLImageElement).parentElement!.classList.add('bg-gradient-to-br', 'from-[#0A2A6B]', 'to-[#1E3A8A]', 'flex', 'items-center', 'justify-center', 'text-white', 'font-bold', 'text-[10px]');
                                        (e.target as HTMLImageElement).parentElement!.innerText = getUserInitials();
                                    }}
                                />
                            ) : (
                                getUserInitials()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-[11px] truncate">
                                {userProfile?.full_name || user?.user_metadata?.full_name || 'Member'}
                            </p>
                            <Link to="/profile" className="text-[9px] text-[#0A2A6B] font-bold uppercase tracking-wider hover:opacity-80">
                                View Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                {/* Compact Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Command Center.
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm font-medium opacity-80">
                            Is your resume working? <span className="text-[#0A2A6B] font-bold">Check your numbers.</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/create"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A2A6B] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#0A2A6B]/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                        >
                            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                            New Resume
                        </Link>
                    </div>
                </div>

                {/* METRICS GRID - Combined Power Score and Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Compact Power Score Card */}
                    <div className="lg:col-span-4 bg-white rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="relative mb-6 w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                                <circle
                                    cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                                    strokeDasharray={2 * Math.PI * 58}
                                    strokeDashoffset={2 * Math.PI * 58 * (1 - ((analyticsData?.summary?.power_score || 0) / 100))}
                                    strokeLinecap="round" className="text-[#0A2A6B]"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-slate-900 leading-none">{analyticsData?.summary?.power_score || '—'}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Power Score</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${(analyticsData?.summary?.power_score || 0) >= 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                {(analyticsData?.summary?.power_score || 0) >= 80 ? 'EXCELLENT' : 'COMPETITIVE'}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-2">Top 15% of candidates</p>
                        </div>
                    </div>

                    {/* Three Smaller Metric Cards */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link to="/analytics/traffic" className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl transition-all group flex flex-col justify-between cursor-pointer">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 bg-blue-50 text-[#0A2A6B] rounded-xl"><Eye className="w-5 h-5" /></div>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Portfolio Traffic</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{analyticsData?.summary?.total_views || 0}</h3>
                                </div>
                            </div>
                        </Link>

                        <Link to="/analytics/engagement" className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl transition-all group flex flex-col justify-between cursor-pointer">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-5 h-5" /></div>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg. Time Spent</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{analyticsData?.summary?.avg_time_spent || 0}s</h3>
                                </div>
                            </div>
                        </Link>

                        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl transition-all group flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Download className="w-5 h-5" /></div>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Downloads</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{analyticsData?.summary?.total_downloads || 0}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* THE ACTION: FORENSIC FIX CARD (DYNAMIC) */}
                {analyticsData?.recommendation && (
                    <ForensicFixCard
                        fix={analyticsData.recommendation.fix}
                        resumeTitle={analyticsData.recommendation.resume_title}
                        isFallback={!analyticsData.recommendation.resume_id} // If no ID, it's a generic fallback
                        onFix={() => {
                            const rid = analyticsData.recommendation.resume_id || (resumes.length > 0 ? resumes[0].id : null);
                            if (rid) navigate(`/resume/edit/${rid}`, {
                                state: { suggestion: analyticsData.recommendation.fix }
                            });
                        }}
                        onNext={fetchAnalytics} // Re-fetch to cycle random tip
                    />
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        {/* RESUME LIST: PORTFOLIO ASSETS */}
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
                                        <Layout className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Build your first masterpiece</h3>
                                    <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm">Our AI is ready to transform your career. Create your first asset to begin.</p>
                                    <Link to="/create" className="inline-flex items-center gap-2 px-8 py-3 bg-[#0A2A6B] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#0A2A6B]/20 hover:scale-[1.05] transition-all">
                                        <Plus className="w-4 h-4" />
                                        New Resume
                                    </Link>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100/50">
                                    {resumes.map((resume) => (
                                        <div key={resume.id} className="p-5 hover:bg-slate-50/30 transition-all group relative">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                                <div className="flex items-start gap-6">
                                                    <div className="w-14 h-16 bg-white border-2 border-slate-100 rounded-lg flex items-center justify-center shadow-sm text-[#0A2A6B] group-hover:border-[#0A2A6B]/20 transition-all">
                                                        <FileText className="w-8 h-8 opacity-70 group-hover:scale-105 transition-transform" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            {isRenaming === resume.id ? (
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        autoFocus
                                                                        className="px-4 py-2 border-2 border-[#0A2A6B] rounded-xl text-base font-bold focus:outline-none shadow-sm"
                                                                        value={newTitle}
                                                                        onChange={(e) => setNewTitle(e.target.value)}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') handleRename(resume.id);
                                                                            if (e.key === 'Escape') setIsRenaming(null);
                                                                        }}
                                                                    />
                                                                    <button onClick={() => handleRename(resume.id)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Check className="w-5 h-5" /></button>
                                                                    <button onClick={() => setIsRenaming(null)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><X className="w-5 h-5" /></button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <h3 className="font-bold text-slate-900 group-hover:text-[#0A2A6B] transition-colors truncate max-w-[200px] md:max-w-md text-xl tracking-tight">
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
                                                            <div className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${resume.resume_data ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                                                }`}>
                                                                {resume.resume_data ? 'Completed' : 'Draft'}
                                                            </div>
                                                            <div className="text-xs font-medium text-slate-400">
                                                                Edited {new Date(resume.updated_at || resume.created_at).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => { setSharingResume(resume); setIsShareModalOpen(true); }}
                                                        className="p-3 text-slate-400 hover:text-[#0A2A6B] hover:bg-[#0A2A6B]/5 rounded-xl transition-all"
                                                        title="Share"
                                                    >
                                                        <Share2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (resume.pdf_url) {
                                                                const url = `${resume.pdf_url}${resume.pdf_url.includes('?') ? '&' : '?'}inline=true`;
                                                                window.open(url, '_blank');
                                                            }
                                                        }}
                                                        className="p-3 bg-slate-50 text-slate-600 hover:text-[#0A2A6B] hover:bg-blue-50 rounded-xl transition-all"
                                                        title="Preview"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/resume/edit/${resume.id}`)}
                                                        className="p-3 bg-slate-50 text-slate-600 hover:text-[#0A2A6B] hover:bg-blue-50 rounded-xl transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit3 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(resume)}
                                                        className="p-3 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/10 hover:bg-black transition-all"
                                                        title="Download PDF"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(resume.id)}
                                                        className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* LINK ACTIVITY TIMELINE - REAL DATA PLACEHOLDER */}
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-[#0A2A6B]" />
                                    Link Activity
                                </h2>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Real-time</span>
                            </div>
                            <div className="p-6">
                                {(analyticsData?.activities && analyticsData.activities.length > 0) ? (
                                    <div className="space-y-6">
                                        {analyticsData.activities.map((activity: any) => (
                                            <div key={activity.id} className="flex items-start gap-4 group/item">
                                                <div className={`p-2 rounded-lg shrink-0 ${activity.type === 'view' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    {activity.type === 'view' ? <Eye className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">
                                                        {activity.type === 'view' ? 'Resume Viewed' : 'Resume Downloaded'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 truncate mt-0.5">
                                                        {activity.resume_title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className="text-slate-200">•</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {activity.country}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover/item:opacity-100 transition-opacity self-center" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Activity className="w-5 h-5 text-slate-300" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-900">No recent activity</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Views and downloads of your resume links will appear here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* PERFORMANCE RANKING */}
                        <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-xl shadow-slate-200/10">
                            <h3 className="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-[0.2em]">Competitive Edge</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-slate-900">Global Ranking</span>
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded uppercase tracking-widest">TOP 12%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-slate-900">Role Match</span>
                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded uppercase tracking-widest">ELITE</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#0A2A6B] rounded-full" style={{ width: '92%' }}></div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Optimization</span>
                                    <span className="text-xs font-bold text-slate-900">{resumes.reduce((acc, r) => acc + (r.resume_data ? 1 : 0), 0)} Scans</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {isShareModalOpen && sharingResume && activeUser && (
                <ShareModal
                    resume={sharingResume}
                    username={activeUser.username}
                    onClose={() => setIsShareModalOpen(false)}
                    onUpdate={(updated) => {
                        setResumes(resumes.map(r => r.id === updated.id ? updated : r));
                        setSharingResume(updated);
                    }}
                />
            )}
        </div>
    );
};

export default Dashboard;
