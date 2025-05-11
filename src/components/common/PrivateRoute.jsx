import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = () => {
    const { user, requiresProfile } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (requiresProfile) {
            navigate('/complete-profile');
        }
    }, [user, requiresProfile, navigate]);

    return user ? <Outlet /> : null;
};

export default PrivateRoute;