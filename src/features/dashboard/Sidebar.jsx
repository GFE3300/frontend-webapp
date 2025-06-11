import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

import Icon from '../../components/common/Icon';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import logo from '../../assets/logo/Logo.svg';

const Tooltip = ({ label }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9, x: 10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.9, x: 10 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute font-montserrat left-full ml-4 px-3 py-1.5 text-sm font-medium text-white bg-neutral-900/80 dark:bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg whitespace-nowrap z-50"
    >
        {label}
    </motion.div>
);

const SidebarNavItem = ({ to, iconName, label }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <NavLink
            to={to}
            className="relative flex items-center justify-center group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {({ isActive }) => (
                <div className="relative flex items-center justify-center w-14 h-14">
                    <AnimatePresence>
                        {isActive && (
                            <motion.div
                                layoutId="active-sidebar-indicator"
                                className="absolute inset-0 bg-rose-500 rounded-2xl shadow-lg shadow-rose-500/50"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Hover effect background */}
                    <AnimatePresence>
                        {isHovered && !isActive && (
                            <motion.div
                                className="absolute inset-0 bg-white/10 rounded-2xl"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            />
                        )}
                    </AnimatePresence>

                    <motion.div
                        className="relative flex items-center justify-center w-full h-full"
                        whileHover={{ scale: 1.1 }}
                    >
                        <Icon
                            name={iconName}
                            className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-neutral-100 group-hover:text-white'}`}
                            variations={{ fill: isActive ? 1 : 0, weight: isActive ? 600 : 300 }}
                        />
                    </motion.div>
                    <AnimatePresence>
                        {isHovered && <Tooltip label={label} />}
                    </AnimatePresence>
                </div>
            )}
        </NavLink>
    );
};

const Sidebar = () => {
    const { user } = useAuth();
    const { permissions, isLoading } = usePermissions();

    const allPossibleItems = useMemo(() => [
        { name: 'Overview', icon: 'space_dashboard', path: '/dashboard/business/overview', requiredRoles: ['ADMIN', 'MANAGER', 'STAFF'] },
        { name: 'Orders', icon: 'receipt_long', path: '/dashboard/business/orders', requiredRoles: ['ADMIN', 'MANAGER', 'STAFF'] },
        { name: 'Products', icon: 'restaurant_menu', path: '/dashboard/business/products', requiredRoles: ['ADMIN', 'MANAGER'] },
        { name: 'Venue', icon: 'storefront', path: '/dashboard/business/venue', requiredRoles: ['ADMIN', 'MANAGER'] },
        { name: 'Analytics', icon: 'analytics', path: '/dashboard/business/analytics', requiredRoles: ['ADMIN', 'MANAGER'], requiresPermission: permissions.canAccessAnalytics },
        { name: 'Settings', icon: 'settings', path: '/dashboard/business/settings', requiredRoles: ['ADMIN', 'MANAGER', 'STAFF'] },
    ], [permissions.canAccessAnalytics]);

    const { navItems, settingsItem } = useMemo(() => {
        if (isLoading || !user) return { navItems: [], settingsItem: null };

        const visibleItems = allPossibleItems.filter(item => {
            const hasRole = item.requiredRoles.includes(user.role);
            const hasPermission = item.requiresPermission !== false;
            return hasRole && hasPermission;
        });

        const mainNav = visibleItems.filter(item => item.name !== 'Settings');
        const settingsNav = visibleItems.find(item => item.name === 'Settings');

        return { navItems: mainNav, settingsItem: settingsNav };
    }, [user, permissions, isLoading, allPossibleItems]);

    return (
        <aside className="relative h-full px-4 pb-4 flex">
            <LayoutGroup>
                <nav
                    className="
                        flex flex-col items-center w-20
                        h-full p-2 gap-2 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl
                        bg-gradient-to-b from-black/20 via-black/50 to-black/20 dark:from-neutral-900/20 dark:via-neutral-900/50 dark:to-neutral-900/20"
                >
                    {/* Top Section: Logo & Main Navigation */}
                    <div className="flex flex-col items-center gap-2">

                        {navItems.map((item, index) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 + index * 0.05 }}
                            >
                                <SidebarNavItem
                                    to={item.path}
                                    iconName={item.icon}
                                    label={item.name}
                                />
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom Section: Settings (pushed to the end) */}
                    <div className="mt-auto flex flex-col items-center gap-2">
                        {settingsItem && (
                            <motion.div
                                key={settingsItem.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 + navItems.length * 0.05 }}
                            >
                                <SidebarNavItem
                                    to={settingsItem.path}
                                    iconName={settingsItem.icon}
                                    label={settingsItem.name}
                                />
                            </motion.div>
                        )}
                    </div>
                </nav>
            </LayoutGroup>
        </aside>
    );
};

Tooltip.propTypes = { label: PropTypes.string.isRequired };
SidebarNavItem.propTypes = {
    to: PropTypes.string.isRequired,
    iconName: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
};

export default Sidebar;