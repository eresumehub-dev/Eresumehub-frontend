import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDashboardAnalytics, AnalyticsData } from '../services/analytics';
import { ArrowLeft, FileText, Eye, Clock, Users, Loader2, AlertCircle } from 'lucide-react';

const AnalyticsDetail: React.FC = () => {
    const { type } = useParams<{ type: string }>(); // 'traffic' or 'engagement'
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getDashboardAnalytics();
                // @ts-ignore - response structure match
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch analytics details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#0A2A6B]" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">Failed to load data</h3>
                    <button onClick={() => navigate('/dashboard')} className="mt-4 text-[#0A2A6B] font-bold">Return to Dashboard</button>
                </div>
            </div>
        );
    }

    const title = type === 'traffic' ? 'Portfolio Traffic' : type === 'engagement' ? 'Time Engagement' : 'Analytics Details';
    const description = type === 'traffic'
        ? 'Detailed breakdown of views and unique visitors across your resumes.'
        : 'Analysis of how long recruiters and hiring managers are reading your resumes.';

    // Sort data based on type
    const sortedResumes = [...data.resume_performance].sort((a, b) => {
        if (type === 'engagement') {
            return b.avg_time - a.avg_time;
        }
        return b.views - a.views;
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#0A2A6B] uppercase tracking-widest mb-4 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Command Center
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">
                            {title}
                        </h1>
                        <p className="text-slate-500 font-medium max-w-2xl">
                            {description}
                        </p>
                    </div>
                </div>

                {/* Main Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-blue-50 text-[#0A2A6B] rounded-xl">
                                <Eye className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Views</p>
                                <p className="text-2xl font-bold text-slate-900">{data.summary.total_views}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unique Visitors</p>
                                <p className="text-2xl font-bold text-slate-900">{data.summary.unique_viewers}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Time Spent</p>
                                <p className="text-2xl font-bold text-slate-900">{data.summary.avg_time_spent}s</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                    <div className="p-8 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900">Performance Breakdown</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resume</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Views</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unique People</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Time</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Downloads</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sortedResumes.length > 0 ? (
                                    sortedResumes.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-12 bg-white border border-slate-200 rounded flex items-center justify-center text-slate-300 shadow-sm group-hover:border-[#0A2A6B]/30 group-hover:text-[#0A2A6B] transition-all">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">{item.title}</h4>
                                                        <p className="text-xs text-slate-400 mt-1">AWS Score: {item.score}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#0A2A6B] rounded-full text-xs font-bold">
                                                    <Eye className="w-3 h-3" />
                                                    {item.views}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-slate-600">{item.unique_viewers}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${item.avg_time > 30 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    <Clock className="w-3 h-3" />
                                                    {item.avg_time}s
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-slate-900">{item.downloads}</div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => navigate(`/resume/edit/${item.id}`)}
                                                    className="px-4 py-2 bg-white border-2 border-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:border-[#0A2A6B] hover:text-[#0A2A6B] transition-all"
                                                >
                                                    Optimize
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-12 text-center text-slate-400 text-sm">
                                            No analytics data available yet. Share your resume to start tracking!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDetail;
