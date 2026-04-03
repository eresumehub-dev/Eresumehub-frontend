import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBootstrapData } from '../../services/profile';

/**
 * Fast-Path Bootstrap Hook (v15.0.0)
 * Consolidates Profile and Resumes into a single <100ms query.
 * EXCLUDES Analytics to prevent UI blocking during heavy computation.
 */
export const useBootstrapQuery = () => {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ['bootstrap'],
        queryFn: async () => {
            const response = await getBootstrapData();
            if (response.success) {
                const { profile, resumes } = response.data;
                
                // 1. CRITICAL PATH HYDRATION (v15.0.0)
                // Instantly fill profile and resume caches.
                queryClient.setQueryData(['profile'], { profile, exists: !!profile });
                queryClient.setQueryData(['resumes'], resumes);
                
                return response.data;
            }
            throw new Error('Bootstrap failed');
        },
        staleTime: 5 * 60 * 1000, 
        gcTime: 30 * 60 * 1000,   
        retry: 1, // Fail fast for UX
    });
};
