import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { useSubscription } from '../../contexts/SubscriptionContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useToast } from '../../contexts/ToastContext';

import apiService from '../../services/api';
import Icon from '../../components/common/Icon';
import BusinessSwitcher from './header/BusinessSwitcher';
import UserProfileWidget from './header/UserProfileWidget';

// --- Subscription Badge ---
const SubscriptionBadge = memo(({ handleManageSubscriptionClick }) => {
    const { subscription, isLoading } = useSubscription();
    const { permissions } = usePermissions();

    if (isLoading) {
        return <div className="h-7 w-24 bg-black/10 dark:bg-white/10 rounded-full animate-pulse"></div>;
    }

    const getDetails = () => {
        if (!subscription) return { text: "+ Choose Plan", color: "bg-primary-500 text-white hover:bg-primary-600", to: "/plans", hasPulse: true };
        if (subscription.status === 'trialing') return { text: "Trial Plan", color: "bg-teal-400/20 text-teal-200 border border-teal-400/30", hasPulse: true };
        if (subscription.cancel_at_period_end) return { text: "Set to Cancel", color: "bg-amber-400/20 text-amber-200 border border-amber-400/30", isPortalAction: true };
        switch (permissions.subscriptionPlan) {
            case 'starter_essentials': return { text: "Starter", color: "bg-white/10 text-neutral-200 border border-white/20" };
            case 'growth_accelerator': return { text: "Growth", color: "bg-blue-400/20 text-blue-200 border border-blue-400/30" };
            case 'premium_pro_suite': return { text: "Premium", color: "bg-amber-400/20 text-amber-200 border border-amber-400/30" };
            default: return { text: "Inactive", color: "bg-red-400/20 text-red-200 border border-red-400/30", to: "/plans" };
        }
    };
    const { text, color, to, isPortalAction, hasPulse } = getDetails();
    const badgeClasses = `text-xs font-bold px-3 py-1.5 rounded-full transition-transform duration-200 ease-in-out ${color}`;
    const content = <>{text}{hasPulse && <div className="absolute inset-0 rounded-full bg-current opacity-25 animate-ping"></div>}</>;

    if (to) return <Link to={to} className={`${badgeClasses} relative inline-block`}>{content}</Link>;
    if (isPortalAction) return <button onClick={handleManageSubscriptionClick} className={`${badgeClasses} relative`}>{content}</button>;
    return <div className={badgeClasses}>{content}</div>;
});
SubscriptionBadge.displayName = 'SubscriptionBadge';
SubscriptionBadge.propTypes = { handleManageSubscriptionClick: PropTypes.func.isRequired };


const DashboardHeader = () => {
    const { addToast } = useToast();

    const handleManageSubscriptionClick = useCallback(async () => {
        addToast("Redirecting...", "info");
        try {
            const response = await apiService.createCustomerPortalSession();
            window.location.href = response.data.url;
        } catch (err) {
            addToast("Error accessing subscription portal.", "error");
        }
    }, [addToast]);

    return (
        <div className="fixed top-0 left-0 right-0 z-40 p-4 print:hidden">
            <div className="flex items-center justify-between h-12">
                {/* Left Zone: Identity & Context */}
                <div className="flex items-center space-x-4">

                    {/* Left Zone: Logo Name */}
                    <Link to="/" className="flex font-montserrat items-center">
                        <span className="text-2xl mr-4">Crumb<strong>Data</strong></span>
                    </Link>

                    <BusinessSwitcher />
                    <div className="hidden sm:block">
                        <SubscriptionBadge handleManageSubscriptionClick={handleManageSubscriptionClick} />
                    </div>
                </div>

                {/* Right Zone: User Control */}
                <div className="flex items-center space-x-4">
                    <button
                        title="Notifications"
                        className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <Icon name="notifications" />
                    </button>

                    {/* The new, self-contained widget */}
                    <UserProfileWidget />
                </div>
            </div>
        </div>
    );
};

export default memo(DashboardHeader);