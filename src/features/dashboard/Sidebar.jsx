import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/common/Icon';

const Sidebar = () => {
    const navItems = [
        { name: 'Overview', icon: 'dashboard', path: '/dashboard/business' },
        { name: 'Orders', icon: 'receipt_long', path: '/dashboard/business/orders' },
        { name: 'Products', icon: 'inventory_2', path: '/dashboard/business/products' },
        { name: 'Inventory', icon: 'inventory', path: '/dashboard/business/inventory' },
        { name: 'Customers', icon: 'groups', path: '/dashboard/business/customers' },
        { name: 'Analytics', icon: 'analytics', path: '/dashboard/business/analytics' },
        { name: 'Settings', icon: 'settings', path: '/dashboard/business/settings' },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-neutral-800 shadow-lg flex-shrink-0 print:hidden md:flex flex-col">
            {/* Sidebar Header (Optional - could be part of main header for consistency) */}
            <div className="h-16 flex items-center justify-center border-b border-neutral-200 dark:border-neutral-700">
                {/* You could put a compact logo or business selector here */}
                <span className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">SmoreDash</span>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-rose-600 dark:hover:text-rose-400 group transition-colors"
                    >
                        <Icon name={item.icon} className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                    </Link>
                ))}
            </nav>
            {/* Optional Footer in Sidebar */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">© {new Date().getFullYear()} Smore</p>
            </div>
        </aside>
    );
};

export default Sidebar;