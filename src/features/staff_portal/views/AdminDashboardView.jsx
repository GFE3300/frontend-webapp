import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiService from '../../../services/api';

// Common Components
import Spinner from '../../../components/common/Spinner';
import Icon from '../../../components/common/Icon';
import StatCard from '../../../components/common/StatCard';

// Admin Dashboard Subcomponents
import Leaderboard from '../subcomponents/Leaderboard';
import ActionItemsPanel from '../subcomponents/ActionItemsPanel';


/**
 * Renders the dashboard for a Superuser, showing system-wide statistics.
 */
const AdminDashboardView = () => {
    // The endpoint '/api/staff/system-dashboard/' is assumed to exist as per the plan.
    const { data: dashboardData, isLoading, isError, error } = useQuery({
        queryKey: ['adminSystemDashboard'],
        queryFn: () => apiService.get('/staff/system-dashboard/'),
        select: (response) => response.data,
        // Using placeholder data until the API is implemented
        placeholderData: {
            total_unpaid_commissions: 1250.75,
            total_active_affiliates: 12,
            new_referrals_this_month: 3,
        }
    });
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
    };

    if (isLoading && !dashboardData) { // Show spinner only on initial load
        return (
            <div className="flex justify-center items-center h-96">
                <Spinner size="lg" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-6 text-center bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                <Icon name="error_outline" className="mx-auto text-red-500 h-12 w-12 mb-3" />
                <p className="text-red-700 dark:text-red-300 font-semibold mb-1">Failed to load system dashboard.</p>
                <p className="text-sm text-red-600 dark:text-red-400">{error.response?.data?.detail || error.message}</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <header>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Admin Dashboard</h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    System-wide affiliate program overview and metrics.
                </p>
            </header>

            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Total Unpaid Commissions" value={formatCurrency(dashboardData.total_unpaid_commissions)} iconName="account_balance_wallet" iconColorClass="text-amber-500" />
                <StatCard title="Total Active Affiliates" value={dashboardData.total_active_affiliates} iconName="group" iconColorClass="text-sky-500" />
                <StatCard title="New Referrals (This Month)" value={dashboardData.new_referrals_this_month} iconName="group_add" iconColorClass="text-green-500" />
            </section>
            
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Leaderboard />
                <ActionItemsPanel />
            </section>
        </div>
    );
};

export default AdminDashboardView;