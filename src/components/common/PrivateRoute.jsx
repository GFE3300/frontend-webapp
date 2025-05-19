// src/components/common/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
// import LoadingSpinner from './LoadingSpinner'; // Your loading component

const PrivateRoute = ({ children, requiredRoles }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        // return <LoadingSpinner />; // Or some other loading indicator
        return <div>Loading authentication status...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login/business" state={{ from: location }} replace />;
    }

    if (requiredRoles && requiredRoles.length > 0 && (!user?.role || !requiredRoles.includes(user.role))) {
        // User is authenticated but does not have the required role
        // return <Navigate to="/unauthorized" state={{ from: location }} replace />;
        return <Navigate to="/dashboard/unauthorized" state={{ from: location }} replace />; // Redirect to an "Unauthorized" page
    }

    return children ? children : <Outlet />; // Render children or Outlet for nested routes
};

PrivateRoute.propTypes = {
    children: PropTypes.node,
    requiredRoles: PropTypes.arrayOf(PropTypes.string),
};

export default PrivateRoute;