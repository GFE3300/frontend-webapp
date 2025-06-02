// frontend/src/features/menu_view/subcomponents/BottomNav.jsx

import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon';

const NavItem = React.memo(React.forwardRef(
    ({ label, iconName, onClick, hasBadge, badgeCount, itemKey, isTabActive }, ref) => ( // isTabActive now directly controls active style
    <motion.button
        ref={ref}
        key={itemKey}
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-2 w-1/4 h-full relative transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500 rounded-t-lg
                    ${isTabActive // Use isTabActive for styling
                ? 'text-rose-600 dark:text-rose-400' // Active tab color from guidelines
                : 'text-neutral-500 dark:text-neutral-400 hover:text-rose-500 dark:hover:text-rose-300'
            }`}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        aria-pressed={isTabActive}
        aria-label={label}
    >
        {/* Icon wrapper for consistent badge positioning and active bg */}
        <div className={`relative p-1 rounded-full transition-colors duration-150 ${isTabActive ? 'bg-rose-100 dark:bg-rose-500/20' : ''}`}>
            <Icon name={iconName} className="w-5 h-5 sm:w-6 sm:h-6" /> {/* Icon Size: Medium (Guidelines 6.7) */}
            {hasBadge && badgeCount > 0 && (
                <motion.span
                    key={`badge-${badgeCount}-${itemKey}`} // Ensure unique key for badge animation
                    initial={{ scale: 0.3, opacity: 0, y: 5 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.3, opacity: 0, y: 5 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20, duration: 0.2 }}
                    className="absolute -top-1 -right-1 text-[10px] sm:text-xs bg-red-600 dark:bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-tight font-medium"
                    aria-live="polite"
                >
                    {badgeCount}
                </motion.span>
            )}
        </div>
        {/* Text Label: Body Extra Small (Guidelines 2.2) */}
        <span className={`text-[10px] sm:text-xs font-medium mt-0.5 ${isTabActive ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-600 dark:text-neutral-300'}`}>
            {label}
        </span>
        {/* Active Indicator (Guidelines 6.8 Segmented Controls - active state line) */}
        {isTabActive && (
            <motion.div
                layoutId="activeBottomNavIndicatorCustomerMenu" // Shared layoutId for smooth transition
                className="absolute bottom-0 h-[3px] w-8 bg-rose-600 dark:bg-rose-400 rounded-full"
                initial={false} // No initial animation for the indicator itself if already active
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        )}
    </motion.button>
)));
NavItem.displayName = 'NavItem';

/**
 * Bottom navigation bar for mobile view.
 * @param {object} props
 * @param {string} props.currentPage - The currently active page/tab name for non-order tabs.
 * @param {function} props.setCurrentPage - Callback to set the active page: (pageName: string) => void.
 * @param {boolean} props.isOrderDrawerOpen - Indicates if the order drawer is open.
 * @param {function} props.onToggleOrderDrawer - Callback to toggle the order drawer.
 * @param {number} props.orderItemCount - Number of items in the order, for the badge.
 * @param {React.RefObject} props.orderTabRefProp - Ref for the "Order" tab, useful for focusing.
 */
function BottomNav({
    currentPage,
    setCurrentPage,
    isOrderDrawerOpen,
    onToggleOrderDrawer,
    orderItemCount,
    orderTabRefProp // Forwarded ref for the "Order" tab button
}) {
    const navItems = [
        { key: 'menu', label: 'Menu', icon: 'restaurant_menu' },
        { key: 'deals', label: 'Deals', icon: 'loyalty' }, // Example, can be 'notifications' or other
        { key: 'order', label: 'Order', icon: 'shopping_cart', hasBadge: true },
        { key: 'account', label: 'Account', icon: 'person' }, // Example
    ];

    return (
        <motion.nav
            initial={{ y: 80 }} // Start off-screen
            animate={{ y: 0 }}   // Animate to on-screen
            transition={{ type: "spring", stiffness: 150, damping: 25, delay: 0.1 }}
            // Styling based on Guidelines 6.5 Navigation Bars (Bottom Nav)
            className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] flex justify-around items-stretch z-40"
            // z-index 40 is below drawer backdrop (z-45) and drawer content (z-50)
        >
            {navItems.map((item) => {
                // Determine if the current tab is active. For "Order", it's based on isOrderDrawerOpen.
                const isCurrentTabActive = item.key === 'order' ? isOrderDrawerOpen : currentPage === item.key;
                // Determine the click handler. For "Order", it toggles the drawer.
                const handleClick = item.key === 'order' ? onToggleOrderDrawer : () => setCurrentPage(item.key);

                return (
                    <NavItem
                        ref={item.key === 'order' ? orderTabRefProp : null} // Assign ref to the "Order" tab
                        key={item.key}
                        itemKey={item.key}
                        label={item.label}
                        iconName={item.icon}
                        isTabActive={isCurrentTabActive} // This prop now directly controls active styling
                        onClick={handleClick}
                        hasBadge={item.hasBadge}
                        badgeCount={item.key === 'order' ? orderItemCount : 0}
                    />
                );
            })}
        </motion.nav>
    );
}

export default BottomNav;