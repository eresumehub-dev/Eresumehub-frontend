import React from 'react';
import { Eye, Clock, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatsGridProps {
    analyticsData: any;
}

const StatsGrid: React.FC<StatsGridProps> = ({ analyticsData }) => {
    const powerScore = analyticsData?.summary?.power_score || 0;
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Compact Power Score Card */}
            <div className="lg:col-span-4 bg-white rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="relative mb-6 w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                        <circle
                            cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                            strokeDasharray={2 * Math.PI * 58}
                            strokeDashoffset={2 * Math.PI * 58 * (1 - (powerScore / 100))}
                            strokeLinecap="round" className="text-[#0A2A6B]"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-slate-900 leading-none">{powerScore || '—'}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Power Score</span>
                    </div>
                </div>
                <div className="text-center">
                    <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${powerScore >= 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {powerScore >= 80 ? 'EXCELLENT' : 'COMPETITIVE'}
                    </div>
                </div>
            </div>

            {/* Three Smaller Metric Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/analytics/traffic" className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl transition-all group flex flex-col justify-between cursor-pointer">
                    <div className="p-2.5 bg-blue-50 text-[#0A2A6B] rounded-xl w-fit mb-4"><Eye className="w-5 h-5" /></div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Portfolio Traffic</p>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{analyticsData?.summary?.total_views || 0}</h3>
                    </div>
                </Link>

                <Link to="/analytics/engagement" className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl transition-all group flex flex-col justify-between cursor-pointer">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl w-fit mb-4"><Clock className="w-5 h-5" /></div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg. Time Spent</p>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{analyticsData?.summary?.avg_time_spent || 0}s</h3>
                    </div>
                </Link>

                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl transition-all group flex flex-col justify-between">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4"><Download className="w-5 h-5" /></div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Downloads</p>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{analyticsData?.summary?.total_downloads || 0}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsGrid;
