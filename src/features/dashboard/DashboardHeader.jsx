// frontend/src/features/dashboard/DashboardHeader.jsx

import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useToast } from '../../contexts/ToastContext';
import apiService from '../../services/api'; // Already imported
import Icon from '../../components/common/Icon';
import Spinner from '../../components/common/Spinner';
import BusinessSwitcher from './header/BusinessSwitcher';
import { scriptLines_Components as scriptLines } from '../payments/utils/script_lines';

const DashboardHeader = () => {
    const { user, logout } = useAuth();
    const {
        subscription,
        isLoading: isSubscriptionLoading,
        error: subscriptionError,
        fetchSubscriptionStatus,
    } = useSubscription();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);

    // NEW: State for portal loading from header click
    const [isHeaderPortalLoading, setIsHeaderPortalLoading] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login/business');
        } catch (error) {
            console.error("Logout error in header:", error);
            addToast("Failed to logout. Please try again.", "error");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('#mobile-menu-button')) {
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuTransition = { type: "spring", stiffness: 300, damping: 25 };
    const itemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 },
    };

    const handleManageSubscriptionClick = useCallback(async () => {
        // Close profile menu if it was the source, set appropriate loader
        if (isProfileMenuOpen) setIsProfileMenuOpen(false);
        setIsHeaderPortalLoading(true); // Use a separate loading state for header interaction

        addToast("Redirecting to subscription management...", "info");
        try {
            const response = await apiService.createCustomerPortalSession();
            if (response.data && response.data.url) {
                window.location.href = response.data.url;
            } else {
                addToast("Could not open subscription management portal. Please try again.", "error");
                setIsHeaderPortalLoading(false);
            }
        } catch (err) {
            console.error("Error creating customer portal session from header:", err);
            const errorMessage = err.response?.data?.error || err.response?.data?.detail || "Error accessing subscription management. Please try again.";
            addToast(errorMessage, "error");
            setIsHeaderPortalLoading(false);
        }
        // On success, page redirects, so no need to set isHeaderPortalLoading to false.
    }, [addToast, isProfileMenuOpen]);

    const getSubscriptionDisplay = useCallback(() => {
        if (isSubscriptionLoading || isHeaderPortalLoading) { // Check both loading states
            return (
                <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                    <Spinner size="sm" className="mr-1" />
                    {isHeaderPortalLoading ? "Redirecting..." : "Loading plan..."}
                </div>
            );
        }
        if (subscriptionError) {
            return (
                <span className="text-xs text-red-500 dark:text-red-400">
                    Plan error
                    <button
                        onClick={() => {
                            setIsHeaderPortalLoading(true); // Show loading while retrying
                            fetchSubscriptionStatus().finally(() => setIsHeaderPortalLoading(false));
                        }}
                        className="ml-1 underline text-xs hover:text-red-700 dark:hover:text-red-200"
                        disabled={isHeaderPortalLoading}
                    >
                        (retry)
                    </button>
                </span>
            );
        }
        if (subscription && subscription.is_active) {
            let planText = subscription.plan_name_display || "Active Plan";
            if (subscription.status === 'trialing') {
                planText += ' (Trial)';
            }
            if (subscription.cancel_at_period_end) {
                planText += ` - Cancels ${new Date(subscription.current_period_end).toLocaleDateString()}`;
                return ( // Make it clickable if set to cancel
                    <button
                        onClick={handleManageSubscriptionClick}
                        className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
                        title="Plan is set to cancel. Click to manage."
                        disabled={isHeaderPortalLoading}
                    >
                        {planText}
                    </button>
                );
            }
            return (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {planText}
                </span>
            );
        }
        // Not active, or issues other than cancel_at_period_end with an active flag
        if (subscription && !subscription.is_active) {
            let statusText = subscription.status_display || 'Inactive';
            // If status is like 'past_due', 'unpaid', or known non-active states
            if (['past_due', 'unpaid', 'incomplete'].includes(subscription.status)) {
                return (
                    <button
                        onClick={handleManageSubscriptionClick}
                        className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                        title={`Plan: ${subscription.plan_name_display || 'N/A'}. Status: ${statusText}. Click to manage.`}
                        disabled={isHeaderPortalLoading}
                    >
                        {subscription.plan_name_display || 'Plan'}: {statusText} - Manage
                    </button>
                );
            }
            // For 'canceled' status (not cancel_at_period_end, but fully canceled)
            if (subscription.status === 'canceled') {
                return (
                    <Link to="/plans" className="text-xs text-rose-600 dark:text-rose-400 hover:underline">
                        Plan Canceled - Choose New Plan
                    </Link>
                );
            }
            // Fallback for other non-active states
            return (
                <Link to="/plans" className="text-xs text-rose-600 dark:text-rose-400 hover:underline">
                    {subscription.plan_name_display || 'Plan'} {statusText} - Choose Plan
                </Link>
            );
        }

        // Default: No subscription found at all
        return (
            <Link to="/plans" className="text-xs text-rose-600 dark:text-rose-400 hover:underline">
                No Active Plan - Choose Plan
            </Link>
        );
    }, [
        isSubscriptionLoading,
        subscriptionError,
        subscription,
        fetchSubscriptionStatus,
        handleManageSubscriptionClick,
        isHeaderPortalLoading // ADDED
    ]);


    if (!user) {
        // ... (existing no user return)
        return (
            <header className="bg-white dark:bg-neutral-900 shadow-md py-3 px-4 sm:px-6 lg:px-8">
                <div className="max-w-full mx-auto flex items-center justify-between">
                    <span className="text-2xl font-semibold text-rose-600 dark:text-rose-400">Business Dashboard</span>
                    <Link to="/login/business" className="text-rose-600 dark:text-rose-400 hover:underline">Login</Link>
                </div>
            </header>
        );
    }

    return (
        <header className="bg-white dark:bg-neutral-800 shadow-sm sticky top-0 z-40 print:hidden">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="hidden md:block">
                            <BusinessSwitcher />
                        </div>
                        {/* Logo/Brand area */}
                        <Link to="/dashboard/business" className="flex-shrink-0">
                            {/* You can use your actual Logo component here if available */}
                            {/* <img className="h-8 w-auto" src="/path-to-your-logo.png" alt="SmoreDash" /> */}
                            <Icon name="donut_small" className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                        </Link>
                        <div className="hidden md:block ml-4"> {/* Reduced ml from 6 to 4 */}
                            <div className="flex items-baseline space-x-1">
                                <span className="text-xl font-semibold text-neutral-700 dark:text-neutral-200">
                                    {user.activeBusinessName || "Business Dashboard"}
                                </span>
                                <div className="ml-2 pl-2 border-l border-neutral-300 dark:border-neutral-600">
                                    {getSubscriptionDisplay()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        {/* Subscription status for mobile - simplified or can be part of mobile menu */}
                        <div className="mr-2">{getSubscriptionDisplay()}</div>
                        <button
                            id="mobile-menu-button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="mobile-dashboard-menu"
                        >
                            <span className="sr-only">Open main menu</span>
                            <Icon name={isMobileMenuOpen ? "close" : "menu"} className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Desktop right-side items */}
                    <div className="hidden md:flex md:items-center md:ml-6 space-x-4">
                        <button
                            title="Notifications"
                            className="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-100 dark:focus:ring-offset-neutral-800 focus:ring-primary-500 transition-colors"
                        >
                            <span className="sr-only">View notifications</span>
                            <Icon name="notifications" className="h-6 w-6" />
                        </button>

                        {/* Profile dropdown */}
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center max-w-xs bg-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-100 dark:focus:ring-offset-neutral-800 focus:ring-primary-500"
                                id="user-menu-button"
                                aria-expanded={isProfileMenuOpen}
                                aria-haspopup="true"
                            >
                                <span className="sr-only">Open user menu</span>
                                <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    {user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-2 hidden lg:block">
                                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{user.firstName} {user.lastName}</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-0.5">{user.role || 'Member'}</p>
                                </div>
                                <Icon name="arrow_drop_down" className="ml-1 h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                            </button>
                            <AnimatePresence>
                                {isProfileMenuOpen && (
                                    <motion.div
                                        variants={itemVariants}
                                        initial="hidden" animate="visible" exit="hidden"
                                        transition={menuTransition}
                                        className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black dark:ring-neutral-700 ring-opacity-5 focus:outline-none py-1 z-50"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="user-menu-button"
                                        id="profile-menu-items"
                                    >
                                        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                                            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate">{user.firstName} {user.lastName}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
                                            <div className="mt-1">{getSubscriptionDisplay()}</div> {/* Display status in dropdown too */}
                                        </div>
                                        <Link to="/dashboard/business/settings/profile" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" role="menuitem">Your Profile</Link>
                                        <Link to="/dashboard/business/settings" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" role="menuitem">Account Settings</Link>
                                        <button
                                            onClick={handleManageSubscriptionClick}
                                            className="w-full text-left block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                            role="menuitem"
                                            disabled={isHeaderPortalLoading} // Disable if portal is loading
                                        >
                                            {isHeaderPortalLoading && <Spinner size="xs" className="mr-2 inline-block" />}
                                            {scriptLines.planSelection.buttons.manageSubscription}
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/20 transition-colors"
                                            role="menuitem"
                                        >
                                            Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        ref={mobileMenuRef}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="md:hidden border-t border-neutral-200 dark:border-neutral-700"
                        id="mobile-dashboard-menu"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <div className="px-3 py-2">
                                <span className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">
                                    {user.activeBusinessName || "Business"}
                                </span>
                                {/* Mobile subscription status display - already handled by getSubscriptionDisplay */}
                                <div className="mt-1">{getSubscriptionDisplay()}</div>
                            </div>
                            <Link to="/dashboard/business/overview" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">Overview</Link>
                            <Link to="/dashboard/business/orders" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">Orders</Link>
                            <Link to="/dashboard/business/products" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">Products</Link>
                            <Link to="/dashboard/business/venue" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">Venue</Link>
                            <Link to="/dashboard/business/analytics" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">Analytics</Link>
                        </div>
                        <div className="pt-4 pb-3 border-t border-neutral-200 dark:border-neutral-700">
                            <div className="flex items-center px-5">
                                <div className="flex-shrink-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-neutral-800 dark:text-neutral-100">{user.firstName} {user.lastName}</div>
                                    <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{user.email}</div>
                                </div>
                                <button className="ml-auto p-1.5 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none">
                                    <Icon name="notifications" className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="mt-3 px-2 space-y-1">
                                <Link to="/dashboard/business/settings/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">Your Profile</Link>
                                <Link to="/dashboard/business/settings" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">Settings</Link>
                                <button
                                    onClick={() => { handleManageSubscriptionClick(); setIsMobileMenuOpen(false); }}
                                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                    disabled={isHeaderPortalLoading}
                                >
                                    {isHeaderPortalLoading && <Spinner size="xs" className="mr-2 inline-block" />}
                                    {scriptLines.planSelection.buttons.manageSubscription}
                                </button>
                                <button
                                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/20"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default memo(DashboardHeader);