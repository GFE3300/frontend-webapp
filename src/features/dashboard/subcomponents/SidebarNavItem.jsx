import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import Icon from '../../../components/common/Icon'; // Adjusted path
import { motion, AnimatePresence } from 'framer-motion';

const SidebarNavItem = ({ to, iconName, label, isCollapsed }) => {
    const navLinkClasses = ({ isActive }) =>
        `flex items-center h-12 px-4 rounded-lg transition-colors duration-200 ease-in-out group
        focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400
        ${isActive
            ? 'bg-rose-100 dark:bg-rose-700/30 text-rose-600 dark:text-rose-300 font-semibold shadow-inner'
            : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100'
        }
        ${isCollapsed ? 'justify-center' : ''}`;

    const labelVariants = {
        collapsed: { opacity: 0, width: 0, marginLeft: 0, transition: { duration: 0.2, ease: "easeInOut" } },
        expanded: { opacity: 1, width: 'auto', marginLeft: '0.75rem', transition: { duration: 0.2, ease: "easeInOut", delay: 0.1 } },
    };

    return (
        <NavLink to={to} className={navLinkClasses} title={isCollapsed ? label : undefined}>
            <Icon name={iconName} className="w-6 h-6 flex-shrink-0" />
            <AnimatePresence initial={false}>
                {!isCollapsed && (
                    <motion.span
                        key="label"
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={labelVariants}
                        className="overflow-hidden whitespace-nowrap"
                    >
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>
        </NavLink>
    );
};

SidebarNavItem.propTypes = {
    to: PropTypes.string.isRequired,
    iconName: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    isCollapsed: PropTypes.bool.isRequired,
};

export default React.memo(SidebarNavItem);