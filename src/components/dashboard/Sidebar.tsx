import React from 'react';
import { 
    FileText, 
    Eye,
    TrendingUp,
    ShieldCheck,
    LayoutTemplate,
    User,
    HelpCircle,
    Settings as SettingsIcon
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getProfile } from '../../services/profile';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const queryClient = useQueryClient();

    const navItems = [
        { to: "/dashboard", icon: TrendingUp, label: "Dashboard" },
        { to: "/dashboard/resumes", icon: FileText, label: "My Resumes" },
        { to: "/analytics/traffic", icon: Eye, label: "Analytics" },
        { to: "/ats-checker", icon: ShieldCheck, label: "ATS Checker", mt: true },
        { to: "/templates", icon: LayoutTemplate, label: "Templates" },
        { to: "/profile", icon: User, label: "Profile Data" },
        { to: "/settings", icon: SettingsIcon, label: "Settings" },
        { to: "/support", icon: HelpCircle, label: "Support" },
    ];

    const isActive = (item: typeof navItems[0]) => {
        const { to } = item;
        const currentPath = location.pathname;

        if (to === '/dashboard') {
            return currentPath === '/dashboard';
        }
        
        return currentPath === to || currentPath.startsWith(to + '/');
    };

    return (
        <aside className="w-64 bg-[#F5F5F7] border-r border-black/[0.04] p-6 hidden lg:flex flex-col fixed top-[90px] bottom-20 left-0 z-40 transition-all duration-300">
            {/* Top Logo Removed as requested (already in header) */}
            
            <nav className="flex-1 space-y-1.5 mt-4">
                {navItems.map((item) => {
                    const active = isActive(item);
                    const isProfileLink = item.to === '/profile';
                    
                    return (
                        <Link
                            key={item.label}
                            to={item.to}
                            onMouseEnter={() => {
                                // Point 6: Prefetch full profile when hovering over profile link
                                if (isProfileLink) {
                                    queryClient.prefetchQuery({
                                        queryKey: ['fullProfile'],
                                        queryFn: async () => {
                                            const { profile } = await getProfile();
                                            return profile;
                                        },
                                        staleTime: 1000 * 60 * 5, // don't re-prefetch if fresh within 5 min
                                    });
                                }
                            }}
                            className={`px-4 py-2.5 rounded-[12px] font-medium text-[14px] flex items-center gap-3 transition-all ${
                                active 
                                ? 'bg-white shadow-[0_2px_10px_rgb(0,0,0,0.02)] text-[#1D1D1F]' 
                                : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-white/50'
                            } ${item.mt ? 'mt-4' : ''}`}
                        >
                            <item.icon className={`w-4 h-4 ${active ? 'text-[#1D1D1F]' : ''}`} strokeWidth={active ? 2.5 : 2} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;
