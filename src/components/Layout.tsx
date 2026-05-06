import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ScrollToTop from './shared/ScrollToTop';
import Footer from './shared/Footer';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
    const location = useLocation();
    
    // Define which routes get the minimal footer
    const minimalFooterRoutes = [
        '/login', '/signup', '/dashboard', '/analytics', 
        '/ats-checker', '/profile', '/create', '/settings', 
        '/resume', '/templates'
    ];
    
    const isMinimal = minimalFooterRoutes.some(route => 
        location.pathname === route || location.pathname.startsWith(route + '/')
    );

    return (
        <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
            <Toaster 
                position="bottom-right" 
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1D1D1F',
                        color: '#FFF',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '12px 20px',
                    },
                }} 
            />
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer minimal={isMinimal} />
            <ScrollToTop />
        </div>
    );
};


export default Layout;
