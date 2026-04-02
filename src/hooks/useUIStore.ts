import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    // Sidebar
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;

    // Onboarding / Tooltips
    hasSeenReadinessGuide: boolean;
    setHasSeenReadinessGuide: (seen: boolean) => void;

    // Dashboard Preferences
    statsView: 'grid' | 'list';
    setStatsView: (view: 'grid' | 'list') => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            sidebarOpen: true,
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

            hasSeenReadinessGuide: false,
            setHasSeenReadinessGuide: (seen) => set({ hasSeenReadinessGuide: seen }),

            statsView: 'grid',
            setStatsView: (view) => set({ statsView: view }),
        }),
        {
            name: 'eresumehub-ui-storage',
        }
    )
);
