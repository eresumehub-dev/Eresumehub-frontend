import api from './api';

export interface AnalyticsSummary {
    total_views: number;
    unique_viewers: number;
    total_downloads: number;
    avg_time_spent: number;
    conversion_rate: number;
}

export interface AnalyticsData {
    summary: AnalyticsSummary;
    trends: Array<{ created_at: string; views: number }>;
    geo_distribution: Array<{ country: string; visitors: number }>;
    device_stats: Array<{ device: string; count: number }>;
    resume_performance: Array<{ id: string; title: string; views: number; unique_viewers: number; downloads: number; avg_time: number; score: number }>;
    activities?: any[];
}

export const logView = async (data: any) => {
    const response = await api.post('/analytics/view', data);
    return response.data;
};

export const updateViewHeartbeat = async (viewId: string, durationSeconds: number) => {
    const response = await api.post(`/analytics/view/${viewId}/heartbeat`, { duration_seconds: durationSeconds });
    return response.data;
};

export const getDashboardAnalytics = async () => {
    const response = await api.get<{ success: boolean; data: AnalyticsData }>('/analytics/dashboard');
    return response.data;
};

export const logDownload = async (data: any) => {
    const response = await api.post('/analytics/download', data);
    return response.data;
};
