import React from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import Icon from '../../../components/common/Icon'; // Assuming Icon component path

const settingsNavLinks = [
    { name: 'Profile', to: 'profile', icon: 'person_outline' },
    { name: 'Subscription & Billing', to: 'billing', icon: 'credit_card' },
    { name: 'Team Management', to: 'team', icon: 'group' }, // NEW: Nav link
    // Add more settings links here as needed:
    // { name: 'Notifications', to: 'notifications', icon: 'notifications_none' },
    // { name: 'Security', to: 'security', icon: 'shield_outline' },
];

const SettingsPage = () => {
    const location = useLocation();

    // If the user is at /dashboard/business/settings, redirect to a default sub-page.
    if (location.pathname === '/dashboard/business/settings' || location.pathname === '/dashboard/business/settings/') {
        return <Navigate to="profile" replace />;
    }

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Account Settings</h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Manage your profile, subscription, and other account settings.
                </p>
            </div>

            <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
                <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
                    <nav className="space-y-1">
                        {settingsNavLinks.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.to}
                                end // Important for NavLink to not stay active for parent routes
                                className={({ isActive }) =>
                                    `group rounded-md px-3 py-2 flex items-center text-sm font-medium transition-colors duration-150 ease-in-out
                                    ${isActive
                                        ? 'bg-primary-50 dark:bg-primary-700/20 text-primary-600 dark:text-primary-300'
                                        : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-700/50'
                                    }`
                                }
                            >
                                <Icon name={item.icon} className="mr-3 flex-shrink-0 h-5 w-5" />
                                <span className="truncate">{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
                    {/* Outlet will render the matched child route (Profile, Billing, or Team) */}
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;