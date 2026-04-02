import React from 'react';

const DashboardSkeleton: React.FC = () => {
    return (
        <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-2">
                    <div className="h-9 w-56 bg-slate-200 rounded-xl"></div>
                    <div className="h-4 w-72 bg-slate-100 rounded-lg"></div>
                </div>
            </div>

            {/* Metrics Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 h-56 flex flex-col items-center justify-center">
                    <div className="w-28 h-28 bg-slate-100 rounded-full mb-4"></div>
                    <div className="h-5 w-20 bg-slate-100 rounded-lg"></div>
                </div>
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4">
                            <div className="w-9 h-9 bg-slate-100 rounded-xl"></div>
                            <div className="space-y-2">
                                <div className="h-3 w-20 bg-slate-100 rounded"></div>
                                <div className="h-8 w-12 bg-slate-200 rounded-lg"></div>
                                <div className="h-3 w-32 bg-slate-50 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                    <div className="h-5 w-28 bg-slate-200 rounded-lg"></div>
                    {[1, 2].map(i => (
                        <div key={i} className="flex items-center gap-4 py-4 border-t border-slate-50">
                            <div className="w-12 h-14 bg-slate-100 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-5 w-40 bg-slate-200 rounded-lg"></div>
                                <div className="h-3 w-24 bg-slate-100 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                    <div className="h-4 w-20 bg-slate-100 rounded"></div>
                    <div className="h-3 w-full bg-slate-50 rounded"></div>
                    <div className="h-3 w-3/4 bg-slate-50 rounded"></div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
