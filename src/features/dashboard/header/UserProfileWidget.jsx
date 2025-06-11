import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

import { useAuth } from '../../../contexts/AuthContext';
import { usePermissions } from '../../../hooks/usePermissions';
import Icon from '../../../components/common/Icon';
import UserAvatar from './UserAvatar'; // The refactored avatar
import SubscriptionBadge from './SubscriptionBadge'; // The new, self-contained badge
import { scriptLines_dashboard as sl } from '../utils/script_lines';

// Reusable animated dropdown item component
const DropdownItem = ({ children, onClick, iconName, iconClass = '' }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, x: -15 },
            visible: { opacity: 1, x: 0 },
        }}
    >
        <button
            onClick={onClick}
            className="flex items-center w-full gap-3 px-3 py-2 text-sm text-neutral-200 hover:bg-white/10 transition-colors duration-150 rounded-md"
        >
            <Icon name={iconName} className={`text-lg ${iconClass}`} />
            <span>{children}</span>
        </button>
    </motion.div>
);

const UserProfileWidget = () => {
    const { user, logout } = useAuth();
    const { permissions } = usePermissions();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = async () => {
        setIsMenuOpen(false);
        await logout();
        navigate('/login/business');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getMenuAccentColor = (plan) => {
        switch (plan) {
            case 'growth_accelerator': return 'border-t-blue-400';
            case 'premium_pro_suite': return 'border-t-amber-400';
            default: return 'border-t-neutral-500';
        }
    };

    const dropdownVariants = {
        hidden: { opacity: 0, scale: 0.95, y: -10 },
        visible: {
            opacity: 1, scale: 1, y: 0,
            transition: {
                type: 'spring',
                stiffness: 400,
                damping: 25,
                when: "beforeChildren",
                staggerChildren: 0.05,
            }
        },
    };

    if (!user) return null;

    return (
        <div className="relative font-montserrat" ref={menuRef}>
            <UserAvatar user={user} onClick={() => setIsMenuOpen(!isMenuOpen)} />

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className={`absolute right-0 mt-3 w-60 origin-top-right bg-black/50 dark:bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden border-t-2 ${getMenuAccentColor(permissions.subscriptionPlan)}`}
                    >
                        <div className="px-4 py-3">
                            <p className="text-sm font-semibold text-neutral-100 truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                        </div>

                        <div className="px-2 pb-2">
                            <SubscriptionBadge />
                        </div>

                        <div className="p-2 space-y-1">
                            <DropdownItem onClick={() => { navigate('/dashboard/business/settings/profile'); setIsMenuOpen(false); }} iconName="person">{sl.userProfileWidget.yourProfile || 'Your Profile'}</DropdownItem>
                            <DropdownItem onClick={() => { navigate('/dashboard/business/settings'); setIsMenuOpen(false); }} iconName="settings">{sl.userProfileWidget.settings || 'Settings'}</DropdownItem>

                            <div className="my-1 border-t border-white/10" />

                            <DropdownItem onClick={handleLogout} iconName="logout" iconClass="text-red-400">{sl.userProfileWidget.logout || 'Logout'}</DropdownItem>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

DropdownItem.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    iconName: PropTypes.string.isRequired,
    iconClass: PropTypes.string,
};

export default memo(UserProfileWidget);