import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

import { useAuth } from '../../../contexts/AuthContext';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../contexts/ToastContext';
import apiService from '../../../services/api';
import Icon from '../../../components/common/Icon';

// --- Reusable Animated Dropdown Item ---
const DropdownItem = ({ children, onClick, iconName, iconClass = '' }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, x: -15 },
            visible: { opacity: 1, x: 0 },
        }}
    >
        <button
            onClick={onClick}
            className="flex items-center w-full gap-3 px-4 py-2 text-sm text-neutral-200 hover:bg-white/10 transition-colors duration-150 rounded-md"
        >
            <Icon name={iconName} className={`text-lg ${iconClass}`} />
            <span>{children}</span>
        </button>
    </motion.div>
);

// --- User Profile Avatar (remains the same) ---
const UserProfileAvatar = memo(() => {
    const { user } = useAuth();
    const { permissions } = usePermissions();

    const getGlowColor = (plan) => {
        switch (plan) {
            case 'growth_accelerator': return 'shadow-[0_0_15px_rgba(59,130,246,0.5)]';
            case 'premium_pro_suite': return 'shadow-[0_0_15px_rgba(251,191,36,0.6)]';
            default: return 'shadow-md shadow-black/30';
        }
    };

    return (
        <motion.div
            className={`relative w-10 h-10 rounded-full ${getGlowColor(permissions.subscriptionPlan)}`}
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <AnimatePresence>
                {permissions.subscriptionPlan === 'premium_pro_suite' && (
                    <motion.div
                        className="absolute inset-0 border-2 border-amber-300 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    />
                )}
            </AnimatePresence>
            <div className="absolute inset-0.5 bg-gradient-to-br from-primary-500 to-rose-600 rounded-full flex items-center justify-center text-white font-semibold text-base">
                {user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </div>
        </motion.div>
    );
});
UserProfileAvatar.displayName = 'UserProfileAvatar';


const UserProfileWidget = () => {
    const { user } = useAuth();
    const { permissions } = usePermissions();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = async () => {
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

    const handleManageSubscriptionClick = useCallback(async () => {
        setIsMenuOpen(false);
        addToast("Redirecting...", "info");
        try {
            const response = await apiService.createCustomerPortalSession();
            window.location.href = response.data.url;
        } catch (err) {
            addToast("Error accessing subscription portal.", "error");
        }
    }, [addToast]);

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
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 text-left group"
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
            >
                <div className="hidden md:block text-right">
                    <p className="font-semibold text-sm text-neutral-700 dark:text-neutral-200 transition-colors group-hover:text-white group-hover:dark:text-neutral-100">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-0.5 transition-colors group-hover:text-neutral-200 group-hover:dark:text-neutral-300">{user.role}</p>
                </div>
                <UserProfileAvatar />
            </button>

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
                        <div className="p-2 space-y-1">
                            <DropdownItem onClick={() => { navigate('/dashboard/business/settings/profile'); setIsMenuOpen(false); }} iconName="person" >Your Profile</DropdownItem>
                            <DropdownItem onClick={handleManageSubscriptionClick} iconName="credit_card">Manage Subscription</DropdownItem>
                            <DropdownItem onClick={handleLogout} iconName="logout" iconClass="text-red-400">Logout</DropdownItem>
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

export default UserProfileWidget;