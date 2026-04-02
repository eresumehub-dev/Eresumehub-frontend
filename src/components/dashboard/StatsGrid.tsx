import React from 'react';
import { Eye, Clock, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatsGridProps {
    analyticsData: any;
}

const StatsGrid: React.FC<StatsGridProps> = ({ analyticsData }) => {
    const powerScore = analyticsData?.summary?.power_score || 0;
    const totalViews = analyticsData?.summary?.total_views || 0;
    const avgTime = analyticsData?.summary?.avg_time_spent || 0;
    const totalDownloads = analyticsData?.summary?.total_downloads || 0;
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Power Score Card */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/40 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="relative mb-5 w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="7" fill="transparent" className="text-slate-100" />
                        <circle
                            cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="7" fill="transparent"
                            strokeDasharray={2 * Math.PI * 50}
                            strokeDashoffset={2 * Math.PI * 50 * (1 - (powerScore / 100))}
                            strokeLinecap="round" className="text-[#0A2A6B]"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-slate-950 leading-none">{powerScore || '—'}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Power Score</span>
                    </div>
                </div>
                <div className="text-center">
                    <div className={`inline-block px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${powerScore >= 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : powerScore > 0 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                        {powerScore >= 80 ? 'EXCELLENT' : powerScore > 0 ? 'NEEDS WORK' : 'NOT SCORED YET'}
                    </div>
                    {powerScore === 0 && (
                        <p className="text-[11px] text-slate-400 mt-2">Run an ATS check to get your score</p>
                    )}
                </div>
            </div>

            {/* Three Metric Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Views */}
                <Link to="/analytics/traffic" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/30 hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col justify-between cursor-pointer">
                    <div className="p-2 bg-blue-50 text-[#0A2A6B] rounded-xl w-fit mb-3"><Eye className="w-4 h-4" /></div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resume Views</p>
                        <h3 className="text-3xl font-bold text-slate-950 tracking-tight">{totalViews}</h3>
                        <p className="text-[11px] text-slate-400 mt-1.5">
                            {totalViews === 0 
                                ? 'Most resumes get first views within 48h of sharing' 
                                : totalViews < 5 ? 'Getting started — keep sharing your link' : 'across all shared links'}
                        </p>
                    </div>
                </Link>

                {/* Time Spent */}
                <Link to="/analytics/engagement" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/30 hover:shadow-xl hover:border-amber-100 transition-all group flex flex-col justify-between cursor-pointer">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl w-fit mb-3"><Clock className="w-4 h-4" /></div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg. Time Spent</p>
                        <h3 className="text-3xl font-bold text-slate-950 tracking-tight">{avgTime}s</h3>
                        <p className="text-[11px] text-slate-400 mt-1.5">
                            {avgTime === 0 
                                ? "No engagement yet — share your link to start" 
                                : avgTime < 10 ? 'Readers are skimming — try improving your summary' : 'Solid engagement per session'}
                        </p>
                    </div>
                </Link>

                {/* Downloads */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/30 hover:shadow-xl hover:border-emerald-100 transition-all group flex flex-col justify-between">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-3"><Download className="w-4 h-4" /></div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Downloads</p>
                        <h3 className="text-3xl font-bold text-slate-950 tracking-tight">{totalDownloads}</h3>
                        <p className="text-[11px] text-slate-400 mt-1.5">
                            {totalDownloads === 0 
                                ? 'Downloads happen when recruiters want to keep your resume' 
                                : totalDownloads < 3 ? 'Gaining traction — keep optimizing' : 'Strong recruiter interest'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsGrid;
