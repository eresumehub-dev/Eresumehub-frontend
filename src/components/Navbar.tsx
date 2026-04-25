import { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    FileText,
    ScanSearch, 
    LogOut,
    Menu,
    X,
    User,
    Settings,
    HelpCircle,
    ChevronDown,
    TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBootstrapQuery } from '../hooks/queries/useBootstrapQuery';

const Navbar = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Auth & Profile Data for real initials/info
    const { data: bootData } = useBootstrapQuery();
    const userProfile = bootData?.profile;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Initial derivation
    const initials = userProfile?.full_name ? 
        userProfile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'JD';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
        await signOut();
        navigate('/login');
    };

    const navLinks = [
        { name: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, href: "/dashboard" },
        { name: "My Resumes", icon: <FileText className="w-4 h-4" />, href: "/dashboard/resumes" },
        { name: "Analytics", icon: <TrendingUp className="w-4 h-4" />, href: "/analytics/overview" },
        { name: "ATS Scanner", icon: <ScanSearch className="w-4 h-4" />, href: "/ats-checker" },
        { name: "Templates", icon: <HelpCircle className="w-4 h-4" />, href: "/templates" }
    ];

    // Helper for active state
    const isActive = (path: string) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(path);
    };

    // Hide Navbar on the landing page, login, signup, or profile so it doesn't overlap/double-up
    if (['/', '/login', '/signup', '/profile'].includes(location.pathname)) return null;

    return (
        <header 
            className={`
                fixed top-0 left-0 right-0 h-[72px] z-[100] transition-all duration-300
                bg-white/75 backdrop-blur-2xl
                ${scrolled ? 'border-b border-black/[0.04] shadow-[0_4px_20px_rgb(0,0,0,0.02)]' : 'border-b border-transparent'}
            `}
        >
            <div className="flex items-center justify-between h-full px-6 md:px-10 lg:px-12 max-w-[1800px] mx-auto">
                
                <Link to="/" className="flex items-center cursor-pointer group shrink-0 focus:outline-none">
                    <span className="text-[19px] font-bold text-[#1D1D1F] tracking-tight group-hover:opacity-70 transition-opacity duration-200">
                        E-resumehub
                    </span>
                </Link>

                {/* 2. Main Navigation (Desktop) */}
                <nav className="hidden lg:flex items-center h-full gap-8">
                    {navLinks.map((link) => {
                        const active = isActive(link.href);
                        return (
                            <Link 
                                key={link.name}
                                to={link.href}
                                className={`
                                    relative flex items-center gap-2 h-full text-[14px] transition-colors focus:outline-none group
                                    ${active 
                                        ? 'text-[#1D1D1F] font-bold' 
                                        : 'text-[#86868B] font-medium hover:text-[#1D1D1F]'
                                    }
                                `}
                            >
                                <span className={`${active ? 'text-[#1D1D1F]' : 'text-[#86868B] group-hover:text-[#1D1D1F] transition-colors'}`}>
                                    {link.icon}
                                </span>
                                <span className="tracking-wide">{link.name}</span>

                                {active && (
                                    <motion.div 
                                        layoutId="activeNavIndicator"
                                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1D1D1F] rounded-t-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden lg:flex items-center justify-end shrink-0 relative h-full">
                    <button 
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-black/[0.04] transition-all duration-200 focus:outline-none"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D1D1F] to-[#434345] text-white flex items-center justify-center text-[12px] font-semibold shadow-sm uppercase overflow-hidden">
                            {userProfile?.photo_url ? (
                                <img src={userProfile.photo_url} alt="" className="w-full h-full object-cover" />
                            ) : initials}
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-[#86868B] transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isProfileMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-[calc(100%-8px)] w-64 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-black/[0.04] overflow-hidden z-50 flex flex-col p-2"
                                >
                                    <div className="px-3 py-3 mb-1 border-b border-black/[0.04]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1D1D1F] to-[#434345] text-white flex items-center justify-center text-[14px] font-semibold shrink-0 shadow-sm uppercase overflow-hidden">
                                                {userProfile?.photo_url ? (
                                                    <img src={userProfile.photo_url} alt="" className="w-full h-full object-cover" />
                                                ) : initials}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[14px] font-semibold text-[#1D1D1F] truncate">{userProfile?.full_name || 'Member'}</span>
                                                <span className="text-[12px] text-[#86868B] truncate">{userProfile?.contact?.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-0.5 mb-1">
                                        <Link to="/profile" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F5F5F7] transition-colors group">
                                            <div className="flex items-center gap-2.5 text-[#1D1D1F] text-[14px] font-medium">
                                                <User className="w-4 h-4 text-[#86868B] group-hover:text-[#1D1D1F]" />
                                                Profile Details
                                            </div>
                                        </Link>
                                        <Link to="/settings" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F5F5F7] transition-colors group">
                                            <div className="flex items-center gap-2.5 text-[#1D1D1F] text-[14px] font-medium">
                                                <Settings className="w-4 h-4 text-[#86868B] group-hover:text-[#1D1D1F]" />
                                                Settings
                                            </div>
                                        </Link>
                                        <Link to="/help" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F5F5F7] transition-colors group">
                                            <div className="flex items-center gap-2.5 text-[#1D1D1F] text-[14px] font-medium">
                                                <HelpCircle className="w-4 h-4 text-[#86868B] group-hover:text-[#1D1D1F]" />
                                                Support
                                            </div>
                                        </Link>
                                    </div>

                                    <div className="pt-1 border-t border-black/[0.04]">
                                        <button 
                                            onClick={handleLogout}
                                            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl hover:bg-[#FFF0F0] text-[#FF3B30] text-[14px] font-medium transition-colors group text-left"
                                        >
                                            <LogOut className="w-4 h-4 opacity-70 group-hover:opacity-100" strokeWidth={2.5} />
                                            Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2 -mr-2 text-[#1D1D1F] hover:bg-black/[0.04] rounded-xl transition-colors"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="lg:hidden absolute top-[72px] left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-black/[0.04] shadow-xl h-[calc(100vh-72px)] overflow-y-auto"
                    >
                        <div className="p-6 flex flex-col gap-2">
                            {navLinks.map((link) => {
                                const active = isActive(link.href);
                                return (
                                    <Link 
                                        key={link.name}
                                        to={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-4 py-4 rounded-[1rem] text-[15px] font-medium transition-all
                                            ${active ? 'text-[#1D1D1F] bg-[#F5F5F7]' : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]/50'}
                                        `}
                                    >
                                        <span className={`${active ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}>
                                            {link.icon}
                                        </span>
                                        {link.name}
                                    </Link>
                                );
                            })}
                            
                            <div className="h-[1px] w-full bg-black/[0.04] my-4"></div>
                            
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#F5F5F7] text-[13px] font-medium text-[#1D1D1F]">
                                    <User className="w-4 h-4 text-[#86868B]" /> Profile
                                </Link>
                                <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#F5F5F7] text-[13px] font-medium text-[#1D1D1F]">
                                    <Settings className="w-4 h-4 text-[#86868B]" /> Settings
                                </Link>
                            </div>

                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-4 rounded-[1rem] text-[#FF3B30] bg-[#FFF0F0] font-bold text-[14px] w-full text-left transition-colors active:scale-[0.98]">
                                <LogOut className="w-5 h-5" strokeWidth={2.5} /> Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
