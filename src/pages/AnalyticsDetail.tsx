import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, Eye, Users, Clock, FileText, Globe, 
    Smartphone, Search, Loader2, AlertCircle, 
    Zap, Target, Link as LinkIcon 
} from 'lucide-react';
import { 
    LineChart, Line, ResponsiveContainer 
} from 'recharts';
import { getDashboardAnalytics } from '../services/analytics';
import type { AnalyticsData } from '../services/analytics';

const AnalyticsDetail: React.FC = () => {
    const { type } = useParams<{ type: string }>(); // 'traffic' or 'engagement'
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getDashboardAnalytics();
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
                                Decision Intelligence v13
                            </span>
                        </div>
                        <p className="text-slate-500 font-medium max-w-2xl">
                            {description}
                        </p>
                    </div>
                    
                    {/* Behavioral Funnel (v13.0.0) */}
                    {data.funnel && (
                        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/10 flex gap-8 items-center">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Views</p>
                                <p className="text-xl font-bold text-slate-900">{data.funnel.views}</p>
                            </div>
                            <div className="w-px h-8 bg-slate-100"></div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Engaged Viewers</p>
                                <p className="text-xl font-bold text-slate-900">{data.funnel.engagement}</p>
                            </div>
                            <div className="w-px h-8 bg-slate-100"></div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Downloads</p>
                                <p className="text-xl font-bold text-slate-900">{data.funnel.downloads}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Intelligence Stats Cards (v13.0.0) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:border-[#0A2A6B]/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-[#0A2A6B] rounded-2xl">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engagement Power</p>
                                <p className="text-2xl font-bold text-slate-900">{data.summary.power_score}%</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 font-medium">
                                Probabilistic score based on duration + scroll + interactions.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:border-emerald-500/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time-to-Value (TTV)</p>
                                <p className="text-2xl font-bold text-slate-900">{data.summary.ttv_median?.toFixed(1) || '0.0'}s</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 font-medium">
                                Median time until the first recruiter interaction/scroll.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Platform</p>
                                <p className="text-2xl font-bold text-slate-900 capitalize">{topDevice?.[0] || 'Desktop'}</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 font-medium">
                                {topDevice ? `Yields ${Math.round(topDevice[1] * 100)}% engagement.` : 'Waiting for more traffic data.'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Success Prob.</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {(Math.max(...(data.resume_performance || []).map(r => r.success_probability), 0.1) * 100).toFixed(0)}%
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 font-medium">
                                Predicted download probability for your top resume.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Predictive Performance Table (v13.0.0) */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden">
                    <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-white to-slate-50/50">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Resume Diagnostic Engine</h2>
                            <p className="text-sm text-slate-400 font-medium mt-1">Causal-aware performance tracking and conversion prediction.</p>
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
                                    <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest">Causal Trend</th>
                                    <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest">Engagement Score</th>
                                    <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest">Success Prob.</th>
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
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Views: {item.views}</span>
                                                            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                                            {item.insight_tag && (
                                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${
                                                                    item.insight_tag === 'Top Performer' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                                                                    item.insight_tag === 'Discovery Friction' ? 'bg-amber-500 text-white' :
                                                                    item.insight_tag === 'Weak Narrative' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' :
                                                                    item.insight_tag === 'Trending' ? 'bg-[#0A2A6B] text-white' :
                                                                    'bg-slate-100 text-slate-500'
                                                                }`}>
                                                                    {item.insight_tag}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="w-32 h-12">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={data.resume_trends?.[item.id] || data.trends}>
                                                            <Line 
                                                                type="monotone" 
                                                                dataKey="views" 
                                                                stroke={item.engagement_score > 0.6 ? '#10B981' : item.engagement_score < 0.3 ? '#EF4444' : '#0A2A6B'} 
                                                                strokeWidth={3} 
                                                                dot={false} 
                                                                isAnimationActive={true}
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-black text-slate-900">{(item.engagement_score * 100).toFixed(0)}%</span>
                                                    <div className="flex-1 min-w-[60px] h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-700 ${item.engagement_score > 0.6 ? 'bg-emerald-500' : item.engagement_score > 0.4 ? 'bg-blue-500' : 'bg-slate-300'}`}
                                                            style={{ width: `${item.engagement_score * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Behavioral quality</p>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col gap-1">
                                                    <div className={`text-lg font-black ${item.success_probability > 0.7 ? 'text-emerald-600' : item.success_probability > 0.4 ? 'text-blue-600' : 'text-slate-400'}`}>
                                                        {(item.success_probability * 100).toFixed(0)}%
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <div 
                                                                key={s} 
                                                                className={`h-1 w-3 rounded-full ${s <= Math.round(item.success_probability * 5) ? (item.success_probability > 0.7 ? 'bg-emerald-500' : 'bg-blue-500') : 'bg-slate-100'}`} 
                                                            />
                                                        ))}
                                                    </div>
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
                                        <td colSpan={5} className="px-8 py-32 text-center">
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

                {/* Geographic and Reference Segmentation (v13.0.0) */}
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
