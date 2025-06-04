import React, { useState, useEffect, useRef, useCallback } from 'react';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import OrderSummaryPanel from '../subcomponents/OrderSummaryPanel';
import Icon from '../../../components/common/Icon.jsx';
import useWindowSize from '../../../hooks/useWindowSize.js';
// or import from a shared location.

// Styling Constants (subset relevant to this controller)
const PEEK_BAR_HEIGHT_VALUE_PX = 72; // From Userpage
const PEEK_BAR_TAILWIND_HEIGHT = "h-[72px]"; // From Userpage
const PEEK_BAR_BG = "bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"; // From Userpage (ROSE_PRIMARY_BUTTON_BG)
const PEEK_BAR_TEXT_COLOR = "text-white"; // From Userpage (BUTTON_TEXT_ON_ACCENT)
const PEEK_BAR_RADIUS = "rounded-t-2xl"; // From Userpage

const PANEL_BG_DRAWER = "bg-white dark:bg-neutral-800"; // From Userpage
const PANEL_BG_SIDEBAR_LIGHT = "bg-neutral-50 dark:bg-neutral-800/80"; // From Userpage
const PANEL_RADIUS_SIDEBAR = "rounded-xl"; // From Userpage

const NEUTRAL_BORDER_LIGHTER = "border-neutral-200 dark:border-neutral-700"; // From Userpage
const FULL_PAGE_TEXT_PRIMARY = "text-neutral-700 dark:text-neutral-200"; // From Userpage for titles
const NEUTRAL_TEXT_MUTED = "text-neutral-500 dark:text-neutral-400"; // From Userpage for placeholders / muted icons
const BODY_TEXT_MEDIUM = "text-sm"; // From Userpage for placeholder text
const FONT_INTER = "font-inter"; // From Userpage
const FONT_MONTSERRAT = "font-montserrat"; // From Userpage
const ROSE_ACCENT_RING_FOCUS = "focus:ring-rose-500 dark:focus:ring-rose-400"; // From Userpage

/**
 * Manages and renders the order summary interface, adapting for mobile (peek bar & draggable drawer)
 * and desktop (sidebar).
 *
 * @param {Array} orderItems - Current items in the order.
 * @param {object} orderFinancials - Object with { subtotal, finalTotal, totalDiscountAmount, appliedPromoUIDetails, itemLevelDiscountsMap }.
 * @param {object} venueContext - Contains businessIdentifierForAPI, tableNumber, userName, numberOfPeople.
 * @param {boolean} isDesktop - True if the current view is desktop.
 * @param {function} onUpdateQuantity - Callback to update item quantity.
 * @param {function} onConfirmOrderAction - Callback to confirm and place the order.
 * @param {object | null} promoValidationResult - Current promo validation result.
 * @param {function} setPromoValidationResult - Function to update promo validation result.
 * @param {function} navigateToMenu - Callback for mobile "Browse Menu" button.
 * @param {React.Ref} interactionAreaRef - Ref for the mobile draggable area (for flying image target).
 * @param {boolean} [shouldReduceMotion=false] - From Framer Motion's useReducedMotion.
 */
const OrderInteractionController = ({
    orderItems = [],
    orderFinancials, // { subtotal, finalTotal, ... }
    venueContext,
    isDesktop,
    onUpdateQuantity,
    onConfirmOrderAction,
    promoValidationResult,
    setPromoValidationResult, // Crucial for OrderSummaryPanel to update Userpage's state
    navigateToMenu,
    interactionAreaRef, // This ref is for the draggable motion.div on mobile
    shouldReduceMotion = false,
}) => {
    const [isDrawerOpenMobile, setIsDrawerOpenMobile] = useState(false);
    const drawerCloseButtonRef = useRef(null);
    const { height: windowHeight } = useWindowSize(); // Hook to get window dimensions

    const hasOrderItems = orderItems && orderItems.length > 0;

    // Toggle for mobile drawer
    const toggleMobileDrawer = useCallback(() => {
        if (!hasOrderItems && !isDrawerOpenMobile) return; // Don't open empty drawer unless already open
        setIsDrawerOpenMobile(prev => !prev);
    }, [hasOrderItems, isDrawerOpenMobile]);

    // Effect for focus management in mobile drawer
    useEffect(() => {
        if (!isDesktop && isDrawerOpenMobile && hasOrderItems && drawerCloseButtonRef.current) {
            const timer = setTimeout(() => drawerCloseButtonRef.current?.focus(), 150);
            return () => clearTimeout(timer);
        }
    }, [isDrawerOpenMobile, isDesktop, hasOrderItems]);

    // Effect for body scroll lock on mobile when drawer is open
    useEffect(() => {
        if (!isDesktop && isDrawerOpenMobile && hasOrderItems) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isDrawerOpenMobile, isDesktop, hasOrderItems]);


    const handleOrderDrawerDragEnd = (event, info) => {
        const { offset, velocity } = info;
        const swipeThreshold = 50; // px
        const velocityThreshold = 200; // px/s

        if (isDrawerOpenMobile) { // If open, can only drag down to peek
            if (offset.y > swipeThreshold || velocity.y > velocityThreshold) {
                setIsDrawerOpenMobile(false); // Snap to peek
            } else {
                setIsDrawerOpenMobile(true); // Snap back open
            }
        } else { // If in peek, can only drag up to open
            if (offset.y < -swipeThreshold || velocity.y < -velocityThreshold) {
                setIsDrawerOpenMobile(true); // Snap open
            } else {
                setIsDrawerOpenMobile(false); // Snap back to peek
            }
        }
    };

    // Animation variants
    const drawerTransition = shouldReduceMotion ? { duration: 0.01 } : { type: "spring", stiffness: 350, damping: 35, mass: 0.8 };
    const backdropAnimation = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
    const mobileDrawerVariants = {
        open: { y: "0%", height: "85vh", cursor: "default" },
        peek: { y: `calc(100% - ${PEEK_BAR_HEIGHT_VALUE_PX}px)`, height: `${PEEK_BAR_HEIGHT_VALUE_PX}px`, cursor: "grab" }
    };

    // --- Desktop Rendering ---
    if (isDesktop) {
        if (!venueContext) return null; // Should not happen if Userpage orchestrates correctly

        return (
            <aside ref={interactionAreaRef} className="lg:w-80 xl:w-96 p-4 lg:pl-0 shrink-0" role="complementary" aria-labelledby="desktop-order-summary-title">
                <h2 id="desktop-order-summary-title" className="sr-only">Order Summary</h2>
                {hasOrderItems ? (
                    <OrderSummaryPanel
                        orderItems={orderItems}
                        onUpdateQuantity={onUpdateQuantity}
                        onConfirmOrderAction={onConfirmOrderAction}
                        isSidebarVersion={true}
                        venueContext={venueContext}
                        hidePanelTitle={false}
                        // Pass financials and promo state
                        subtotal={orderFinancials.subtotal}
                        totalDiscountAmount={orderFinancials.totalDiscountAmount}
                        finalTotal={orderFinancials.finalTotal}
                        appliedPromoUIDetails={orderFinancials.appliedPromoUIDetails}
                        itemLevelDiscountsMap={orderFinancials.itemLevelDiscountsMap}
                        promoValidationResult={promoValidationResult}
                        setPromoValidationResult={setPromoValidationResult}
                    />
                ) : (
                    <div className={`h-full flex items-center justify-center ${PANEL_BG_SIDEBAR_LIGHT} ${FULL_PAGE_TEXT_PRIMARY} shadow-xl ${PANEL_RADIUS_SIDEBAR} p-6 text-center`}>
                        <p className={`${NEUTRAL_TEXT_MUTED} ${BODY_TEXT_MEDIUM}`}>Your order summary will appear here once you add items.</p>
                    </div>
                )}
            </aside>
        );
    }

    // --- Mobile Rendering ---
    if (!hasOrderItems) { // If no items on mobile, render nothing for order area
        return null;
    }

    return (
        <>
            <AnimatePresence>
                {isDrawerOpenMobile && ( // Backdrop only for full drawer
                    <motion.div
                        key="order-drawer-backdrop-oic" // Unique key
                        className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm z-45" // Ensure z-index is below drawer
                        variants={backdropAnimation}
                        initial="initial" animate="animate" exit="exit"
                        transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 0.3, ease: "circOut" }}
                        onClick={toggleMobileDrawer}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>
            <motion.div
                key="mobile-order-interaction-area-oic" // Unique key
                ref={interactionAreaRef} // Parent (Userpage) passes this ref
                className={`fixed left-0 right-0 bottom-0 z-50 ${PEEK_BAR_RADIUS} ${isDrawerOpenMobile ? PANEL_BG_DRAWER : PEEK_BAR_BG} shadow-2xl flex flex-col`}
                drag="y"
                dragConstraints={{ top: 0, bottom: Math.max(0, windowHeight - PEEK_BAR_HEIGHT_VALUE_PX) }}
                dragElastic={0.2}
                onDragEnd={handleOrderDrawerDragEnd}
                animate={isDrawerOpenMobile ? "open" : "peek"}
                variants={mobileDrawerVariants}
                transition={drawerTransition}
                // onTap removed to prevent conflict with drag; click on peek content will handle open
                role={isDrawerOpenMobile ? "dialog" : "button"} // Role changes based on state
                aria-modal={isDrawerOpenMobile ? "true" : undefined}
                aria-labelledby={isDrawerOpenMobile ? "order-drawer-title-mobile-oic" : "peek-bar-label-oic"}
                aria-expanded={isDrawerOpenMobile}
            >
                {isDrawerOpenMobile ? (
                    <>
                        {/* Drawer Header */}
                        <div className={`p-3 flex justify-between items-center border-b ${NEUTRAL_BORDER_LIGHTER} shrink-0`}>
                            <h3 id="order-drawer-title-mobile-oic" className={`text-lg font-semibold ${FONT_MONTSERRAT} ${FULL_PAGE_TEXT_PRIMARY} pl-2`}>
                                Your Order
                            </h3>
                            <button
                                ref={drawerCloseButtonRef}
                                onClick={toggleMobileDrawer}
                                className={`p-1.5 rounded-full ${NEUTRAL_TEXT_MUTED} hover:text-neutral-700 dark:hover:text-neutral-200 focus:outline-none focus:ring-2 ${ROSE_ACCENT_RING_FOCUS} transition-colors`}
                                aria-label="Close order summary"
                            >
                                <Icon name="close" className="w-6 h-6" />
                            </button>
                        </div>
                        {/* Scrollable Drawer Content */}
                        <div className="flex-1 overflow-y-auto">
                            <OrderSummaryPanel
                                orderItems={orderItems}
                                onUpdateQuantity={onUpdateQuantity}
                                onConfirmOrderAction={onConfirmOrderAction}
                                isSidebarVersion={false}
                                venueContext={venueContext}
                                navigateToMenu={navigateToMenu} // Pass down for "Browse Menu" button
                                hidePanelTitle={true} // Title is in drawer header
                                // Pass financials and promo state
                                subtotal={orderFinancials.subtotal}
                                totalDiscountAmount={orderFinancials.totalDiscountAmount}
                                finalTotal={orderFinancials.finalTotal}
                                appliedPromoUIDetails={orderFinancials.appliedPromoUIDetails}
                                itemLevelDiscountsMap={orderFinancials.itemLevelDiscountsMap}
                                promoValidationResult={promoValidationResult}
                                setPromoValidationResult={setPromoValidationResult}
                            />
                        </div>
                    </>
                ) : (
                    // Peek Bar Content
                    <div
                        id="peek-bar-label-oic"
                        className={`flex items-center justify-between p-4 ${PEEK_BAR_TAILWIND_HEIGHT} ${PEEK_BAR_TEXT_COLOR} w-full h-full cursor-pointer`}
                        onClick={toggleMobileDrawer} // Open drawer on click
                    >
                        <span className={`${FONT_INTER} font-medium`}>
                            View Your Order ({orderItems.reduce((sum, item) => sum + item.quantity, 0)} items)
                        </span>
                        <span className={`${FONT_MONTSERRAT} font-bold text-lg`}>
                            ${orderFinancials.finalTotal?.toFixed(2) || '0.00'}
                        </span>
                    </div>
                )}
            </motion.div>
        </>
    );
};

export default OrderInteractionController;