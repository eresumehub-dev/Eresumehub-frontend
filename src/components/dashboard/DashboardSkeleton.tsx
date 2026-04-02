import React from 'react';

const DashboardSkeleton: React.FC = () => {
    return (
        <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-2">
                    <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
                    <div className="h-4 w-48 bg-slate-100 rounded-lg"></div>
                </div>
                <div className="h-12 w-32 bg-slate-200 rounded-xl"></div>
            </div>

            {/* Metrics Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-white rounded-[24px] border border-slate-100 p-6 h-64 flex flex-col items-center justify-center">
                    <div className="w-32 h-32 bg-slate-100 rounded-full mb-4"></div>
                </div>
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 h-64"></div>
                    ))}
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-[32px] border border-slate-100 h-96"></div>
                <div className="bg-white rounded-[24px] border border-slate-100 h-96"></div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
