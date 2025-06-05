// frontend/src/features/dashboard/DashboardHeader.jsx

import React, { useState, useRef, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext'; // Import useSubscription
import Icon from '../../components/common/Icon';

const DashboardHeader = () => {
    const { user, logout } = useAuth();
    const { subscription, isLoading: isSubscriptionLoading, error: subscriptionError } = useSubscription(); // Use the hook
    const navigate = useNavigate();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login/business');
        } catch (error) {
            console.error("Logout error in header:", error);
        }
    };

    // Click outside handler for menus
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

    const getSubscriptionDisplay = () => {
        if (isSubscriptionLoading) {
            return <span className="text-xs text-neutral-500 dark:text-neutral-400">Loading plan...</span>;
        }
        if (subscriptionError) {
            return <span className="text-xs text-red-500 dark:text-red-400">Plan error</span>;
        }
        if (subscription && subscription.is_active) {
            return <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{subscription.plan_name_display}</span>;
        }
        if (subscription && !subscription.is_active) {
             return <span className="text-xs text-amber-600 dark:text-amber-400">Plan: {subscription.plan_name_display} ({subscription.status_display})</span>;
        }
        return <Link to="/plans" className="text-xs text-rose-600 dark:text-rose-400 hover:underline">No Active Plan</Link>;
    };


    if (!user) {
        // This shouldn't happen if the route is protected, but as a fallback
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
                    {/* Left Section: Logo and Business Name */}
                    <div className="flex items-center">
                        <Link to="/dashboard/business" className="flex-shrink-0">
                            {/* <img className="h-8 w-auto" src="/path/to/your/logo.svg" alt="Business Logo" /> */}
                            <span className="sr-only">Business Dashboard</span>
                        </Link>
                        <div className="hidden md:block ml-6">
                            <div className="flex items-baseline space-x-1">
                                <span className="text-xl font-semibold text-neutral-700 dark:text-neutral-200">
                                    {user.activeBusinessName || "Business Dashboard"}
                                </span>
                                {/* Display Subscription Plan */}
                                <div className="ml-2 pl-2 border-l border-neutral-300 dark:border-neutral-600">
                                    {getSubscriptionDisplay()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Button (Hamburger) */}
                    <div className="md:hidden flex items-center">
                        <button
                            id="mobile-menu-button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-500"
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="mobile-dashboard-menu"
                        >
                            <span className="sr-only">Open main menu</span>
                            <Icon name={isMobileMenuOpen ? "close" : "menu"} className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Right Section: Search (optional), Notifications, Profile */}
                    <div className="hidden md:flex md:items-center md:ml-6 space-x-4">
                        {/* Optional Search Bar - Placeholder */}
                        {/* <div className="relative">
                            <input 
                                type="search" 
                                placeholder="Search orders, products..."
                                className="bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm rounded-full py-2 pl-10 pr-4 focus:ring-rose-500 focus:border-rose-500 w-64"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon name="search" className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                            </div>
                        </div> */}

                        <button
                            title="Notifications"
                            className="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-100 dark:focus:ring-offset-neutral-800 focus:ring-rose-500 transition-colors"
                        >
                            <span className="sr-only">View notifications</span>
                            <Icon name="notifications" className="h-6 w-6" />
                            {/* Optional: Notification count badge */}
                            {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500" /> */}
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center max-w-xs bg-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-100 dark:focus:ring-offset-neutral-800 focus:ring-rose-500"
                                id="user-menu-button"
                                aria-expanded={isProfileMenuOpen}
                                aria-haspopup="true"
                            >
                                <span className="sr-only">Open user menu</span>
                                <div className="w-9 h-9 bg-rose-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
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
                                            <div className="mt-1">{getSubscriptionDisplay()}</div> {/* Subscription display in profile dropdown */}
                                        </div>
                                        {/* Add more links as needed */}
                                        <Link to="/dashboard/business/profile" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" role="menuitem">Your Profile</Link>
                                        <Link to="/dashboard/business/settings" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" role="menuitem">Account Settings</Link>
                                        <Link to="/plans" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" role="menuitem">Manage Subscription</Link>
                                        {/* <button onClick={() => { alert('Switch Business Clicked'); setIsProfileMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" role="menuitem">Switch Business</button> */}
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

            {/* Mobile Menu Dropdown */}
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
                                <div className="mt-1">{getSubscriptionDisplay()}</div> {/* Subscription display in mobile menu */}
                            </div>
                            {/* Mobile Nav Links - Placeholder */}
                            <Link to="/dashboard/business" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">Dashboard</Link>
                            <Link to="/dashboard/business/orders" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">Orders</Link>
                            <Link to="/dashboard/business/products" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">Products</Link>
                            <Link to="/dashboard/business/inventory" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">Inventory</Link>
                        </div>
                        <div className="pt-4 pb-3 border-t border-neutral-200 dark:border-neutral-700">
                            <div className="flex items-center px-5">
                                <div className="flex-shrink-0 w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white font-semibold">
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
                                <Link to="/dashboard/business/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">Your Profile</Link>
                                <Link to="/dashboard/business/settings" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">Settings</Link>
                                <Link to="/plans" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">Manage Subscription</Link>
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