import React from 'react';
import { Eye, Download, Activity, ChevronRight } from 'lucide-react';

interface ActivityTimelineProps {
    activities: any[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
    return (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                    <Activity className="w-5 h-5 text-[#0A2A6B]" />
                    Link Activity
                </h2>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Real-time</span>
            </div>
            <div className="p-6">
                {activities.length > 0 ? (
                    <div className="space-y-6">
                        {activities.map((activity: any) => (
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
    );
};

export default ActivityTimeline;
