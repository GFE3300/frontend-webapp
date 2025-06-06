import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSubscription } from '../../../../contexts/SubscriptionContext';
import { useToast } from '../../../../contexts/ToastContext';
import apiService from '../../../../services/api';
import Icon from '../../../../components/common/Icon'; // Assuming Icon component path
import Button from '../../../../components/common/Button'; // Assuming Button component path
import Spinner from '../../../../components/common/Spinner'; // Assuming Spinner component path
import { scriptLines_Components as scriptLines } from '../../../payments/utils/script_lines'; // Consistent text

const SubscriptionBillingPage = () => {
    const {
        subscription,
        isLoading: isSubscriptionLoading,
        error: subscriptionError,
        fetchSubscriptionStatus,
    } = useSubscription();
    const { addToast } = useToast();
    const [isPortalLoading, setIsPortalLoading] = useState(false);

    const handleManageSubscription = useCallback(async () => {
        setIsPortalLoading(true);
        addToast("Redirecting to subscription management...", "info");
        try {
            const response = await apiService.createCustomerPortalSession();
            if (response.data && response.data.url) {
                window.location.href = response.data.url;
            } else {
                addToast("Could not open subscription management portal. Please try again.", "error");
                setIsPortalLoading(false);
            }
        } catch (err) {
            console.error("Error creating customer portal session:", err);
            const errorMessage = err.response?.data?.error || err.response?.data?.detail || "Error accessing subscription management. Please try again.";
            addToast(errorMessage, "error");
            setIsPortalLoading(false);
        }
        // No need to set setIsPortalLoading(false) on success as page redirects
    }, [addToast]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const renderSubscriptionDetails = () => {
        if (isSubscriptionLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-40">
                    <Spinner size="lg" />
                    <p className="mt-2 text-neutral-600 dark:text-neutral-300">Loading subscription details...</p>
                </div>
            );
        }

        if (subscriptionError) {
            return (
                <div className="p-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-center">
                    <Icon name="error_outline" className="mx-auto text-red-500 dark:text-red-400 h-12 w-12 mb-3" />
                    <p className="text-red-700 dark:text-red-300 font-semibold mb-1">Error loading subscription details.</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-3">{subscriptionError.message || "Please try again."}</p>
                    <Button onClick={fetchSubscriptionStatus} variant="outline" color="red">
                        <Icon name="refresh" className="mr-2 h-4 w-4" />
                        Retry
                    </Button>
                </div>
            );
        }

        if (!subscription || !subscription.is_active) {
            let message = "You currently don't have an active subscription.";
            if (subscription && subscription.status && !subscription.is_active) {
                // Could provide more specific messages based on status like 'canceled', 'past_due'
                message = `Your subscription is currently ${subscription.status_display || subscription.status}.`;
                if (subscription.status === 'canceled' && subscription.cancel_at_period_end && subscription.current_period_end) {
                    message = `Your plan, ${subscription.plan_name_display || 'Unknown Plan'}, is set to cancel on ${formatDate(subscription.current_period_end)}.`;
                } else if (subscription.status === 'canceled') {
                    message = `Your plan, ${subscription.plan_name_display || 'Unknown Plan'}, has been canceled.`;
                }
            }

            return (
                <div className="text-center p-6 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
                    <Icon name="credit_card_off" className="mx-auto text-amber-500 dark:text-amber-400 h-12 w-12 mb-3" />
                    <p className="text-lg font-medium text-neutral-700 dark:text-neutral-200 mb-2">{message}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        Choose a plan to unlock all features and manage your business effectively.
                    </p>
                    <Button
                        as={Link}
                        to="/plans"
                        variant="solid"
                        color="primary"
                        className="inline-flex items-center"
                    >
                        <Icon name="add_shopping_cart" className="mr-2 h-5 w-5" />
                        {scriptLines.planSelection.buttons.choosePlan || "Choose a Plan"}
                    </Button>
                    {subscription && !subscription.is_active && subscription.status !== 'canceled' && (
                        <Button
                            onClick={handleManageSubscription}
                            variant="outline"
                            className="mt-3 ml-0 sm:ml-3 sm:mt-0"
                            isLoading={isPortalLoading}
                            disabled={isPortalLoading}
                        >
                            <Icon name="settings" className="mr-2 h-5 w-5" />
                            {scriptLines.planSelection.buttons.manageSubscription || "Manage Subscription"}
                        </Button>
                    )}
                </div>
            );
        }

        // Active subscription details
        return (
            <div className="space-y-4">
                <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-1">Current Plan</h3>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{subscription.plan_name_display || 'N/A'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                        <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Status</h4>
                        <p className={`text-lg font-semibold ${subscription.is_active ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {subscription.status_display || subscription.status}
                            {subscription.status === 'trialing' && " (Trial)"}
                        </p>
                    </div>
                    <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                        <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                            {subscription.cancel_at_period_end ? "Cancels on" : "Renews on"}
                        </h4>
                        <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">
                            {formatDate(subscription.current_period_end)}
                        </p>
                    </div>
                </div>

                {subscription.status === 'trialing' && subscription.trial_end_date && (
                    <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-sky-50 dark:bg-sky-900/30">
                        <h4 className="text-sm font-medium text-sky-700 dark:text-sky-300 mb-1">Trial Ends</h4>
                        <p className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                            {formatDate(subscription.trial_end_date)}
                        </p>
                    </div>
                )}

                {subscription.cancel_at_period_end && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
                        <div className="flex items-center">
                            <Icon name="warning_amber" className="h-6 w-6 text-amber-500 dark:text-amber-400 mr-3 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-amber-700 dark:text-amber-300">Subscription Will Cancel</h4>
                                <p className="text-sm text-amber-600 dark:text-amber-400">
                                    Your access will end on {formatDate(subscription.current_period_end)}. You can reactivate your plan or choose a new one before this date.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <Button
                        onClick={handleManageSubscription}
                        variant="solid"
                        color="primary"
                        size="lg"
                        isLoading={isPortalLoading}
                        disabled={isPortalLoading}
                        className="w-full sm:w-auto"
                    >
                        <Icon name="settings_applications" className="mr-2 h-5 w-5" />
                        {scriptLines.planSelection.buttons.manageSubscription || "Manage Subscription"}
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-neutral-800 shadow-sm rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-1">Subscription & Billing</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                View your current plan details and manage your subscription.
            </p>
            {renderSubscriptionDetails()}
        </div>
    );
};

export default SubscriptionBillingPage;