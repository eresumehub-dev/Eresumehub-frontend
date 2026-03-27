import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BarChart3, LogIn } from 'lucide-react';

const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-zinc-100 sticky top-0 z-50">
            <div className="w-full px-6 lg:px-12">
                <div className="flex justify-between items-center h-20">
                    {/* Far Left: Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 group">
                            <span className="text-xl font-bold tracking-tight text-[#0A2A6B]">
                                EresumeHub
                            </span>
                        </Link>
                    </div>

                    {/* Far Right: Navigation Items */}
                    <div className="flex items-center space-x-8">
                        <Link to="/ats-checker" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-[#0A2A6B] transition-colors flex items-center gap-2">
                            <BarChart3 className="h-3.5 w-3.5" />
                            <span>Free ATS Checker</span>
                        </Link>

                        {user ? (
                            <>
                                <Link to="/templates" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-[#0A2A6B] transition-colors">
                                    Templates
                                </Link>
                                <Link to="/dashboard" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-[#0A2A6B] transition-colors">
                                    Dashboard
                                </Link>
                                <div className="h-5 w-px bg-slate-100 mx-2"></div>
                                <button onClick={handleLogout} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-red-600 transition-colors flex items-center gap-2">
                                    <LogOut className="h-3.5 w-3.5" />
                                    <span>Sign Out</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] bg-white border border-slate-200 text-slate-900 hover:border-[#0A2A6B] hover:text-[#0A2A6B] transition-all shadow-sm">
                                    <LogIn className="h-4 w-4" />
                                    Client Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
