import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Reusing existing, well-structured components
import SidebarNavItem from '../dashboard/subcomponents/SidebarNavItem';
import Icon from '../../components/common/Icon';
import { useAuth } from '../../contexts/AuthContext';

// Header and Footer can be reused or adapted if needed. For now, we reuse the pattern.
const StaffSidebarHeader = ({ isCollapsed }) => (
    <div className={`h-16 flex items-center border-b border-neutral-200 dark:border-neutral-700 transition-all duration-300 ease-in-out ${isCollapsed ? 'px-2 justify-center' : 'px-6'}`}>
        <Link to="/staff/dashboard" className="flex items-center gap-2 overflow-hidden">
            <div className={`flex-shrink-0 p-1.5 rounded-md ${isCollapsed ? 'bg-indigo-500 dark:bg-indigo-600' : 'bg-indigo-100 dark:bg-indigo-800'}`}>
                <Icon name="shield_person" className={`w-6 h-6 transition-colors ${isCollapsed ? 'text-white' : 'text-indigo-500 dark:text-indigo-400'}`} />
            </div>
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 whitespace-nowrap"
                    >
                        Staff Portal
                    </motion.span>
                )}
            </AnimatePresence>
        </Link>
    </div>
);

const StaffSidebarFooter = ({ isCollapsed, toggleCollapse }) => (
    <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
        <button
            onClick={toggleCollapse}
            className={`w-full flex items-center h-10 px-3 rounded-lg text-sm font-medium 
                        text-neutral-600 dark:text-neutral-300 
                        hover:bg-neutral-100 dark:hover:bg-neutral-700 
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                        transition-all duration-300 ease-in-out
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
            <Icon name={isCollapsed ? "chevron_right" : "chevron_left"} className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.span
                        key="toggle-label"
                        initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                        animate={{ opacity: 1, width: 'auto', marginLeft: '0.5rem' }}
                        exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut", delay: 0.1 }}
                        className="overflow-hidden whitespace-nowrap"
                    >
                        Collapse
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    </div>
);

const StaffSidebar = () => {
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(localStorage.getItem('staffSidebarCollapsed') === 'true');

    useEffect(() => {
        localStorage.setItem('staffSidebarCollapsed', isCollapsed);
    }, [isCollapsed]);

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    // MODIFICATION: This is the core logic for the staff sidebar. It dynamically generates
    // navigation links based on the user's staff-related flags.
    const navItems = useMemo(() => {
        if (!user) return [];

        // Links for Superusers (Admins)
        if (user.is_superuser) {
            return [
                { name: 'Admin Dashboard', icon: 'admin_panel_settings', path: '/staff/dashboard' }, // Link to the generic staff dashboard
                { name: 'Manage Affiliates', icon: 'group', path: '/staff/manage-affiliates' },
                { name: 'Payouts', icon: 'payments', path: '/staff/payouts' },
                // { name: 'System Settings', icon: 'settings', path: '/staff/system-settings' }, // Placeholder for future
            ];
        }

        // Links for regular Staff (Affiliates)
        if (user.is_staff) {
            return [
                { name: 'My Dashboard', icon: 'dashboard', path: '/staff/dashboard' },
                // { name: 'My Referrals', icon: 'share', path: '/staff/my-referrals' }, // Placeholder for future
                // { name: 'My Commissions', icon: 'paid', path: '/staff/my-commissions' }, // Placeholder for future
                // { name: 'My Payouts', icon: 'receipt_long', path: '/staff/my-payouts' }, // Placeholder for future
                // { name: 'My Settings', icon: 'person', path: '/staff/my-settings' }, // Placeholder for future
            ];
        }

        return [];
    }, [user]);

    const sidebarVariants = {
        expanded: { width: '16rem' },
        collapsed: { width: '5rem' },
    };

    return (
        <motion.aside
            initial={false}
            animate={isCollapsed ? "collapsed" : "expanded"}
            variants={sidebarVariants}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-neutral-800 shadow-lg flex-shrink-0 print:hidden flex flex-col h-screen"
        >
            <StaffSidebarHeader isCollapsed={isCollapsed} />
            <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => (
                    <SidebarNavItem
                        key={item.name}
                        to={item.path}
                        iconName={item.icon}
                        label={item.name}
                        isCollapsed={isCollapsed}
                    />
                ))}
            </nav>
            <StaffSidebarFooter isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
        </motion.aside>
    );
};

export default StaffSidebar;