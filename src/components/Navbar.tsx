import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BarChart3, LogIn, Menu, X } from 'lucide-react';

const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        setIsMobileMenuOpen(false);
        await signOut();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-zinc-100 sticky top-0 z-50">
            <div className="w-full px-4 sm:px-6 lg:px-12">
                <div className="flex justify-between items-center h-16 lg:h-20">
                    {/* Far Left: Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 group" onClick={() => setIsMobileMenuOpen(false)}>
                            <span className="text-lg lg:text-xl font-bold tracking-tight text-[#0A2A6B]">
                                EresumeHub
                            </span>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <div className="flex lg:hidden items-center">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-[#0A2A6B] hover:bg-gray-100 transition-colors"
                            aria-expanded={isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>

                    {/* Far Right: Navigation Items (Desktop) */}
                    <div className="hidden lg:flex items-center space-x-8">
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

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 pt-2 pb-6 flex flex-col space-y-4">
                        <Link 
                            to="/ats-checker" 
                            className="text-sm font-semibold uppercase tracking-wider text-slate-600 hover:text-[#0A2A6B] flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <BarChart3 className="h-5 w-5" />
                            <span>Free ATS Checker</span>
                        </Link>

                        {user ? (
                            <>
                                <Link 
                                    to="/templates" 
                                    className="text-sm font-semibold uppercase tracking-wider text-slate-600 hover:text-[#0A2A6B] flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Templates
                                </Link>
                                <Link 
                                    to="/dashboard" 
                                    className="text-sm font-semibold uppercase tracking-wider text-slate-600 hover:text-[#0A2A6B] flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <div className="h-px w-full bg-slate-100 my-2"></div>
                                <button 
                                    onClick={handleLogout} 
                                    className="text-sm w-full font-semibold uppercase tracking-wider text-slate-500 hover:text-red-600 flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-left"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Sign Out</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="h-px w-full bg-slate-100 my-2"></div>
                                <Link 
                                    to="/login" 
                                    className="flex w-full justify-center items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider bg-[#0A2A6B] text-white hover:bg-blue-800 transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <LogIn className="h-5 w-5" />
                                    Client Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
