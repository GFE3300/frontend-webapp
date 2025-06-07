import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import PrivateRoute from './PrivateRoute'; // We still use PrivateRoute for the base auth check

/**
 * A specialized route protection component that ensures only authenticated
 * superusers (admins) can access its children. It builds upon PrivateRoute.
 *
 * It will first ensure the user is an authenticated staff member via PrivateRoute,
 * then it will perform its own check for the is_superuser flag.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The component(s) to render if the user is an admin.
 */
const AdminOnlyRoute = ({ children }) => {
    const { user } = useAuth(); // isLoading and isAuthenticated are handled by PrivateRoute

    // This component is always used *inside* a PrivateRoute that has already
    // confirmed the user is authenticated and is_staff.
    // We just need to add the final check for is_superuser.
    if (!user || !user.is_superuser) {
        // If the user is not a superuser, redirect them.
        // A safe destination is the main staff dashboard, as they are already
        // confirmed to be staff at this point.
        console.warn(`Access Denied: User ${user?.email} is not a superuser. Redirecting to staff dashboard.`);
        return <Navigate to="/staff/dashboard" replace />;
    }

    // If all checks pass, render the protected component.
    return children;
};

AdminOnlyRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

// Note: In App.jsx, the usage will look like:
// <PrivateRoute staffOnly={true}>
//   <AdminOnlyRoute>
//     <SuperuserOnlyPage />
//   </AdminOnlyRoute>
// </PrivateRoute>
// However, for cleaner route definitions, we can compose it as shown in the plan,
// where AdminOnlyRoute implicitly assumes the PrivateRoute check has passed on the parent route.

export default AdminOnlyRoute;