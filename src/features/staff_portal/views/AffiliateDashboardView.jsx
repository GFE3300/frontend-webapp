import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiService from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';

// Common Components
import Spinner from '../../../components/common/Spinner';
import Icon from '../../../components/common/Icon';
import StatCard from '../../../components/common/StatCard';
import InputField from '../../../components/common/InputField';
import Button from '../../../components/common/Button';

// Staff Portal Subcomponents
import AffiliateRevenueChart from '../subcomponents/AffiliateRevenueChart';
import CommissionsList from '../subcomponents/CommissionsList';
import ReferralsList from '../subcomponents/ReferralsList';

/**
 * Renders the dashboard for a logged-in affiliate, showing their personal
 * referral statistics, earnings, and tools.
 */
const AffiliateDashboardView = () => {
    const { addToast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    // Fetch dashboard data for the logged-in affiliate
    const { data: dashboardData, isLoading, isError, error } = useQuery({
        queryKey: ['affiliateDashboardData'],
        queryFn: () => apiService.get('/staff/me/dashboard/'),
        // The API response is expected to be { data: { ... } }
        select: (response) => response.data, 
    });

    const referralLink = useMemo(() => {
        if (!dashboardData?.referral_code) return '';
        // Use window.location.origin to construct a reliable base URL
        const baseUrl = window.location.origin;
        return `${baseUrl}/register?ref=${dashboardData.referral_code}`;
    }, [dashboardData?.referral_code]);

    const handleCopyLink = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink).then(() => {
            setIsCopied(true);
            addToast("Referral link copied to clipboard!", "success");
            setTimeout(() => setIsCopied(false), 2500);
        }).catch(err => {
            addToast("Failed to copy link.", "error");
            console.error('Could not copy text: ', err);
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Spinner size="lg" />
                <p className="ml-3 text-neutral-600 dark:text-neutral-300">Loading your dashboard...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-6 text-center bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                <Icon name="error_outline" className="mx-auto text-red-500 h-12 w-12 mb-3" />
                <p className="text-red-700 dark:text-red-300 font-semibold mb-1">Failed to load dashboard data.</p>
                <p className="text-sm text-red-600 dark:text-red-400">{error.response?.data?.detail || error.message || "An unexpected error occurred."}</p>
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <header>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">My Dashboard</h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Your personal affiliate performance and earnings overview.
                </p>
            </header>
            
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Unpaid Commissions" value={formatCurrency(dashboardData.unpaid_commission_amount)} iconName="account_balance_wallet" iconColorClass="text-amber-500" />
                <StatCard title="Total Earnings" value={formatCurrency(dashboardData.total_earnings)} iconName="paid" iconColorClass="text-green-500" />
                <StatCard title="Active Referrals" value={dashboardData.active_referrals} iconName="group_add" iconColorClass="text-sky-500" />
            </section>

            <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-1">Your Unique Referral Link</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">Share this link to earn commissions on new subscriptions.</p>
                <div className="flex items-center gap-2">
                    <InputField
                        name="referralLink"
                        value={referralLink}
                        readOnly={true}
                        className="flex-grow"
                    />
                    <Button
                        variant="solid"
                        color="primary"
                        onClick={handleCopyLink}
                        disabled={isCopied}
                        className="w-32 flex-shrink-0"
                    >
                        <Icon name={isCopied ? "done" : "content_copy"} className="mr-2 h-5 w-5" />
                        {isCopied ? "Copied!" : "Copy Link"}
                    </Button>
                </div>
            </section>
            
            <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Monthly Commission Revenue</h3>
                <AffiliateRevenueChart commissions={dashboardData.recent_commissions || []} />
            </section>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                    <CommissionsList commissions={dashboardData.recent_commissions || []} />
                </section>
                <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                    <ReferralsList referrals={dashboardData.recent_referrals || []} />
                </section>
            </div>
        </div>
    );
};

export default AffiliateDashboardView;