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
 * @param {boolean} [props.staffOnly=false] - If true, the route requires the user to be a staff member.
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
        // MODIFICATION: Redirect them to the correct login page, saving the current location.
        const loginPath = staffOnly ? '/staff/login' : '/login/business';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // MODIFICATION: If the route is marked as staffOnly, verify the user's staff status.
    if (staffOnly && !user.is_staff) {
        // Authenticated user is not staff, redirect them to the staff login page.
        // This handles cases where a non-staff user might have a valid token but tries to access /staff.
        console.warn("Access Denied: User is not staff. Redirecting to staff login.");
        return <Navigate to="/staff/login" state={{ from: location }} replace />;
    }

    if (requiredRoles && requiredRoles.length > 0) {
        // Check if the user's role is included in the required roles.
        const hasRequiredRole = user && requiredRoles.includes(user.role);

        if (!hasRequiredRole) {
            // User is authenticated but does not have the necessary role.
            console.warn(`Access Denied: User role '${user.role}' not in required roles [${requiredRoles.join(', ')}].`);
            return <Navigate to="/dashboard/unauthorized" replace />;
        }
    }

    return children;
};

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requiredRoles: PropTypes.arrayOf(PropTypes.string),
    staffOnly: PropTypes.bool,
};

export default PrivateRoute;