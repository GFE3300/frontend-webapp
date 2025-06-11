import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';

const Tooltip = ({ label }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9, x: -5 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.9, x: -5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25, duration: 0.1 }}
        className="absolute left-full ml-4 px-3 py-1.5 text-sm font-medium text-white bg-neutral-900 dark:bg-black rounded-lg shadow-lg whitespace-nowrap z-50"
    >
        {label}
    </motion.div>
);

const NotificationBadge = ({ count }) => (
    <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 bg-rose-500 text-white text-xs font-bold rounded-full border-2 border-neutral-800"
    >
        {count}
    </motion.div>
);

const SidebarNavItem = ({ to, iconName, label, notificationCount = 0 }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <NavLink
            to={to}
            className="relative flex items-center justify-center h-12 w-12 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 dark:focus-visible:ring-offset-neutral-800"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <motion.div
                            layoutId="active-nav-pill"
                            className="absolute inset-0 bg-primary-500/80 rounded-full"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                    )}

                    <motion.div
                        className="relative z-10"
                        whileHover={{ scale: 1.1 }}
                    >
                        <Icon
                            name={iconName}
                            className={`transition-all duration-300 ease-in-out ${isActive ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}
                            // This style enables the smooth 'fill' animation on the icon font
                            style={{ transition: 'font-variation-settings 300ms ease-in-out, color 300ms ease-in-out' }}
                            variations={{
                                fill: isActive ? 1 : 0,
                                weight: isActive ? 500 : 300,
                                grade: 0,
                                opsz: 24
                            }}
                        />
                    </motion.div>

                    <AnimatePresence>
                        {isHovered && <Tooltip label={label} />}
                        {notificationCount > 0 && <NotificationBadge count={notificationCount} />}
                    </AnimatePresence>
                </>
            )}
        </NavLink>
    );
};

SidebarNavItem.propTypes = {
    to: PropTypes.string.isRequired,
    iconName: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    notificationCount: PropTypes.number,
};

Tooltip.propTypes = {
    label: PropTypes.string.isRequired,
};

NotificationBadge.propTypes = {
    count: PropTypes.number.isRequired,
};

export default React.memo(SidebarNavItem);