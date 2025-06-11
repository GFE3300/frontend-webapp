import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { usePermissions } from '../../../hooks/usePermissions'; // Import usePermissions

/**
 * The "Living Insignia" component.
 * A dynamic, context-aware user avatar that subtly communicates subscription status
 * through color and ambient animation. It now displays the user's profile image or initial.
 */
const UserAvatar = ({ user, onClick }) => {
    // Get permissions which includes the subscription plan
    const { permissions } = usePermissions();
    const subscriptionPlan = permissions.subscriptionPlan;

    const { color, isPremium } = useMemo(() => {
        switch (subscriptionPlan) {
            case 'premium_pro_suite':
                return { color: '#F59E0B', isPremium: true }; // amber-500
            case 'growth_accelerator':
                return { color: '#3B82F6', isPremium: false }; // blue-500
            case 'trialing':
                return { color: '#14B8A6', isPremium: false }; // teal-500
            default: // starter_essentials or null
                return { color: '#6B7280', isPremium: false }; // gray-500
        }
    }, [subscriptionPlan]);

    const initial = user?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-10 h-10 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
            style={{
                // Base shadow that can be transitioned
                boxShadow: `0 0 0 2px ${color}, 0 0 0px 0px ${color}`,
            }}
            animate={{
                boxShadow: `0 0 0 2px ${color}, 0 0 10px 0px ${color}`,
                transition: {
                    boxShadow: {
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: 'mirror',
                        ease: 'easeInOut'
                    }
                }
            }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            {/* Layer 1: Animated Gradient Background (for premium) */}
            {isPremium && (
                <motion.div
                    className="absolute inset-0 w-full h-full rounded-full overflow-hidden"
                    style={{
                        background: `conic-gradient(from 0deg, #F59E0B, #FBBF24, #FCD34D, #FBBF24, #F59E0B)`,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                />
            )}

            {/* Layer 2: Profile Picture or Initial */}
            <div className="relative w-full h-full rounded-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                {user && user.profile_image_url ? (
                    <img
                        src={user.profile_image_url}
                        alt="User profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                        {initial}
                    </span>
                )}
            </div>
        </motion.button>
    );
};

UserAvatar.propTypes = {
    user: PropTypes.shape({
        firstName: PropTypes.string,
        email: PropTypes.string,
        profile_image_url: PropTypes.string, // Expect this prop now
    }),
    onClick: PropTypes.func.isRequired,
};

export default UserAvatar;