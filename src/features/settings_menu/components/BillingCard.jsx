import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useSubscription } from '../../../contexts/SubscriptionContext';
import { useManageSubscription } from '../hooks/useManageSubscription';
import { scriptLines_dashboard as sl } from '../../dashboard/utils/script_lines';
import { interpolate } from '../../../i18n';
import Spinner from '../../../components/common/Spinner';
import Button from '../../../components/common/Button';

// A small, reusable component to keep the main layout clean.
const InfoRow = memo(({ label, children }) => (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center py-4 border-b border-white/10 dark:border-neutral-700/60 last:border-b-0">
        <dt className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{label}</dt>
        <dd className="mt-1 text-sm text-neutral-800 dark:text-neutral-200 sm:mt-0 font-semibold">{children}</dd>
    </div>
));
InfoRow.displayName = 'InfoRow';
InfoRow.propTypes = {
    label: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
};

/**
 * A self-contained card for displaying subscription details and providing a
 * secure link to the Stripe Customer Portal for management.
 */
const BillingCard = () => {
    const { subscription, isLoading: isSubscriptionLoading } = useSubscription();
    const { manageSubscription, isLoading: isPortalLoading } = useManageSubscription();

    const renderContent = () => {
        if (isSubscriptionLoading) {
            return (
                <div className="flex justify-center items-center h-48">
                    <Spinner size="lg" />
                </div>
            );
        }

        if (!subscription) {
            return (
                <div className="text-center py-10">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{sl.billingCard.noSubscriptionMessage}</p>
                    <Link to="/plans" className="mt-4 inline-block text-primary-600 dark:text-primary-400 hover:underline font-semibold">
                        {sl.billingCard.choosePlanLink}
                    </Link>
                </div>
            );
        }

        const formattedDate = new Date(subscription.current_period_end).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric',
        });
        const billingCycleText = subscription.cancel_at_period_end
            ? interpolate(sl.billingCard.endsOnLabel, { date: formattedDate })
            : interpolate(sl.billingCard.renewsOnLabel, { date: formattedDate });

        const statusClass = subscription.status === 'trialing'
            ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300'
            : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';

        return (
            <dl>
                <InfoRow label={sl.billingCard.currentPlanLabel}>
                    <div className="flex items-center gap-2">
                        <span>{subscription.plan_name_display}</span>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${statusClass}`}>
                            {subscription.status_display}
                        </span>
                    </div>
                </InfoRow>
                <InfoRow label={sl.billingCard.billingCycleLabel}>
                    {billingCycleText}
                </InfoRow>
                <InfoRow label={sl.billingCard.paymentMethodLabel}>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">{sl.billingCard.paymentMethodText}</p>
                </InfoRow>
            </dl>
        );
    };

    return (
        <div className="bg-gradient-to-br from-white/10 to-white/0 dark:bg-neutral-800/50 backdrop-blur-xl border border-white/20 dark:border-neutral-700 shadow-lg rounded-4xl font-montserrat">
            <header className="p-6 md:p-8 border-b border-white/10 dark:border-neutral-700">
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                    {sl.billingCard.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {sl.billingCard.subtitle}
                </p>
            </header>

            <div className="p-6 md:p-8">
                {renderContent()}
            </div>

            <footer className="p-6 md:px-8 bg-black/5 dark:bg-neutral-900/40 rounded-b-4xl flex justify-end">
                <Button onClick={manageSubscription} isLoading={isPortalLoading} disabled={isPortalLoading || !subscription}>
                    {sl.billingCard.manageButton}
                </Button>
            </footer>
        </div>
    );
};

export default BillingCard;