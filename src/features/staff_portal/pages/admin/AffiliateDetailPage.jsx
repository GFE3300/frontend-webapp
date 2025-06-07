import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiService from '../../../../services/api';
import Spinner from '../../../../components/common/Spinner';
import Icon from '../../../../components/common/Icon';
import StatCard from '../../../../components/common/StatCard';
import AffiliateRevenueChart from '../../subcomponents/AffiliateRevenueChart';
import CommissionsList from '../../subcomponents/CommissionsList';
import ReferralsList from '../../subcomponents/ReferralsList';

const AffiliateDetailPage = () => {
    const { affiliateId } = useParams();

    // MODIFICATION: Updated queryKey and queryFn for admin context
    const { data: analyticsData, isLoading, isError, error } = useQuery({
        queryKey: ['staff_affiliate_analytics', affiliateId],
        queryFn: () => apiService.get(`/affiliates/${affiliateId}/analytics/`),
        enabled: !!affiliateId,
    });

    const data = analyticsData?.data;

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
                    {/* MODIFICATION: More specific error display */}
                    <p className="text-sm text-red-600 dark:text-red-400">{error.response?.data?.detail || error.message || "An unexpected error occurred."}</p>
                </div>
            );
        }

        if (!data) {
            return <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">No data available for this affiliate.</div>;
        }

        return (
            <>
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Referrals" value={data.total_referrals} iconName="group_add" />
                    <StatCard title="Total Earned" value={`€${parseFloat(data.total_commission_earned).toFixed(2)}`} iconName="paid" iconColorClass="text-green-500" />
                    <StatCard title="Total Paid" value={`€${parseFloat(data.total_commission_paid).toFixed(2)}`} iconName="payments" iconColorClass="text-sky-500" />
                    <StatCard title="Unpaid Balance" value={`€${parseFloat(data.unpaid_commission).toFixed(2)}`} iconName="account_balance_wallet" iconColorClass="text-amber-500" />
                </section>

                <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Monthly Commission Revenue</h3>
                    <AffiliateRevenueChart commissions={data.recent_commissions} />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                        <CommissionsList commissions={data.recent_commissions} />
                    </section>
                    <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                        <ReferralsList referrals={data.recent_referrals} />
                    </section>
                </div>
            </>
        );
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <header>
                {/* MODIFICATION: Updated back link to point to the new admin path */}
                <Link to="/staff/manage-affiliates" className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline mb-2">
                    <Icon name="arrow_back" className="mr-1 h-4 w-4" />
                    Back to All Affiliates
                </Link>
                {/* MODIFICATION: Enhanced header to show affiliate's name */}
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    {isLoading ? 'Loading...' : `Affiliate: ${data?.affiliate_name || 'Details'}`}
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