import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import apiService from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import Spinner from '../../../components/common/Spinner';
import Icon from '../../../components/common/Icon';
import StatCard from '../../../components/common/StatCard';
import InputField from '../../../components/common/InputField';
import Button from '../../../components/common/Button';
import AffiliateRevenueChart from '../subcomponents/AffiliateRevenueChart';
import CommissionsList from '../subcomponents/CommissionsList';
import ReferralsList from '../subcomponents/ReferralsList';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount || 0));
};

const AffiliateDashboardView = () => {
    const { addToast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const { data: dashboardData, isLoading, isError, error } = useQuery({
        queryKey: ['affiliateDashboardData'],
        queryFn: () => apiService.get('/staff/me/dashboard/'),
        select: (response) => response.data,
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
            // Do not retry on a 403 error, as it's a permission issue.
            if (error.response?.status === 403) return false;
            return failureCount < 2;
        },
    });

    const referralLink = useMemo(() => {
        if (!dashboardData?.referral_code) return '';
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
        });
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
        // highlight-start
        // Check for the specific 403 error related to a missing profile.
        const isProfileError = error.response?.status === 403 &&
                               error.response?.data?.error?.includes("No affiliate profile");

        return (
            <div className="p-6 text-center bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg max-w-2xl mx-auto mt-10">
                <Icon name={isProfileError ? "badge" : "error_outline"} className="mx-auto text-red-500 h-12 w-12 mb-3" />
                <p className="text-red-700 dark:text-red-300 font-semibold mb-1 text-lg">
                    {isProfileError ? "Affiliate Profile Not Found" : "Failed to load dashboard data."}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                    {isProfileError
                        ? "This staff account does not have an affiliate profile linked to it. An administrator needs to complete your setup."
                        : (error.response?.data?.detail || error.message || "An unexpected error occurred.")
                    }
                </p>
            </div>
        );
        // highlight-end
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
    };

    return (
        <motion.div
            className="p-4 sm:p-6 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.header variants={itemVariants}>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">My Dashboard</h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Your personal affiliate performance and earnings overview.
                </p>
            </motion.header>

            <motion.section variants={itemVariants} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Unpaid Commissions" value={formatCurrency(dashboardData.unpaid_commission_amount)} iconName="account_balance_wallet" color="amber" />
                <StatCard title="Total Earnings" value={formatCurrency(dashboardData.total_earnings)} iconName="paid" color="green" />
                <StatCard title="Active Referrals" value={dashboardData.active_referrals} iconName="group_add" color="sky" />
            </motion.section>

            <motion.section variants={itemVariants} className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
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
            </motion.section>

            <motion.section variants={itemVariants} className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Monthly Commission Revenue</h3>
                <AffiliateRevenueChart commissions={dashboardData.recent_commissions || []} />
            </motion.section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.section variants={itemVariants} className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                    <CommissionsList commissions={dashboardData.recent_commissions || []} />
                </motion.section>
                <motion.section variants={itemVariants} className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                    <ReferralsList referrals={dashboardData.recent_referrals || []} />
                </motion.section>
            </div>
        </motion.div>
    );
};

export default AffiliateDashboardView;