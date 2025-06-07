import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

import { useAuth } from '../../contexts/AuthContext';
import Spinner from './Spinner';

/**
 * A component to protect routes, ensuring the user is not only authenticated
 * and a staff member, but also a superuser (admin).
 * It should be used inside a route already protected by PrivateRoute.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The admin-only component to render if authorized.
 */
const AdminOnlyRoute = ({ children }) => {
    const { user, isLoading } = useAuth();

    // While authentication is loading, show a spinner to prevent flicker
    // or premature redirection.
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full w-full p-10">
                <Spinner size="lg" />
            </div>
        );
    }

    // If auth has loaded and the user is not a superuser, redirect.
    // We assume this route is already within a <PrivateRoute>, so the `user` object should exist if authenticated.
    if (!user || !user.is_superuser) {
        // Redirect non-admins to the main staff dashboard, which is a safe default.
        return <Navigate to="/staff/dashboard" replace />;
    }

    // If the user is a superuser, render the protected component.
    return children;
};

AdminOnlyRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AdminOnlyRoute;