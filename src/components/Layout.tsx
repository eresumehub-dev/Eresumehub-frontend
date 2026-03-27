import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Linkedin, Instagram } from 'lucide-react';

const Layout = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <footer className="bg-white border-t border-zinc-50 py-6 mt-auto">
                <div className="w-full px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        © {new Date().getFullYear()} EresumeHub. All assets verified.
                    </p>
                    <div className="flex items-center space-x-6">
                        <a href="#" className="text-[#0077B5] hover:opacity-80 transition-opacity">
                            <span className="sr-only">LinkedIn</span>
                            <Linkedin className="h-4 w-4 fill-current" />
                        </a>
                        <a href="#" className="text-[#E4405F] hover:opacity-80 transition-opacity">
                            <span className="sr-only">Instagram</span>
                            <Instagram className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
