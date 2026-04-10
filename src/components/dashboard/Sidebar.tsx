import React from 'react';
import { 
    FileText, 
    Eye,
    TrendingUp,
    ShieldCheck,
    LayoutTemplate,
    User,
    HelpCircle
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { UserProfile } from '../../services/profile';

interface SidebarProps {
    user: any;
    userProfile: UserProfile | null;
    resumeCount: number;
    initials: string;
}

const Sidebar: React.FC<SidebarProps> = ({ user, userProfile, initials }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { to: "/dashboard", icon: TrendingUp, label: "Dashboard" },
        { to: "/dashboard/resumes", icon: FileText, label: "My Resumes" },
        { to: "/analytics", icon: Eye, label: "Analytics" },
        { to: "/ats-checker", icon: ShieldCheck, label: "ATS Checker", mt: true },
        { to: "/templates", icon: LayoutTemplate, label: "Templates" },
        { to: "/profile", icon: User, label: "Profile Data" },
        { to: "/help", icon: HelpCircle, label: "Support" },
    ];

    const isActive = (path: string) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="w-64 bg-[#F5F5F7] border-r border-black/[0.04] p-6 hidden lg:flex flex-col fixed top-[72px] bottom-0 left-0 z-40 transition-all duration-300">
            {/* Top Logo Removed as requested (already in header) */}
            
            <nav className="flex-1 space-y-1.5 mt-4">
                {navItems.map((item) => {
                    const active = isActive(item.to);
                    return (
                        <Link
                            key={item.label}
                            to={item.to}
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
            
            {/* User Profile Section - Moved Up & Optimized */}
            <div className="mt-auto pb-4">
                <div 
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/50 transition-all cursor-pointer group"
                >
                    <div className="w-10 h-10 bg-white border border-black/[0.04] rounded-full flex items-center justify-center font-medium text-[#1D1D1F] shadow-sm group-hover:shadow-md transition-shadow uppercase text-xs overflow-hidden shrink-0">
                        {userProfile?.photo_url ? (
                            <img src={userProfile.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            initials
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-[#1D1D1F] truncate leading-tight">
                            {userProfile?.full_name || user?.user_metadata?.full_name || 'Member'}
                        </div>
                        <div className="text-[11px] text-[#86868B] font-medium truncate">
                            View Profile
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
