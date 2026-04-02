import { useState, useCallback } from 'react';
import { getDashboardAnalytics } from '../services/analytics';

export const useAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getDashboardAnalytics();
            const data = result?.data || result;
            setAnalyticsData(data);
            setActivities(data?.activities || []);
        } catch (err) {
            console.error('Analytics fetch error:', err);
            setAnalyticsData(null);
            setActivities([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        analyticsData,
        activities,
        loading,
        fetchAnalytics
    };
};
