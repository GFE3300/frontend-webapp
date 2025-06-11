import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

import Icon from '../../components/common/Icon';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

const NavItem = ({ to, iconName, label }) => {
    return (
        <NavLink to={to} className="relative flex flex-col items-center justify-center w-16 h-16 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">
            {({ isActive }) => (
                <>
                    <AnimatePresence>
                        {isActive && (
                            <motion.div
                                layoutId="active-mobile-indicator"
                                className="absolute inset-0 bg-rose-500 rounded-2xl shadow-lg shadow-rose-500/50"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            />
                        )}
                    </AnimatePresence>

                    <div className="relative flex flex-col items-center justify-center text-center">
                        <Icon
                            name={iconName}
                            className={`w-6 h-6 mb-0.5 transition-colors ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-100'}`}
                            variations={{ fill: isActive ? 1 : 0 }}
                        />
                    </div>
                </>
            )}
        </NavLink>
    );
};

NavItem.propTypes = {
    to: PropTypes.string.isRequired,
    iconName: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
};

const MobileNavbar = () => {
    const { user } = useAuth();
    const { permissions, isLoading } = usePermissions();

    const navItems = useMemo(() => {
        const allItems = [
            { name: 'Overview', icon: 'space_dashboard', path: '/dashboard/business/overview', requiredRoles: ['ADMIN', 'MANAGER', 'STAFF'] },
            { name: 'Orders', icon: 'receipt_long', path: '/dashboard/business/orders', requiredRoles: ['ADMIN', 'MANAGER', 'STAFF'] },
            { name: 'Products', icon: 'restaurant_menu', path: '/dashboard/business/products', requiredRoles: ['ADMIN', 'MANAGER'] },
            { name: 'Venue', icon: 'storefront', path: '/dashboard/business/venue', requiredRoles: ['ADMIN', 'MANAGER'] },
            { name: 'Settings', icon: 'settings', path: '/dashboard/business/settings', requiredRoles: ['ADMIN', 'MANAGER', 'STAFF'] },
        ];

        if (isLoading || !user) return [];

        return allItems.filter(item => {
            const hasRole = item.requiredRoles.includes(user.role);
            const hasPermission = item.requiresPermission !== false;
            return hasRole && hasPermission;
        }).slice(0, 5); // Ensure a max of 5 items for a clean look
    }, [user, permissions, isLoading]);

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
            <LayoutGroup>
                <nav className="flex items-center justify-center h-20 w-auto gap-2 p-2 bg-black/30 dark:bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                    {navItems.map(item => (
                        <NavItem
                            key={item.name}
                            to={item.path}
                            iconName={item.icon}
                            label={item.name}
                        />
                    ))}
                </nav>
            </LayoutGroup>
        </div>
    );
};

export default MobileNavbar;