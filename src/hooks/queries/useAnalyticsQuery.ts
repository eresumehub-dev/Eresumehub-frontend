import { useQuery } from '@tanstack/react-query';
import { getDashboardAnalytics } from '../../services/analytics';

/**
 * Staff+ Data Layer: Analytics Query (v6.8.0)
 * Handles automatic background synchronization for dashboard metrics.
 * Ensures data is cached for instant back-and-forth navigation.
 */
export const useAnalyticsQuery = () => {
    return useQuery({
        queryKey: ['analytics'],
        queryFn: async () => {
            const result = await getDashboardAnalytics();
            return result?.data || result;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes (analytics is more dynamic)
        gcTime: 10 * 60 * 1000,  // Keep in cache for 10 minutes
    });
};
