import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile } from '../../services/profile';

/**
 * Staff+ Data Layer: User Profile Query (v6.8.0)
 * Centralizes user identity across the platform.
 * Provides consistent standardizing for names and initials.
 */
export const useUserProfileQuery = () => {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const { profile, exists } = await getProfile();
            return { profile, exists };
        },
        staleTime: 10 * 60 * 1000, // 10 minutes (profile changes rarely)
        // Only fetch independently if bootstrap hasn't already seeded the cache
        enabled: !queryClient.getQueryData(['bootstrap']),
    });
};

export const getUserInitials = (fullName?: string) => {
    if (!fullName) return '??';
    return fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};
