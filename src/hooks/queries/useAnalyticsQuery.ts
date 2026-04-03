import { useQuery } from '@tanstack/react-query';
import { getDashboardAnalytics } from '../../services/analytics';

/**
 * Async Analytics Hook (v15.0.0)
 * Handles non-blocking metrics hydration for the Dashboard.
 * Redis-backed on the server, high-TTL in the browser.
 */
export const useAnalyticsQuery = () => {
    return useQuery({
        queryKey: ['analytics'],
        queryFn: async () => {
            const result = await getDashboardAnalytics();
            return result?.data || result;
        },
        staleTime: 15 * 60 * 1000, 
        gcTime: 30 * 60 * 1000,   
    });
};
