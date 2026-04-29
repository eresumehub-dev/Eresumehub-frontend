import React from 'react';

const DashboardSkeleton: React.FC = () => {
    return (
        <div className="flex-1 space-y-10 animate-pulse">
            {/* 1. HEADER SKELETON */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/[0.04]">
                <div className="space-y-3">
                    <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
                    <div className="h-5 w-80 bg-slate-100 rounded-lg"></div>
                </div>
                <div className="h-12 w-40 bg-slate-200 rounded-2xl hidden md:block"></div>
            </div>

            {/* 2. STATS GRID SKELETON (4 Cards) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-[1.5rem] p-6 border border-black/[0.02] shadow-sm h-32 flex flex-col justify-between">
                        <div className="w-10 h-10 bg-slate-100 rounded-[12px]"></div>
                        <div className="space-y-2">
                            <div className="h-6 w-16 bg-slate-200 rounded-lg"></div>
                            <div className="h-3 w-20 bg-slate-100 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. CONTENT SKELETON (xl:grid-cols-3) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* LEFT SIDE: Documents List Placeholder */}
                <div className="xl:col-span-2">
                    <div className="bg-white rounded-[1.5rem] border border-black/[0.02] overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-black/[0.04] flex items-center justify-between">
                            <div className="h-6 w-40 bg-slate-200 rounded-lg"></div>
                            <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
                        </div>
                        <div className="divide-y divide-black/[0.04]">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-5 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-[14px]"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 w-48 bg-slate-200 rounded-lg"></div>
                                        <div className="h-3 w-32 bg-slate-100 rounded"></div>
                                    </div>
                                    <div className="h-8 w-16 bg-slate-50 rounded-lg hidden sm:block"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Activity Feed Placeholder */}
                    <div className="mt-12 bg-white rounded-2xl border border-slate-100 h-64 shadow-sm"></div>
                </div>

                {/* RIGHT SIDE: Insights Placeholder */}
                <div className="space-y-6">
                    <div className="h-4 w-32 bg-slate-100 rounded mb-4"></div>
                    <div className="bg-white rounded-[1.5rem] p-6 border border-black/[0.03] shadow-sm h-48">
                        <div className="w-12 h-12 bg-slate-50 rounded-full mb-4"></div>
                        <div className="h-5 w-3/4 bg-slate-100 rounded-lg mb-2"></div>
                        <div className="h-3 w-full bg-slate-50 rounded"></div>
                    </div>
                    <div className="bg-slate-900 rounded-[1.5rem] p-6 h-40">
                        <div className="h-5 w-1/2 bg-slate-700 rounded-lg mb-4"></div>
                        <div className="h-3 w-full bg-slate-800 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
