import { useState, useCallback } from 'react';
import { getProfile, UserProfile } from '../services/profile';
import { getMe } from '../services/auth';

export const useUserProfile = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [activeUser, setActiveUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfileData = useCallback(async () => {
        setLoading(true);
        try {
            const [profileResult, userResult] = await Promise.allSettled([
                getProfile(),
                getMe()
            ]);

            if (profileResult.status === 'fulfilled') {
                setUserProfile(profileResult.value.profile);
            }
            if (userResult.status === 'fulfilled') {
                setActiveUser(userResult.value.data);
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const userInitials = (user: any, profile: UserProfile | null) => {
        const name = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'U';
        return name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return {
        userProfile,
        activeUser,
        loading,
        fetchProfileData,
        userInitials
    };
};
