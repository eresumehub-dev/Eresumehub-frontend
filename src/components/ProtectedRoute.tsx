import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="bg-[#F5F5F7] min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-foreground/10 border-t-foreground rounded-full animate-spin" />
        </div>
    );

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
