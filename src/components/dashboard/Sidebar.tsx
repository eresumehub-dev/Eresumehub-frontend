import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Home, Plus, FileText, BarChart3, Layout, User, Settings, HelpCircle, ChevronRight 
} from 'lucide-react';
import { UserProfile } from '../../services/profile';

interface SidebarProps {
    user: any;
    userProfile: UserProfile | null;
    resumeCount: number;
    totalViews: number;
    initials: string;
}

const Sidebar: React.FC<SidebarProps> = ({ user, userProfile, resumeCount, totalViews, initials }) => {
    const [avatarError, setAvatarError] = useState(false);

    const navItems = [
        { to: "/dashboard", icon: Home, label: "Dashboard", active: true },
        { to: "/dashboard/resumes", icon: FileText, label: "My Resumes" },
        { to: "/ats-checker", icon: BarChart3, label: "ATS Checker" },
        { to: "/templates", icon: Layout, label: "Templates" },
        { to: "/profile", icon: User, label: "Profile Data" },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-16 lg:top-20 h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)]">
            <div className="p-4 border-b border-slate-100 mb-2">
                <Link
                    to="/create"
                    className="flex items-center justify-center gap-3 w-full py-3.5 bg-[#0A2A6B] text-white rounded-xl font-bold text-sm shadow-md shadow-[#0A2A6B]/20 hover:bg-[#061A44] active:scale-[0.98] transition-all group"
                >
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    <span>Create New Resume</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 pt-0 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.to}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group ${item.active
                            ? 'bg-[#0A2A6B]/5 text-[#0A2A6B]'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-[#0A2A6B]'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={`w-4 h-4 ${item.active ? 'text-[#0A2A6B]' : 'text-slate-400 group-hover:text-[#0A2A6B]'}`} />
                            <span className={item.active ? 'font-bold' : ''}>{item.label}</span>
                        </div>
                        <ChevronRight className={`w-3 h-3 transition-opacity ${item.active ? 'opacity-40' : 'opacity-0 group-hover:opacity-40'}`} />
                    </Link>
                ))}

                <div className="pt-6 mt-6 border-t border-slate-100">
                    <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preferences</p>
                    <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium transition-all group">
                        <Settings className="w-4 h-4 text-slate-400 group-hover:text-[#0A2A6B]" />
                        <span className="group-hover:text-[#0A2A6B]">Settings</span>
                    </Link>
                    <Link to="/help" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium transition-all group">
                        <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-[#0A2A6B]" />
                        <span className="group-hover:text-[#0A2A6B]">Support</span>
                    </Link>
                </div>
            </nav>

            <div className="p-3 border-t border-slate-100 space-y-2">
                {/* Real Quick Stats (replaces fake Pipeline Status) */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {resumeCount} {resumeCount === 1 ? 'Resume' : 'Resumes'}
                    </span>
                    <span className="text-[10px] font-bold text-[#0A2A6B]">
                        {totalViews} {totalViews === 1 ? 'View' : 'Views'}
                    </span>
                </div>

                {/* User Card */}
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                    <div className={`w-8 h-8 rounded-lg border border-white shadow-sm shrink-0 overflow-hidden flex items-center justify-center ${!userProfile?.photo_url || avatarError ? 'bg-gradient-to-br from-[#0A2A6B] to-[#1E3A8A] text-white font-bold text-[10px]' : ''}`}>
                        {userProfile?.photo_url && !avatarError ? (
                            <img
                                src={userProfile.photo_url}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={() => setAvatarError(true)}
                            />
                        ) : (
                            initials
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-950 text-[11px] truncate">
                            {userProfile?.full_name || user?.user_metadata?.full_name || 'Member'}
                        </p>
                        <Link to="/profile" className="text-[9px] text-[#0A2A6B] font-bold uppercase tracking-wider hover:opacity-80">
                            View Profile
                        </Link>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
