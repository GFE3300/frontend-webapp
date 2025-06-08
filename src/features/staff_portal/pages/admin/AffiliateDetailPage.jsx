import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

// API and Components
import apiService from '../../../../services/api';
import Spinner from '../../../../components/common/Spinner';
import Icon from '../../../../components/common/Icon';
import StatCard from '../../../../components/common/StatCard';
import AffiliateRevenueChart from '../../subcomponents/AffiliateRevenueChart';
import CommissionsList from '../../subcomponents/CommissionsList';
import ReferralsList from '../../subcomponents/ReferralsList';

// Helper to format currency consistently
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(amount || 0));
};

/**
 * Renders a detailed analytics page for a single affiliate, providing insights
 * into their performance, earnings, and recent activity.
 */
const AffiliateDetailPage = () => {
    const { affiliateId } = useParams();

    // Fetch detailed analytics for the specific affiliate.
    const { data: analytics, isLoading, isError, error } = useQuery({
        // The queryKey includes the affiliateId to ensure data is unique per affiliate.
        queryKey: ['staff_affiliate_analytics', affiliateId],
        queryFn: () => apiService.get(`/affiliates/${affiliateId}/analytics/`),
        enabled: !!affiliateId, // Only run the query if affiliateId is present.
        select: (response) => response.data, // Select the data object from the response
    });

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-96">
                    <Spinner size="lg" />
                    <p className="ml-3 text-neutral-600 dark:text-neutral-300">Loading affiliate data...</p>
                </div>
            );
        }

        if (isError) {
            return (
                <div className="p-6 text-center bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                    <Icon name="error_outline" className="mx-auto text-red-500 h-12 w-12 mb-3" />
                    <p className="text-red-700 dark:text-red-300 font-semibold mb-1">Failed to load affiliate analytics.</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{error.response?.data?.detail || error.message || "An unexpected error occurred."}</p>
                </div>
            );
        }

        if (!analytics) {
            return <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">No data available for this affiliate.</div>;
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
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.section variants={itemVariants} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Referrals" value={analytics.total_referrals} iconName="group_add" color="sky" />
                    <StatCard title="Total Earned" value={formatCurrency(analytics.total_commission_earned)} iconName="paid" color="green" />
                    <StatCard title="Total Paid Out" value={formatCurrency(analytics.total_commission_paid)} iconName="payments" color="blue" />
                    <StatCard title="Unpaid Balance" value={formatCurrency(analytics.unpaid_commission)} iconName="account_balance_wallet" color="amber" />
                </motion.section>

                <motion.section variants={itemVariants} className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Monthly Commission Revenue</h3>
                    <AffiliateRevenueChart commissions={analytics.recent_commissions} />
                </motion.section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.section variants={itemVariants} className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                        <CommissionsList commissions={analytics.recent_commissions} />
                    </motion.section>
                    <motion.section variants={itemVariants} className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                        <ReferralsList referrals={analytics.recent_referrals} />
                    </motion.section>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="p-4 sm:p-6 space-y-4">
            <header>
                <Link to="/staff/manage-affiliates" className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline mb-2 transition-colors">
                    <Icon name="arrow_back" className="mr-1 h-4 w-4" />
                    Back to All Affiliates
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    {isLoading ? 'Loading Affiliate...' : `Affiliate: ${analytics?.affiliate_name || 'Details'}`}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Detailed performance analytics for your affiliate partner.
                </p>
            </header>
            {renderContent()}
        </div>
    );
};

export default AffiliateDetailPage;