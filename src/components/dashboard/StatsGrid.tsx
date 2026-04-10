import React from 'react';
import { Eye, Download, TrendingUp, FileText } from 'lucide-react';

interface StatsGridProps {
    analyticsData: any;
    resumeCount: number;
}

const StatsGrid: React.FC<StatsGridProps> = ({ analyticsData, resumeCount }) => {
    // 1. EXTRACT REAL-TIME TELEMETRY (Unified with Backend Schema)
    const totalViews = analyticsData?.summary?.total_views || 0;
    const totalDownloads = analyticsData?.summary?.total_downloads || 0;
    const avgAtsScore = analyticsData?.summary?.power_score || 0; // Using power_score as Avg ATS proxy
    
    const stats = [
        {
            label: 'Total Views', 
            val: totalViews.toLocaleString(), 
            trend: analyticsData?.summary?.views_trend || null, 
            icon: <Eye className="w-5 h-5 text-[#0066CC]"/>, 
            bg: 'bg-[#0066CC]/10'
        }, 
        {
            label: 'Downloads', 
            val: totalDownloads.toLocaleString(), 
            trend: analyticsData?.summary?.downloads_trend || null, 
            icon: <Download className="w-5 h-5 text-[#34C759]"/>, 
            bg: 'bg-[#34C759]/10'
        }, 
        {
            label: 'Avg ATS Score', 
            val: `${avgAtsScore}%`, 
            trend: analyticsData?.summary?.score_trend || null, 
            icon: <TrendingUp className="w-5 h-5 text-[#AF52DE]"/>, 
            bg: 'bg-[#AF52DE]/10'
        }, 
        {
            label: 'Active Resumes', 
            val: resumeCount.toString(), 
            trend: null, 
            icon: <FileText className="w-5 h-5 text-[#FF9F0A]"/>, 
            bg: 'bg-[#FF9F0A]/10'
        }
    ];

    return (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-[17px] font-semibold text-[#1D1D1F] tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#86868B]" />
                    Analytics Overview
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(s => (
                    <div 
                        key={s.label} 
                        className="bg-white rounded-[1.5rem] p-6 border border-black/[0.02] shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 text-left w-full"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${s.bg}`}>
                                {s.icon}
                            </div>
                            {s.trend && (
                                <span className={`text-[12px] font-medium px-2.5 py-1 rounded-md ${
                                    s.trend.startsWith('+') ? 'text-[#34C759] bg-[#34C759]/10' : 'text-[#FF3B30] bg-[#FF3B30]/10'
                                }`}>
                                    {s.trend}
                                </span>
                            )}
                        </div>
                        <div className="text-[26px] font-medium tracking-tight text-[#1D1D1F] leading-none mb-1.5">{s.val}</div>
                        <div className="text-[13px] text-[#86868B] font-medium">{s.label}</div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-[#F5F5F7]/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatsGrid;
