import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon';

// --- Styling Constants ---
const NAV_BG = "bg-white dark:bg-neutral-800";
const NAV_BORDER = "border-neutral-200 dark:border-neutral-700";
const ITEM_ACTIVE_TEXT = "text-rose-600 dark:text-rose-400";
const ITEM_INACTIVE_TEXT = "text-neutral-500 dark:text-neutral-400";
const ITEM_HOVER_TEXT = "hover:text-rose-500 dark:hover:text-rose-300";
const ITEM_ACTIVE_ICON_BG = "bg-rose-100 dark:bg-rose-500/20";
const ITEM_ACTIVE_INDICATOR_BG = "bg-rose-600 dark:bg-rose-400";
const FONT_INTER = "font-inter";
const LABEL_TEXT_SIZE = "text-xs";
const LABEL_FONT_WEIGHT = "font-medium";
const ICON_SIZE = "w-5 h-5 sm:w-6 sm:h-6";
const NAV_SHADOW = "shadow-[0_-2px_10px_rgba(0,0,0,0.08)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)]";
const NAV_HEIGHT = "h-16";
const ITEM_PADDING = "p-2";
const ITEM_FOCUS_RING_RADIUS = "rounded-t-lg";
const ICON_BG_RADIUS = "rounded-full";
const INDICATOR_RADIUS = "rounded-full";

const NavItem = React.memo(React.forwardRef(
    ({ label, iconName, onClick, itemKey, isTabActive }, ref) => (
        <motion.button
            ref={ref}
            key={itemKey}
            onClick={onClick}
            className={`flex flex-col items-center justify-center ${ITEM_PADDING} w-1/2 h-full relative transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500 ${ITEM_FOCUS_RING_RADIUS}
                    ${isTabActive
                    ? ITEM_ACTIVE_TEXT
                    : `${ITEM_INACTIVE_TEXT} ${ITEM_HOVER_TEXT}`
                } ${FONT_INTER}`}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            aria-pressed={isTabActive}
            aria-label={label}
        >
            <div className={`relative p-1 ${ICON_BG_RADIUS} transition-colors duration-150 ${isTabActive ? ITEM_ACTIVE_ICON_BG : ''}`}>
                <Icon name={iconName} className={ICON_SIZE} style={{ fontSize: "1.25rem" }} />
            </div>
            <span className={`${LABEL_TEXT_SIZE} ${LABEL_FONT_WEIGHT} mt-0.5 ${isTabActive ? ITEM_ACTIVE_TEXT : ITEM_INACTIVE_TEXT}`}>
                {label}
            </span>
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
    onOpenSettingsModal, // MODIFIED: Changed prop name for clarity
}) {
    // MODIFIED: navItems array is updated
    const navItems = [
        { key: 'menu', label: 'Menu', icon: 'restaurant_menu' },
        { key: 'profile', label: 'My Info', icon: 'badge' },
    ];

    const navBarAnimation = {
        initial: { y: "100%" },
        animate: { y: "0%" },
        transition: { type: "spring", stiffness: 150, damping: 25, delay: 0.1, duration: 0.3 }
    };

    return (
        <motion.nav
            variants={navBarAnimation}
            initial="initial"
            animate="animate"
            className={`lg:hidden fixed bottom-0 left-0 right-0 ${NAV_HEIGHT} ${NAV_BG} border-t ${NAV_BORDER} ${NAV_SHADOW} flex justify-around items-stretch z-40`}
            role="navigation"
            aria-label="Main bottom navigation"
        >
            {navItems.map((item) => {
                // MODIFIED: Logic for active state and onClick handler
                const isCurrentTabActive = item.key === 'menu' && currentPage === 'menu';

                let handleClick;
                if (item.key === 'menu') {
                    // This button navigates to the 'menu' page state.
                    handleClick = () => setCurrentPage('menu');
                } else if (item.key === 'profile') {
                    // This button opens the settings modal.
                    handleClick = onOpenSettingsModal;
                }

                return (
                    <NavItem
                        key={item.key}
                        itemKey={item.key}
                        label={item.label}
                        iconName={item.icon}
                        isTabActive={isCurrentTabActive}
                        onClick={handleClick}
                    />
                );
            })}
        </motion.nav>
    );
}

export default BottomNav;