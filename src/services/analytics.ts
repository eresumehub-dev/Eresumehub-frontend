import api from './api';

export interface AnalyticsSummary {
    total_views: number;
    engaged_views: number;
    unique_viewers: number;
    total_downloads: number;
    avg_time_spent: number;
    ttv_median: number; // Time-to-Value (v13.0.0)
    conversion_rate: number;
    power_score: number; // Based on probabilistic engagement (v13.0.0)
    total_resumes?: number;
}

export interface AnalyticsSegments {
    device: Record<string, number>;
    referrer: Record<string, number>;
    ttu_median: number;
}

export interface AnalyticsData {
    summary: AnalyticsSummary;
    segments?: AnalyticsSegments;
    trends: Array<{ viewed_at: string; views: number }>;
    resume_trends?: Record<string, Array<{ viewed_at: string; views: number }>>;
    funnel?: {
        views: number;
        engagement: number;
        downloads: number;
    };
    geo_distribution: Array<{ country: string; visitors: number }>;
    device_stats: Array<{ device: string; count: number }>;
    resume_performance: Array<{ 
        id: string; 
        title: string; 
        views: number; 
        engagement_score: number; // Probabilistic (v13.0.0)
        success_probability: number; // ML Predictor (v13.0.0)
        downloads: number; 
        insight_tag?: string;
    }>;
    recommendation?: {
        resume_id: string | null;
        resume_title: string;
        fix: {
            title: string;
            current: string;
            suggested: string;
            root_cause?: string;
            reasoning?: string;
            points: number;
        };
    };
    activities?: Array<{
        id: string;
        event_name: string;
        timestamp: string;
        resume_title: string;
        country?: string;
    }>;
    nudges?: MagicNudge[];
}

export interface MagicNudge {
    type: string;
    resume_id: string;
    resume_title: string;
    title: string;
    message: string;
    confidence: number;
    action: string;
    impact: string;
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

export const getActiveNudges = async () => {
    const response = await api.get<{ success: boolean; data: MagicNudge[] }>('/analytics/nudges');
    return response.data;
};

export const dismissNudge = async (nudgeType: string, resumeId: string, confidence: number) => {
    const response = await api.post('/analytics/nudges/dismiss', { 
        nudge_type: nudgeType, 
        resume_id: resumeId, 
        confidence 
    });
    return response.data;
};
