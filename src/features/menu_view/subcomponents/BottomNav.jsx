// frontend/src/features/menu_view/subcomponents/BottomNav.jsx

import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon';

// Color Palette (Guideline 2.1)
const NAV_BG = "bg-white dark:bg-neutral-800"; // Matches Header bg
const NAV_BORDER = "border-neutral-200 dark:border-neutral-700"; // Matches Header shadow substitute

const ITEM_ACTIVE_TEXT = "text-rose-600 dark:text-rose-400"; // Primary accent for active
const ITEM_INACTIVE_TEXT = "text-neutral-500 dark:text-neutral-400";
const ITEM_HOVER_TEXT = "hover:text-rose-500 dark:hover:text-rose-300";

const ITEM_ACTIVE_ICON_BG = "bg-rose-100 dark:bg-rose-500/20"; // Subtle bg for active icon
const ITEM_ACTIVE_INDICATOR_BG = "bg-rose-600 dark:bg-rose-400"; // Rose accent for indicator line

const BADGE_BG = "bg-red-600 dark:bg-red-500"; // Semantic error/urgent red for notification-like badge
const BADGE_TEXT = "text-white";

// Typography (Guideline 2.2)
const FONT_INTER = "font-inter";
const LABEL_TEXT_SIZE = "text-xs"; // Body Extra Small (12px)
const LABEL_FONT_WEIGHT = "font-medium"; // Inter Medium

// Iconography (Guideline 2.3)
const ICON_SIZE = "w-5 h-5 sm:w-6 sm:h-6"; // Medium icon size

// Shadows & Elevation (Guideline 2.5) - Using shadow similar to Header
const NAV_SHADOW = "shadow-[0_-2px_10px_rgba(0,0,0,0.08)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)]";

// Spacing (Guideline 3.2) - Based on Tailwind
const NAV_HEIGHT = "h-16"; // 64px
const ITEM_PADDING = "p-2"; // 8px

// Corner Radii (Guideline 2.6)
const ITEM_FOCUS_RING_RADIUS = "rounded-t-lg"; // For focus on entire item
const ICON_BG_RADIUS = "rounded-full";
const INDICATOR_RADIUS = "rounded-full";
const BADGE_RADIUS = "rounded-full";

// ForwardRef for NavItem to allow ref to be passed to motion.button
const NavItem = React.memo(React.forwardRef(
    ({ label, iconName, onClick, hasBadge, badgeCount, itemKey, isTabActive }, ref) => (
        <motion.button
            ref={ref}
            key={itemKey}
            onClick={onClick}
            className={`flex flex-col items-center justify-center ${ITEM_PADDING} w-1/4 h-full relative transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500 ${ITEM_FOCUS_RING_RADIUS}
                    ${isTabActive
                    ? ITEM_ACTIVE_TEXT
                    : `${ITEM_INACTIVE_TEXT} ${ITEM_HOVER_TEXT}`
                } ${FONT_INTER}`}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            aria-pressed={isTabActive} // Guideline 7: ARIA
            aria-label={label}
        >
            {/* Icon wrapper (Guideline 2.3 Icon Sizing) */}
            <div className={`relative p-1 ${ICON_BG_RADIUS} transition-colors duration-150 ${isTabActive ? ITEM_ACTIVE_ICON_BG : ''}`}>
                <Icon name={iconName} className={ICON_SIZE} />
                {hasBadge && badgeCount > 0 && (
                    <motion.span
                        key={`badge-${badgeCount}-${itemKey}`}
                        initial={{ scale: 0.3, opacity: 0, y: 5 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.3, opacity: 0, y: 5 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20, duration: 0.2 }}
                        className={`absolute -top-1 -right-1 ${LABEL_TEXT_SIZE} ${BADGE_BG} ${BADGE_TEXT} ${BADGE_RADIUS} px-1.5 py-0.5 leading-tight ${LABEL_FONT_WEIGHT}`} // Guideline 6.10 Tags/Pills (styling for badge)
                        aria-live="polite" // Guideline 7: ARIA for dynamic content
                        aria-label={`${badgeCount} items in order`}
                    >
                        {badgeCount}
                    </motion.span>
                )}
            </div>
            {/* Text Label (Guideline 2.2 Typography Body Extra Small, Inter Medium) */}
            <span className={`${LABEL_TEXT_SIZE} ${LABEL_FONT_WEIGHT} mt-0.5 ${isTabActive ? ITEM_ACTIVE_TEXT : ITEM_INACTIVE_TEXT}`}>
                {label}
            </span>
            {/* Active Indicator (Guideline 6.7 Tabs - active state style) */}
            {isTabActive && (
                <motion.div
                    layoutId="activeBottomNavIndicatorCustomerMenu"
                    className={`absolute bottom-0 h-[3px] w-8 ${ITEM_ACTIVE_INDICATOR_BG} ${INDICATOR_RADIUS}`}
                    initial={false}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}
        </motion.button>
    )));
NavItem.displayName = 'NavItem';

function BottomNav({
    currentPage,
    setCurrentPage,
    isOrderDrawerOpen,
    onToggleOrderDrawer,
    orderItemCount,
    orderTabRefProp
}) {
    const navItems = [
        { key: 'menu', label: 'Menu', icon: 'restaurant_menu' },
        { key: 'deals', label: 'Deals', icon: 'loyalty' },
        { key: 'order', label: 'Order', icon: 'shopping_cart', hasBadge: true },
        { key: 'account', label: 'Account', icon: 'person' },
    ];

    // Animation for nav bar entry (Guideline 4.3 Component Enter/Exit)
    const navBarAnimation = {
        initial: { y: "100%" }, // Start off-screen from bottom
        animate: { y: "0%" },   // Animate to on-screen
        transition: { type: "spring", stiffness: 150, damping: 25, delay: 0.1, duration: 0.3 } // Quick & subtle
    };

    return (
        <motion.nav
            variants={navBarAnimation}
            initial="initial"
            animate="animate"
            // Styling based on Guidelines (6.7 Navigation Bars, 2.1 Colors, 2.5 Shadows, 3.2 Spacing)
            className={`lg:hidden fixed bottom-0 left-0 right-0 ${NAV_HEIGHT} ${NAV_BG} border-t ${NAV_BORDER} ${NAV_SHADOW} flex justify-around items-stretch z-40`}
            role="navigation" // Guideline 7: Semantic HTML/ARIA
            aria-label="Main bottom navigation"
        >
            {navItems.map((item) => {
                const isCurrentTabActive = item.key === 'order' ? isOrderDrawerOpen : currentPage === item.key;
                const handleClick = item.key === 'order' ? onToggleOrderDrawer : () => setCurrentPage(item.key);

                return (
                    <NavItem
                        ref={item.key === 'order' ? orderTabRefProp : null}
                        key={item.key}
                        itemKey={item.key}
                        label={item.label}
                        iconName={item.icon}
                        isTabActive={isCurrentTabActive}
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