import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon'; // REVIEW: Ensure this path is correct.

// NavItem is a Forwarded Ref component to allow `orderTabRefProp` to be passed to the button itself.
const NavItem = React.forwardRef(({ label, iconName, isActive, onClick, hasBadge, badgeCount }, ref) => (
    <motion.button
        ref={ref} // This ref is important for the FlyingItemAnimator target
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-2 w-1/4 relative transition-colors duration-200
                    ${isActive
                ? 'text-red-600 dark:text-red-500' // Active state color
                : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400' // Inactive state color
            }`}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
        {/* REVIEW: Icon styling, active state background. */}
        <Icon name={iconName} className={`w-6 h-6 mb-1 rounded-full ${isActive ? 'bg-red-100 dark:bg-red-500/20' : 'bg-gray-100 dark:bg-neutral-700'}`} />
        <span className={`text-xs font-medium ${isActive ? '' : 'dark:text-gray-300'}`}>{label}</span>
        {isActive && (
            // REVIEW: Active indicator animation and styling.
            <motion.div
                layoutId="activeBottomNavIndicator" // Shared layout ID for smooth transition
                className="absolute -bottom-1 h-1 w-6 bg-red-600 dark:bg-red-500 rounded-full"
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        )}
        {hasBadge && badgeCount > 0 && (
            // REVIEW: Badge animation and styling.
            <motion.span
                key={badgeCount} // Re-animate when badgeCount changes
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="absolute top-1 right-3 text-xs bg-red-600 text-white rounded-full px-1.5 py-0.5 leading-tight transform translate-x-1/2 -translate-y-1/2"
            >
                {badgeCount}
            </motion.span>
        )}
    </motion.button>
));
NavItem.displayName = 'NavItem'; // Good practice for forwarded refs

function BottomNav({ currentPage, setCurrentPage, orderItemCount, orderTabRefProp }) {
    return (
        <motion.nav
            // REVIEW: Entry animation for the nav bar itself.
            initial={{ y: 100 }} // Starts off-screen below
            animate={{ y: 0 }}   // Slides up
            transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.2 }}
            // REVIEW: Overall styling of the navigation bar (height, background, shadow, positioning, max-width, rounded corners).
            className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-neutral-800 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:border-t dark:border-neutral-700 flex justify-around items-center max-w-full sm:max-w-md md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto rounded-t-2xl md:rounded-none z-40"
        // `z-40` ensures it's above most content but potentially below modals.
        >
            <NavItem
                label="Menu"
                iconName="home" // REVIEW: Ensure "home" is a valid Material Icon name.
                isActive={currentPage === 'menu'}
                onClick={() => setCurrentPage('menu')}
            />
            <NavItem
                label="Deals"
                iconName="loyalty" // REVIEW: Ensure "loyalty" is a valid Material Icon name.
                isActive={currentPage === 'deals'}
                onClick={() => setCurrentPage('deals')}
            />
            <NavItem
                ref={orderTabRefProp} // This ref is passed from Userpage.jsx
                label="Order"
                iconName="shopping_cart" // REVIEW: Ensure "shopping_cart" is a valid Material Icon name.
                isActive={currentPage === 'order'}
                onClick={() => setCurrentPage('order')}
                hasBadge={true}
                badgeCount={orderItemCount}
            />
            <NavItem
                label="Discounts"
                iconName="flare" // REVIEW: Ensure "flare" is a valid Material Icon name.
                isActive={currentPage === 'discounts'}
                onClick={() => setCurrentPage('discounts')}
            />
        </motion.nav>
    );
}

export default BottomNav;