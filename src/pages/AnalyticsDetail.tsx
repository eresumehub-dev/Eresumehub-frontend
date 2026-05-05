import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, Clock, FileText, Globe, 
    Smartphone, Search, Loader2, AlertCircle, 
    Zap, Target, Link as LinkIcon, Download, MousePointer2, Users
} from 'lucide-react';
import { 
    LineChart, Line, ResponsiveContainer 
} from 'recharts';
import { useAnalyticsQuery } from '../hooks/queries/useAnalyticsQuery';

const AnalyticsDetail: React.FC = () => {
    const { type } = useParams<{ type: string }>(); // 'traffic' or 'engagement'
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const { data, isLoading, isError, error: queryError, refetch } = useAnalyticsQuery();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#0A2A6B]" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
                <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 max-w-md w-full text-center">
                    <div className="p-4 bg-red-50 text-red-500 rounded-2xl w-fit mx-auto mb-6">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Service Unavailable</h3>
                    <p className="text-slate-500 mb-8">{queryError?.message || "Failed to load data"}</p>
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => refetch()} 
                            className="bg-[#0A2A6B] text-white py-3 px-6 rounded-xl font-bold hover:opacity-90 transition-all"
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

    // Filter and Sort data
    const filteredResumes = (data?.resume_performance || []).filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedResumes = [...filteredResumes].sort((a, b) => b.views - a.views);

    // Segmentation Insights
    const topDevice = data.segments?.device ? 
        Object.entries(data.segments.device).sort((a,b) => b[1] - a[1])[0] : null;

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
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                                {title}
                            </h1>
                            <span className="px-3 py-1 bg-indigo-50 text-[#0A2A6B] text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
                                Decision Intelligence v16
                            </span>
                        </div>
                        <p className="text-slate-500 font-medium max-w-2xl">
                            {description}
                        </p>
                    </div>
                    
                    {/* Behavioral Funnel (v16.0.0) */}
                    {data.funnel && (
                        <div className="bg-white p-4 sm:p-5 rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/10 grid grid-cols-3 sm:flex sm:gap-8 items-center divide-x divide-slate-100 sm:divide-x-0">
                            <div className="text-center px-2 sm:px-0">
                                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Views</p>
                                <p className="text-lg sm:text-xl font-bold text-slate-900">{data.funnel.views}</p>
                            </div>
                            <div className="text-center px-2 sm:px-0 border-l sm:border-l-0">
                                <p className="text-[9px] sm:text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Engaged</p>
                                <p className="text-lg sm:text-xl font-bold text-slate-900">{data.funnel.engagement}</p>
                            </div>
                            <div className="text-center px-2 sm:px-0 border-l sm:border-l-0">
                                <p className="text-[9px] sm:text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Downloads</p>
                                <p className="text-lg sm:text-xl font-bold text-slate-900">{data.funnel.downloads}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Intelligence Stats Cards (v16.5.0 Premium Redesign) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:border-[#0A2A6B]/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-[#0A2A6B] rounded-2xl group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engagement Power</p>
                                <p className="text-2xl font-bold text-slate-900">{data.summary.power_score}%</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <p className="text-[10px] text-slate-400 font-medium">Interaction Velocity</p>
                            <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                Live
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:border-emerald-500/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Session Time</p>
                                <p className="text-2xl font-bold text-slate-900">{data.summary.avg_time_spent?.toFixed(1) || '0.0'}s</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 font-medium">
                                Median reading duration per visitor.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:border-indigo-500/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                                <Download className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Downloads</p>
                                <p className="text-2xl font-bold text-slate-900">{data.summary.total_downloads}</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 font-medium">
                                {data.summary.conversion_rate}% Conversion from views.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:border-amber-500/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unique Reach</p>
                                <p className="text-2xl font-bold text-slate-900">{data.summary.unique_viewers}</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 font-medium">
                                Distinct recruiter sessions captured.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Diagnostic Performance Table (v16.5.0) */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden">
                    <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-white to-slate-50/50">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Resume Diagnostic Engine</h2>
                            <p className="text-sm text-slate-400 font-medium mt-1">Real-time performance tracking and behavioral engagement metrics.</p>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0A2A6B] transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search your catalog..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-[#0A2A6B]/5 focus:border-[#0A2A6B]/20 w-full md:w-80 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400">
                                    <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest">Resume Artifact</th>
                                    <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-center">Views</th>
                                    <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-center">Downloads</th>
                                    <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-center">Recruiter Actions</th>
                                    <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest">Engagement</th>
                                    <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest">Avg. Duration</th>
                                    <th className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sortedResumes.length > 0 ? (
                                    sortedResumes.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-16 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-center text-slate-300 shadow-md group-hover:border-[#0A2A6B]/40 group-hover:text-[#0A2A6B] group-hover:-translate-y-1 transition-all duration-300">
                                                        <FileText className="w-7 h-7" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-base group-hover:text-[#0A2A6B] transition-colors">{item.title}</h4>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter bg-slate-100 text-slate-500">
                                                                {item.insight_tag || 'Stable'}
                                                            </span>
                                                            {item.downloads > 0 && (
                                                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter bg-emerald-50 text-emerald-600 flex items-center gap-1">
                                                                    <Download className="w-2 h-2" />
                                                                    Converted
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg font-black text-slate-900">{item.views}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sessions</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg font-black text-slate-900">{item.downloads}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Files</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg font-black text-indigo-600">{item.contact_clicks || 0}</span>
                                                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Clicks</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-black text-slate-900">{(item.engagement_score * 100).toFixed(0)}%</span>
                                                    <div className="flex-1 min-w-[60px] h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-700 ${item.engagement_score > 0.6 ? 'bg-emerald-500' : item.engagement_score > 0.4 ? 'bg-blue-500' : 'bg-slate-300'}`}
                                                            style={{ width: `${item.engagement_score * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-slate-300" />
                                                    <span className="text-base font-bold text-slate-600">{item.avg_duration || 0}s</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <button
                                                    onClick={() => navigate(`/resume/edit/${item.id}`)}
                                                    className="px-6 py-3 bg-[#0A2A6B] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-900/20"
                                                >
                                                    Fix Resume
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-6 bg-slate-50 rounded-[32px] mb-6">
                                                    <Search className="w-12 h-12 text-slate-200" />
                                                </div>
                                                <p className="text-slate-900 text-lg font-bold">No intelligence detected</p>
                                                <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">
                                                    Share your public resume link to begin generating decision insights.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Geographic and Reference Segmentation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Referrer Segmentation */}
                    <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="p-3 bg-indigo-50 text-[#0A2A6B] rounded-2xl">
                                <LinkIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Traffic Quality by Source</h2>
                                <p className="text-xs text-slate-400 font-medium mt-1">Measured by mean probabilistic engagement.</p>
                            </div>
                        </div>
                        <div className="space-y-8">
                            {data.segments?.referrer && Object.keys(data.segments.referrer).length > 0 ? (
                                Object.entries(data.segments.referrer).map(([source, score], idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between items-center text-sm font-bold mb-3">
                                            <span className="text-slate-900 capitalize flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                {source === 'Direct' ? 'Direct / Links' : source}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-400 text-xs">Engage Score:</span>
                                                <span className="text-[#0A2A6B] font-black text-lg">{(score * 100).toFixed(0)}</span>
                                            </div>
                                        </div>
                                        <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                                            <div 
                                                className="h-full bg-[#0A2A6B] rounded-full group-hover:brightness-110 transition-all duration-1000" 
                                                style={{ width: `${score * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-sm text-center py-10">Waiting for referral segmentation signals...</p>
                            )}
                        </div>
                    </div>

                    {/* Geo Reach */}
                    <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="p-3 bg-blue-50 text-[#0A2A6B] rounded-2xl">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Global Signal Reach</h2>
                                <p className="text-xs text-slate-400 font-medium mt-1">Recruiter distribution by geographic territory.</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {(data.geo_distribution || []).length > 0 ? (
                                data.geo_distribution.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full border border-slate-100 shadow-sm font-black text-[#0A2A6B] text-[10px]">
                                                {idx + 1}
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{item.country}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-black text-slate-900">{item.visitors}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sessions</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-sm text-center py-10">No geographic fingerprints detected yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDetail;
