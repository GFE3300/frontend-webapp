import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SidebarNavItem from './subcomponents/SidebarNavItem';
import Icon from '../../components/common/Icon';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

// Optional SidebarHeader (simple version)
const SidebarHeader = ({ isCollapsed, businessName }) => (
    <div className={`h-16 flex items-center border-b border-neutral-200 dark:border-neutral-700 transition-all duration-300 ease-in-out ${isCollapsed ? 'px-2 justify-center' : 'px-6'}`}>
        <Link to="/dashboard/business" className="flex items-center gap-2 overflow-hidden">
            {/* Placeholder for a real logo */}
            <div className={`flex-shrink-0 p-1.5 rounded-md ${isCollapsed ? 'bg-rose-500 dark:bg-rose-600' : 'bg-rose-100 dark:bg-rose-800'}`}>
                <Icon name="donut_small" className={`w-6 h-6 transition-colors ${isCollapsed ? 'text-white' : 'text-rose-500 dark:text-rose-400'}`} />
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
                        {businessName || "SmoreDash"}
                    </motion.span>
                )}
            </AnimatePresence>
        </Link>
    </div>
);

// Optional SidebarFooter (simple version with toggle)
const SidebarFooter = ({ isCollapsed, toggleCollapse }) => (
    <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
        <button
            onClick={toggleCollapse}
            className={`w-full flex items-center h-10 px-3 rounded-lg text-sm font-medium 
                        text-neutral-600 dark:text-neutral-300 
                        hover:bg-neutral-100 dark:hover:bg-neutral-700 
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500
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


const Sidebar = () => {
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(localStorage.getItem('sidebarCollapsed') === 'true');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // md breakpoint

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }, [isCollapsed]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile && !isCollapsed) { // Auto-collapse on mobile if expanded
                setIsCollapsed(true);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty dependency to run once on mount

    const toggleCollapse = () => {
        if (isMobile && !isCollapsed) { // If mobile and trying to expand, it might not be desired
            return; // Or handle mobile menu differently
        }
        setIsCollapsed(!isCollapsed);
    };

    // MODIFICATION: Removed the conditional logic that adds the "Affiliates" nav item.
    // This sidebar is now exclusively for the customer-facing business dashboard.
    const navItems = useMemo(() => {
        const baseItems = [
            { name: 'Overview', icon: 'space_dashboard', path: '/dashboard/business/overview' },
            { name: 'Orders', icon: 'receipt_long', path: '/dashboard/business/orders' },
            { name: 'Products', icon: 'restaurant_menu', path: '/dashboard/business/products' },
            { name: 'Inventory', icon: 'inventory', path: '/dashboard/business/inventory' },
            { name: 'Venue', icon: 'storefront', path: '/dashboard/business/venue' },
            { name: 'Analytics', icon: 'analytics', path: '/dashboard/business/analytics' },
            { name: 'Settings', icon: 'settings', path: '/dashboard/business/settings' },
        ];

        // The logic for adding the "Affiliates" link based on user role has been removed from this component.
        // It will be re-implemented in the new StaffSidebar.

        return baseItems;
    }, []); // MODIFICATION: Removed user.role from dependency array as it's no longer used.


    const sidebarVariants = {
        expanded: { width: '16rem' }, // w-64
        collapsed: { width: isMobile ? '0rem' : '5rem' }, // w-0 on mobile, w-20 on desktop
    };

    if (isMobile && isCollapsed) { // On mobile, completely hide sidebar if collapsed (or use off-canvas)
        return null; // Or a button to toggle an off-canvas menu
    }


    return (
        <motion.aside
            initial={false}
            animate={isCollapsed ? "collapsed" : "expanded"}
            variants={sidebarVariants}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-neutral-800 shadow-lg flex-shrink-0 print:hidden flex flex-col h-screen fixed md:static z-30 md:z-auto left-0 top-0"
        >
            <SidebarHeader isCollapsed={isCollapsed} businessName={user?.activeBusinessName} />
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
            {!isMobile && <SidebarFooter isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />}
        </motion.aside>
    );
};

export default Sidebar;