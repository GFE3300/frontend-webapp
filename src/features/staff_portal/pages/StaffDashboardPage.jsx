import React from 'react';

// Assuming a standard project structure for context and component imports.
// These paths can be adjusted as needed.
import { useAuth } from '../../../contexts/AuthContext';
import Spinner from '../../../components/common/Spinner';
import AdminDashboardView from '../views/AdminDashboardView';
import AffiliateDashboardView from '../views/AffiliateDashboardView';

/**
 * StaffDashboardPage serves as the main entry point and conditional router
 * for the staff dashboard. It determines which dashboard view to render
 * based on the authenticated user's permissions (is_superuser or standard is_staff).
 * This component ensures that the correct experience is delivered to the right user type.
 */
const StaffDashboardPage = () => {
    // 1. Consume the authentication context to get user data and loading status.
    const { user, isLoading } = useAuth();

    // 2. Display a full-page spinner while the user's authentication
    //    state is being resolved. This provides clear feedback to the user.
    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full min-h-screen bg-slate-50">
                <Spinner size="lg" />
            </div>
        );
    }

    // 3. This is a crucial safeguard. While the PrivateRoute should prevent
    //    unauthenticated access, this check handles potential edge cases where
    //    the user object fails to load, preventing a crash.
    if (!user) {
        return (
            <div className="flex items-center justify-center w-full min-h-screen bg-slate-50">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600">Authentication Error</h2>
                    <p className="text-slate-600 mt-2">
                        Could not retrieve user data. Please try logging in again.
                    </p>
                </div>
            </div>
        );
    }

    // 4. The core logic: Conditionally render the appropriate dashboard view
    //    based on the user's `is_superuser` flag.
    return user.is_superuser
        ? <AdminDashboardView />
        : <AffiliateDashboardView />;
};

export default StaffDashboardPage;