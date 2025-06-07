import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from './Spinner';

/**
 * A component to protect routes, ensuring the user is authenticated and,
 * optionally, has a specific role or is a staff member.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The component to render if authorized.
 * @param {string[]} [props.requiredRoles] - An array of roles required to access the route (e.g., ['ADMIN', 'MANAGER']).
 * @param {boolean} [props.staffOnly] - If true, the route requires the user to be a staff member.
 */
const PrivateRoute = ({ children, requiredRoles, staffOnly = false }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect them to the login page, but save the current location they were
        // trying to go to so we can send them there after they log in.
        const loginPath = staffOnly ? '/staff/login' : '/login/business';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    if (staffOnly && !user.is_staff) {
        // If the route requires a staff member, but the logged-in user isn't one.
        console.warn("Access Denied: User is not staff. Redirecting to staff login.");
        // Redirect to a specific "unauthorized" page or back to the staff login.
        return <Navigate to="/staff/login" state={{ from: location }} replace />;
    }

    if (requiredRoles && requiredRoles.length > 0) {
        // Check if the user's role is included in the required roles.
        // Assumes user.role is a string like 'ADMIN', 'MANAGER', etc.
        const hasRequiredRole = user && requiredRoles.includes(user.role);

        if (!hasRequiredRole) {
            // User is authenticated but does not have the necessary role.
            // Redirect to a dedicated "unauthorized" page.
            console.warn(`Access Denied: User role '${user.role}' not in required roles [${requiredRoles.join(', ')}].`);
            return <Navigate to="/dashboard/unauthorized" replace />;
        }
    }

    return children;
};

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requiredRoles: PropTypes.arrayOf(PropTypes.string),
    staffOnly: PropTypes.bool, // New prop type
};

export default PrivateRoute;