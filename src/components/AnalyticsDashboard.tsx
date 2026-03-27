import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { Clock, Eye, Download, TrendingUp, Globe, Smartphone, Monitor } from 'lucide-react';
import { getDashboardAnalytics, AnalyticsData } from '../services/analytics';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#0A2A6B', '#4DCFFF', '#10B981', '#F59E0B'];

const AnalyticsDashboard: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAnalytics = async () => {
            if (user?.id) { // Use platform ID usually, but here we might need auth ID depending on service
                // Getting the correct ID is tricky. Let's assume user.id (platform id) is what matches resumes.
                // Or better, let the backend handle "me". But our service takes ID.
                try {
                    const analytics = await getDashboardAnalytics(user.id);
                    setData(analytics.data);
                } catch (e) {
                    console.error("Failed to load analytics", e);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadAnalytics();
    }, [user]);

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0A2A6B] border-t-transparent"></div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Total Views"
                    value={data.summary.total_views}
                    icon={Eye}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <SummaryCard
                    title="Total Downloads"
                    value={data.summary.total_downloads}
                    icon={Download}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
                <SummaryCard
                    title="Avg. Time Spent"
                    value={`${data.summary.avg_time_spent}s`}
                    icon={Clock}
                    color="text-amber-600"
                    bgColor="bg-amber-50"
                />
                <SummaryCard
                    title="Conversion Rate"
                    value={`${data.summary.conversion_rate}%`}
                    icon={TrendingUp}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Views Trend */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#0A2A6B]" />
                        Views Over Time (30 Days)
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.trends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="created_at"
                                    tickFormatter={(val) => new Date(val).getDate().toString()}
                                    stroke="#94A3B8"
                                    fontSize={12}
                                />
                                <YAxis stroke="#94A3B8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#0A2A6B"
                                    strokeWidth={3}
                                    dot={{ fill: '#0A2A6B', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Device/Geo Stats */}
                <div className="space-y-6">
                    {/* Device Breakdown */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-gray-500" />
                            Devices
                        </h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.device_stats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="count"
                                    >
                                        {data.device_stats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 text-xs font-medium text-slate-500">
                            {data.device_stats.map((entry, index) => (
                                <div key={entry.device} className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    {entry.device} ({entry.count})
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Geo Stats (Simplified List) */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-400" />
                            Top Locations
                        </h3>
                        <div className="space-y-3">
                            {data.geo_distribution.slice(0, 5).map((geo, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 font-medium">{geo.country}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#4DCFFF] rounded-full"
                                                style={{ width: `${(geo.visitors / data.summary.total_views) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-slate-900 font-bold min-w-[20px] text-right">{geo.visitors}</span>
                                    </div>
                                </div>
                            ))}
                            {data.geo_distribution.length === 0 && <p className="text-slate-400 text-sm italic">No data yet</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Resume Performance Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50">
                    <h3 className="text-lg font-bold text-slate-900">Top Performing Resumes</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Resume Title</th>
                                <th className="px-6 py-4">Views</th>
                                <th className="px-6 py-4">Downloads</th>
                                <th className="px-6 py-4">Engagement</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.resume_performance.map((resume, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">{resume.title || 'Untitled Resume'}</td>
                                    <td className="px-6 py-4 text-slate-600">{resume.views}</td>
                                    <td className="px-6 py-4 text-slate-600">{resume.downloads}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${(resume.downloads / (resume.views || 1)) > 0.1
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {((resume.downloads / (resume.views || 1)) * 100).toFixed(0)}% Conv.
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {data.resume_performance.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No performance data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
        </div>
    </div>
);

export default AnalyticsDashboard;
