import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useSubscription } from '../../../contexts/SubscriptionContext';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../contexts/ToastContext';
import apiService from '../../../services/api';

import Icon from '../../../components/common/Icon';
import Spinner from '../../../components/common/Spinner';
import { scriptLines_dashboard as sl } from '../utils/script_lines';
import { interpolate } from '../../../i18n';

/**
 * A dynamic, context-aware badge that displays the user's subscription status.
 * It handles loading, errors, and all plan states with distinct visuals and actions.
 * It is fully self-contained, fetching its own data via hooks.
 */
const SubscriptionBadge = () => {
    const { subscription, isLoading: isSubscriptionLoading, error: subscriptionError } = useSubscription();
    const { permissions, isLoading: isPermissionsLoading } = usePermissions();
    const { addToast } = useToast();
    const [isPortalLoading, setIsPortalLoading] = React.useState(false);

    const handleManageSubscriptionClick = useCallback(async () => {
        setIsPortalLoading(true);
        addToast(sl.subscriptionBadge.redirectingToast || "Redirecting to billing portal...", "info", 2000);
        try {
            const response = await apiService.createCustomerPortalSession();
            window.location.href = response.data.url;
        } catch (err) {
            addToast(sl.subscriptionBadge.portalErrorToast || "Could not access the billing portal. Please try again later.", "error");
            setIsPortalLoading(false);
        }
    }, [addToast]);

    const getBadgeDetails = () => {
        // --- Loading State ---
        if (isSubscriptionLoading || isPermissionsLoading) {
            return {
                key: 'loading',
                content: <div className="h-6 w-24 bg-black/10 dark:bg-white/10 rounded-full animate-pulse" />,
                isWrapper: true,
            };
        }

        // --- Error State ---
        if (subscriptionError) {
            return {
                key: 'error',
                content: sl.subscriptionBadge.planError || "Plan Error",
                icon: "error_outline",
                className: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 ring-1 ring-inset ring-red-500/30",
            };
        }

        // --- No Subscription State ---
        if (!subscription) {
            return {
                key: 'no-plan',
                as: Link,
                to: "/plans",
                content: sl.subscriptionBadge.choosePlan || "+ Choose Plan",
                icon: "add",
                className: "bg-primary-500 hover:bg-primary-600 text-white shadow-md relative",
                hasPulse: true,
            };
        }

        // --- Canceled / Past Due States ---
        if (subscription.cancel_at_period_end) {
            return {
                key: 'cancels',
                as: 'button',
                onClick: handleManageSubscriptionClick,
                content: interpolate(sl.subscriptionBadge.cancelsOn || "Cancels {{date}}", { date: new Date(subscription.current_period_end).toLocaleDateString() }),
                icon: isPortalLoading ? <Spinner size="xs" /> : "event_busy",
                className: "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 ring-1 ring-inset ring-amber-500/30",
            };
        }

        if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
            return {
                key: 'past-due',
                as: 'button',
                onClick: handleManageSubscriptionClick,
                content: subscription.status_display || (sl.subscriptionBadge.actionRequired || "Action Required"),
                icon: isPortalLoading ? <Spinner size="xs" /> : "credit_card_error",
                className: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 ring-1 ring-inset ring-red-500/30 animate-pulse",
            };
        }

        // --- Active / Trialing States ---
        if (subscription.status === 'trialing') {
            const daysLeft = Math.ceil((new Date(subscription.current_period_end) - new Date()) / (1000 * 60 * 60 * 24));
            return {
                key: 'trial',
                as: Link,
                to: "/plans",
                content: daysLeft > 0 ? interpolate(sl.subscriptionBadge.trialDaysLeft || "Trial: {{days}}d left", { days: daysLeft }) : (sl.subscriptionBadge.trialEndsToday || 'Trial: Ends Today'),
                icon: "timelapse",
                className: "bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 ring-1 ring-inset ring-teal-500/20",
                hasPulse: true,
            };
        }

        switch (permissions.subscriptionPlan) {
            case 'growth_accelerator':
                return { key: 'growth', content: sl.subscriptionBadge.growthPlan || "Growth Plan", icon: "rocket_launch", className: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 ring-1 ring-inset ring-blue-500/20" };
            case 'premium_pro_suite':
                return { key: 'premium', content: sl.subscriptionBadge.premiumPlan || "Premium Plan", icon: "workspace_premium", className: "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 ring-1 ring-inset ring-amber-500/30" };
            case 'starter_essentials':
                return { key: 'starter', content: sl.subscriptionBadge.starterPlan || "Starter Plan", icon: "foundation", className: "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 ring-1 ring-inset ring-neutral-500/10" };
            default:
                return { key: 'unknown', as: Link, to: "/plans", content: sl.subscriptionBadge.managePlan || "Manage Plan", icon: "settings", className: "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 ring-1 ring-inset ring-neutral-500/10" };
        }
    };

    const details = getBadgeDetails();
    const Component = details.as || 'div';
    const commonClasses = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 shadow-sm whitespace-nowrap";

    if (details.isWrapper) {
        return details.content;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={details.key}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
            >
                <Component
                    to={details.to}
                    onClick={details.onClick}
                    disabled={isPortalLoading}
                    className={`${commonClasses} ${details.className}`}
                >
                    {details.icon && (typeof details.icon === 'string' ? <Icon name={details.icon} className="h-4 w-4" style={{ fontSize: '1rem' }} variations={{ fill: 1, weight: 600, grade: 0, opsz: 24 }} /> : details.icon)}
                    <span>{details.content}</span>
                    {details.hasPulse && <div className="absolute inset-0 rounded-full bg-current opacity-25 animate-ping"></div>}
                </Component>
            </motion.div>
        </AnimatePresence>
    );
};

export default memo(SubscriptionBadge);