import React from 'react';
import { Eye, Download, Activity, ChevronRight } from 'lucide-react';

interface ActivityTimelineProps {
    activities: any[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/20 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-950 flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-[#0A2A6B]" />
                    Link Activity
                </h2>
                {activities.length > 0 && (
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                    </span>
                )}
            </div>
            <div className="p-5">
                {activities.length > 0 ? (
                    <div className="space-y-5">
                        {activities.map((activity: any) => (
                            <div key={activity.id} className="flex items-start gap-3.5 group/item">
                                <div className={`p-2 rounded-xl shrink-0 ${activity.type === 'view' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {activity.type === 'view' ? <Eye className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-950 truncate">
                                        {activity.type === 'view' ? 'Resume Viewed' : 'Resume Downloaded'}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">
                                        {activity.resume_title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[10px] font-semibold text-slate-400">
                                            {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {activity.country && (
                                            <>
                                                <span className="text-slate-200">·</span>
                                                <span className="text-[10px] font-semibold text-slate-400">
                                                    {activity.country}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover/item:opacity-100 transition-opacity self-center" />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* GUIDED EMPTY STATE — replaces useless "No recent activity" */
                    <div className="py-6">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-100">
                                <Activity className="w-5 h-5 text-slate-300" />
                            </div>
                            <p className="text-sm font-semibold text-slate-950 mb-1">No activity yet</p>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto">
                                When someone views or downloads your shared resume, you'll see it here in real-time.
                            </p>
                        </div>
                        
                        {/* What activity looks like (mini preview) */}
                        <div className="border border-dashed border-slate-200 rounded-xl p-4 space-y-3">
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Preview</p>
                            <div className="flex items-center gap-3 opacity-40">
                                <div className="p-1.5 bg-blue-50 rounded-lg"><Eye className="w-3 h-3 text-blue-400" /></div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500">Resume Viewed</p>
                                    <p className="text-[10px] text-slate-400">2:34 PM · United States</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 opacity-30">
                                <div className="p-1.5 bg-emerald-50 rounded-lg"><Download className="w-3 h-3 text-emerald-400" /></div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500">Resume Downloaded</p>
                                    <p className="text-[10px] text-slate-400">3:12 PM · Germany</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityTimeline;
