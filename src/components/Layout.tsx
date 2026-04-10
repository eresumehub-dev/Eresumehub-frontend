import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import ScrollToTop from './shared/ScrollToTop';

const Layout = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <ScrollToTop />
        </div>
    );
};

export default Layout;
