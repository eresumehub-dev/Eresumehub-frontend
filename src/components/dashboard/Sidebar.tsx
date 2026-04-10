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
import { useNavigate, Link } from 'react-router-dom';
import { UserProfile } from '../../services/profile';

interface SidebarProps {
    user: any;
    userProfile: UserProfile | null;
    resumeCount: number;
    initials: string;
}

const Sidebar: React.FC<SidebarProps> = ({ user, userProfile, initials }) => {
    const navigate = useNavigate();

    const navItems = [
        { to: "/dashboard", icon: TrendingUp, label: "Dashboard", active: true },
        { to: "/dashboard/resumes", icon: FileText, label: "My Resumes" },
        { to: "/analytics", icon: Eye, label: "Analytics" },
        { to: "/ats-checker", icon: ShieldCheck, label: "ATS Checker", mt: true },
        { to: "/templates", icon: LayoutTemplate, label: "Templates" },
        { to: "/profile", icon: User, label: "Profile Data" },
        { to: "/help", icon: HelpCircle, label: "Support" },
    ];

    return (
        <aside className="w-64 bg-[#F5F5F7] border-r border-black/[0.04] h-screen flex-col p-6 hidden lg:flex sticky top-0 self-start transition-all duration-300">
            {/* Logo area could go here if needed, matching header height */}
            <div className="h-12 mb-8 flex items-center px-4">
                <div className="text-[18px] font-bold tracking-tight text-[#1D1D1F]">
                    ResumeHub
                </div>
            </div>

            <nav className="flex-1 space-y-1.5">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.to}
                        className={`px-4 py-2.5 rounded-[12px] font-medium text-[14px] flex items-center gap-3 transition-all ${
                            item.active 
                            ? 'bg-white shadow-[0_2px_10px_rgb(0,0,0,0.02)] text-[#1D1D1F]' 
                            : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-white/50'
                        } ${item.mt ? 'mt-4' : ''}`}
                    >
                        <item.icon className={`w-4 h-4 ${item.active ? 'text-[#1D1D1F]' : ''}`} strokeWidth={item.active ? 2.5 : 2} />
                        {item.label}
                    </Link>
                ))}
            </nav>
            
            <div 
                onClick={() => navigate('/profile')}
                className="mt-auto flex items-center gap-3 pt-6 border-t border-black/[0.04] cursor-pointer group"
            >
                <div className="w-10 h-10 bg-white border border-black/[0.04] rounded-full flex items-center justify-center font-medium text-[#1D1D1F] shadow-sm group-hover:shadow-md transition-shadow uppercase text-xs">
                    {userProfile?.photo_url ? (
                        <img src={userProfile.photo_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        initials
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-[#1D1D1F] truncate">
                        {userProfile?.full_name || user?.user_metadata?.full_name || 'Member'}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
