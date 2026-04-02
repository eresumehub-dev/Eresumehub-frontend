import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDashboardAnalytics, AnalyticsData } from '../services/analytics';
import { ArrowLeft, FileText, Eye, Clock, Users, Loader2, AlertCircle, Search, ChevronLeft, ChevronRight, Globe, Smartphone } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';

const AnalyticsDetail: React.FC = () => {
    const { type } = useParams<{ type: string }>(); // 'traffic' or 'engagement'
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getDashboardAnalytics();
            // @ts-ignore - response structure match
            setData(response.data);
        } catch (err: any) {
            console.error("Failed to fetch analytics details", err);
            setError("We couldn't load your analytics. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#0A2A6B]" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
                <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 max-w-md w-full text-center">
                    <div className="p-4 bg-red-50 text-red-500 rounded-2xl w-fit mx-auto mb-6">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Service Unavailable</h3>
                    <p className="text-slate-500 mb-8">{error || "Failed to load data"}</p>
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={fetchData} 
                            className="bg-foreground text-background py-3 px-6 rounded-xl font-bold hover:opacity-90 transition-all"
                        >
                            Try Again
                        </button>
                        <button 
                            onClick={() => navigate('/dashboard')} 
                            className="text-slate-500 py-3 px-6 rounded-xl font-bold hover:bg-slate-50 transition-all"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const title = type === 'traffic' ? 'Portfolio Traffic' : type === 'engagement' ? 'Time Engagement' : 'Analytics Details';
    const description = type === 'traffic'
        ? 'Detailed breakdown of views and unique visitors across your resumes.'
        : 'Analysis of how long recruiters and hiring managers are reading your resumes.';

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Filter and Sort data
    const filteredResumes = (data?.resume_performance || []).filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedResumes = [...filteredResumes].sort((a, b) => {
        if (type === 'engagement') {
            return b.avg_time - a.avg_time;
        }
        return b.views - a.views;
    });

    const paginatedResumes = sortedResumes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(sortedResumes.length / itemsPerPage);

    const COLORS = ['#0A2A6B', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

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

                {/* Performance Breakdown Table */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-slate-900">Performance Breakdown</h2>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0A2A6B] transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search resumes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0A2A6B]/10 w-full md:w-64 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resume</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trend (30d)</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Views</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unique People</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Time</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Downloads</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedResumes.length > 0 ? (
                                    paginatedResumes.map((item) => (
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
                                                <div className="w-24 h-8">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={data.trends}>
                                                            <Line 
                                                                type="monotone" 
                                                                dataKey="views" 
                                                                stroke="#0A2A6B" 
                                                                strokeWidth={2} 
                                                                dot={false} 
                                                                isAnimationActive={false}
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
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
                                            {searchTerm ? "No resumes match your search." : "No analytics data available yet."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#0A2A6B] transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                                </button>
                                <button 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#0A2A6B] transition-all"
                                >
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lower Grid: Geo & Devices */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Geo Distribution */}
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-50 text-[#0A2A6B] rounded-lg">
                                <Globe className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Top Locations</h2>
                        </div>
                        <div className="space-y-6">
                            {(data.geo_distribution || []).length > 0 ? (
                                data.geo_distribution.map((item, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-slate-900">{item.country}</span>
                                            <span className="text-slate-400">{item.visitors} visitors</span>
                                        </div>
                                        <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-[#0A2A6B] rounded-full" 
                                                style={{ width: `${(item.visitors / data.summary.total_views) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-sm text-center py-8">No location data available.</p>
                            )}
                        </div>
                    </div>

                    {/* Device Breakdown */}
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Device Breakdown</h2>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-full h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.device_stats}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={8}
                                            dataKey="count"
                                            nameKey="device"
                                        >
                                            {(data.device_stats || []).map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full space-y-4">
                                {(data.device_stats || []).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                            <span className="text-sm font-bold text-slate-600 capitalize">{item.device}</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDetail;
