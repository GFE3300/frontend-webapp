import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import AdminDashboardView from '../views/AdminDashboardView';
import AffiliateDashboardView from '../views/AffiliateDashboardView';
import Spinner from '../../../components/common/Spinner';

/**
 * Acts as a router for the main staff dashboard page.
 * It checks the authenticated user's role (superuser or regular staff)
 * and renders the appropriate detailed dashboard view.
 */
const StaffDashboardPage = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!user) {
        // This case should theoretically not be hit due to PrivateRoute,
        // but it's a good safeguard.
        return <div className="p-6">Error: User not found.</div>;
    }

    // Conditionally render the correct dashboard based on the user's superuser status.
    return user.is_superuser ? <AdminDashboardView /> : <AffiliateDashboardView />;
};

export default StaffDashboardPage;