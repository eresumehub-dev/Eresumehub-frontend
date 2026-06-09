import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBootstrapData } from '../../services/profile';

/**
 * Fast-Path Bootstrap Hook (v15.0.0)
 * Consolidates Profile and Resumes into a single <100ms query.
 * EXCLUDES Analytics to prevent UI blocking during heavy computation.
 */
export const useBootstrapQuery = (options: { enabled?: boolean } = {}) => {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ['bootstrap'],
        queryFn: async () => {
            const response = await getBootstrapData();
            if (response.success && response.data) {
                const { profile, resumes, meta, exists } = response.data;
                
                // 🛡️ v16.5.0: Handle degraded responses gracefully
                if (meta?.degraded) {
                    console.warn('Bootstrap degraded:', meta.reason);
                    return response.data;
                }
                
                if (profile) {
                    queryClient.setQueryData(['profile'], { profile, exists: !!exists });
                }
                if (Array.isArray(resumes)) queryClient.setQueryData(['resumes'], resumes);
                return response.data;
            }
            throw new Error('Bootstrap failed: malformed response');
        },
        staleTime: 5 * 60 * 1000, 
        gcTime: 30 * 60 * 1000,   
        retry: false,              // 🛡️ v16.5.0: NEVER retry bootstrap
        refetchOnWindowFocus: false, // 🛡️ Prevent surprise refetches
        ...options
    });
};
