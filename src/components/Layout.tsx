import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import ScrollToTop from './shared/ScrollToTop';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
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
            <ScrollToTop />
        </div>
    );
};


export default Layout;
