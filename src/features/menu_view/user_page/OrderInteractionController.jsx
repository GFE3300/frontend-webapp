import React, { useState, useEffect, useRef, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import OrderSummaryPanel from '../subcomponents/OrderSummaryPanel';
import Icon from '../../../components/common/Icon.jsx';
import useWindowSize from '../../../hooks/useWindowSize.js';
import { useCurrency } from '../../../hooks/useCurrency';
import i18n from '../../../i18n.js';
import { scriptLines_menu_view as sl } from '../utils/script_lines.js'; // LOCALIZATION

const PEEK_BAR_HEIGHT_VALUE_PX = 72;
const PEEK_BAR_TAILWIND_HEIGHT = "h-[72px]";
const PEEK_BAR_BG = "bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600";
const PEEK_BAR_TEXT_COLOR = "text-white";
const PEEK_BAR_RADIUS = "rounded-t-2xl";

const PANEL_BG_DRAWER = "bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm";
const PANEL_BG_SIDEBAR_LIGHT = "bg-neutral-50 dark:bg-neutral-800/80";
const PANEL_RADIUS_SIDEBAR = "rounded-xl";

const NEUTRAL_BORDER_LIGHTER = "border-neutral-200 dark:border-neutral-700";
const DRAWER_TITLE_TEXT_COLOR = "text-neutral-800 dark:text-neutral-100";
const NEUTRAL_TEXT_MUTED = "text-neutral-500 dark:text-neutral-400";
const BODY_TEXT_MEDIUM = "text-sm";
const FONT_INTER = "font-inter";
const FONT_MONTSERRAT = "font-montserrat";
const ROSE_ACCENT_RING_FOCUS = "focus-visible:ring-2 focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800";

const DRAWER_OPEN_MAX_HEIGHT_VH = 85;
const BACKDROP_BG = "bg-black/60 dark:bg-black/70 backdrop-blur-sm";
const DRAG_HANDLE_BG = "bg-neutral-300 dark:bg-neutral-500";

const DRAG_SWIPE_THRESHOLD_VH_PERCENT = 30;
const DRAG_VELOCITY_THRESHOLD = 200;

const DragHandle = ({ className = "" }) => (
    <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 ${DRAG_HANDLE_BG} rounded-full ${className}`} aria-hidden="true" />
);

const OrderInteractionController = ({
    orderItems = [],
    orderFinancials,
    venueContext,
    isDesktop,
    onUpdateQuantity,
    onConfirmOrderAction,
    onPromoValidationChange,
    navigateToMenu,
    interactionAreaRef,
}) => {
    const [isDrawerOpenMobile, setIsDrawerOpenMobile] = useState(false);
    const drawerCloseButtonRef = useRef(null);
    const peekBarTriggerRef = useRef(null);
    const { height: windowHeight } = useWindowSize();
    const shouldReduceMotion = useReducedMotion();
    const { formatCurrency } = useCurrency();

    const hasOrderItems = orderItems && orderItems.length > 0;

    const toggleMobileDrawer = useCallback(() => {
        if (!hasOrderItems && !isDrawerOpenMobile) return;
        setIsDrawerOpenMobile(prev => !prev);
    }, [hasOrderItems, isDrawerOpenMobile]);

    useEffect(() => {
        if (!isDesktop && hasOrderItems) {
            if (isDrawerOpenMobile && drawerCloseButtonRef.current) {
                const timer = setTimeout(() => drawerCloseButtonRef.current?.focus(), 150);
                return () => clearTimeout(timer);
            }
        }
    }, [isDrawerOpenMobile, isDesktop, hasOrderItems]);

    useEffect(() => {
        if (!isDesktop && isDrawerOpenMobile) {
            const handleKeyDown = (event) => {
                if (event.key === 'Escape') toggleMobileDrawer();
            };
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isDrawerOpenMobile, isDesktop, toggleMobileDrawer]);

    useEffect(() => {
        if (interactionAreaRef && interactionAreaRef.current) {
            interactionAreaRef.current.setAttribute('data-drawer-state', isDrawerOpenMobile ? 'open' : 'closed');
        }
    }, [isDrawerOpenMobile, interactionAreaRef]);

    useEffect(() => {
        if (!isDesktop && isDrawerOpenMobile && hasOrderItems) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isDrawerOpenMobile, isDesktop, hasOrderItems]);

    const handleOrderDrawerDragEnd = (event, info) => {
        if (shouldReduceMotion) return;
        const { offset, velocity } = info;
        const openDrawerHeightPx = windowHeight * (DRAWER_OPEN_MAX_HEIGHT_VH / 100);
        const dragThresholdPx = openDrawerHeightPx * (DRAG_SWIPE_THRESHOLD_VH_PERCENT / 100);

        if (isDrawerOpenMobile) {
            if (offset.y > dragThresholdPx || velocity.y > DRAG_VELOCITY_THRESHOLD) setIsDrawerOpenMobile(false);
        } else {
            if (offset.y < -dragThresholdPx || velocity.y < -DRAG_VELOCITY_THRESHOLD) setIsDrawerOpenMobile(true);
        }
    };

    const drawerTransition = shouldReduceMotion
        ? { duration: 0.01 }
        : { type: "spring", stiffness: 380, damping: 32, mass: 0.9 };

    const backdropAnimationVariants = shouldReduceMotion
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.01 } }
        : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.3, ease: "circOut" } };

    const openDrawerActualHeight = `${DRAWER_OPEN_MAX_HEIGHT_VH}vh`;
    const mobileDrawerVariants = {
        open: { y: 0, height: openDrawerActualHeight },
        peek: { y: `calc(${openDrawerActualHeight} - ${PEEK_BAR_HEIGHT_VALUE_PX}px)`, height: openDrawerActualHeight }
    };

    const peekBarTotalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    // CORRECTED: Pass the script line object to i18n.t
    const peekBarItemsText = i18n.t(sl.orderInteractionController.peekBar.item, { count: peekBarTotalItems });

    const peekBarAriaLabel = `${sl.orderInteractionController.peekBar.title || 'View your order'}. ${peekBarItemsText}. Total ${formatCurrency(orderFinancials?.finalTotal || 0)}. ${hasOrderItems ? "Tap or drag to expand." : ""}`;

    if (isDesktop) {
        if (!venueContext) return null;
        return (
            <aside ref={interactionAreaRef} className="lg:w-80 xl:w-96 p-4 lg:pl-0 shrink-0" role="complementary" aria-labelledby="desktop-order-summary-title">
                <h2 id="desktop-order-summary-title" className="sr-only">Order Summary</h2>
                {hasOrderItems ? (
                    <OrderSummaryPanel
                        orderItems={orderItems}
                        orderFinancials={orderFinancials}
                        onUpdateQuantity={onUpdateQuantity}
                        onConfirmOrderAction={onConfirmOrderAction}
                        onPromoValidationChange={onPromoValidationChange}
                        isSidebarVersion={true}
                        venueContext={venueContext}
                        hidePanelTitle={false}
                    />
                ) : (
                    <div className={`h-full flex items-center justify-center ${PANEL_BG_SIDEBAR_LIGHT} ${DRAWER_TITLE_TEXT_COLOR} shadow-xl ${PANEL_RADIUS_SIDEBAR} p-6 text-center ${FONT_INTER}`}>
                        <p className={`${NEUTRAL_TEXT_MUTED} ${BODY_TEXT_MEDIUM}`}>{sl.orderInteractionController.desktopEmptyMessage || "Your order summary will appear here once you add items."}</p>
                    </div>
                )}
            </aside>
        );
    }

    if (!hasOrderItems) {
        return <div ref={interactionAreaRef} data-drawer-state="closed" />;
    }

    return (
        <>
            <AnimatePresence>
                {isDrawerOpenMobile && (
                    <motion.div
                        key="order-drawer-backdrop-oic"
                        className={`fixed inset-0 ${BACKDROP_BG} z-40`}
                        variants={backdropAnimationVariants}
                        initial="initial" animate="animate" exit="exit"
                        onClick={toggleMobileDrawer}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>
            <motion.div
                key="mobile-order-interaction-area-oic"
                ref={interactionAreaRef}
                className={`fixed left-0 right-0 bottom-0 z-50 ${PEEK_BAR_RADIUS} ${isDrawerOpenMobile ? PANEL_BG_DRAWER : PEEK_BAR_BG} shadow-2xl flex flex-col`}
                drag={!shouldReduceMotion && hasOrderItems ? "y" : false}
                dragConstraints={{ top: 0, bottom: parseFloat(mobileDrawerVariants.peek.y.match(/[\d.-]+/)[0]) }}
                dragElastic={0.2}
                dragSnapToOrigin={false}
                onDragEnd={handleOrderDrawerDragEnd}
                animate={isDrawerOpenMobile ? "open" : "peek"}
                variants={mobileDrawerVariants}
                transition={drawerTransition}
                role={isDrawerOpenMobile ? "dialog" : undefined}
                aria-modal={isDrawerOpenMobile ? "true" : undefined}
                aria-labelledby={isDrawerOpenMobile ? "order-drawer-title-mobile-oic" : undefined}
                aria-expanded={isDrawerOpenMobile}
                style={{ cursor: (hasOrderItems && !isDrawerOpenMobile && !shouldReduceMotion) ? "grab" : "default" }}
                onDragStart={() => { if (hasOrderItems && !isDrawerOpenMobile && !shouldReduceMotion && interactionAreaRef.current) interactionAreaRef.current.style.cursor = "grabbing"; }}
                onDragTransitionEnd={() => { if (interactionAreaRef.current) interactionAreaRef.current.style.cursor = (hasOrderItems && !isDrawerOpenMobile && !shouldReduceMotion) ? "grab" : "default"; }}
            >
                <motion.div
                    ref={peekBarTriggerRef}
                    className={`flex font-montserrat items-center justify-between p-4 ${PEEK_BAR_TAILWIND_HEIGHT} ${PEEK_BAR_TEXT_COLOR} w-full shrink-0 
                                ${hasOrderItems ? 'cursor-pointer' : 'cursor-default'} 
                                ${isDrawerOpenMobile ? 'hidden' : 'flex'} transition-opacity duration-100`}
                    onClick={hasOrderItems ? toggleMobileDrawer : undefined}
                    tabIndex={hasOrderItems && !isDrawerOpenMobile ? 0 : -1}
                    role={hasOrderItems && !isDrawerOpenMobile ? "button" : undefined}
                    onKeyDown={(e) => { if (hasOrderItems && !isDrawerOpenMobile && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleMobileDrawer(); } }}
                    aria-label={peekBarAriaLabel}
                    aria-expanded="false"
                >
                    <DragHandle className={PEEK_BAR_BG === "bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600" ? "bg-rose-300 dark:bg-rose-300" : DRAG_HANDLE_BG} />
                    <span className={`${FONT_INTER} font-medium text-sm`}>
                        {sl.orderInteractionController.peekBar.title || "View Your Order"} {peekBarItemsText}
                    </span>
                    <span className={`${FONT_MONTSERRAT} font-bold text-base`}>
                        {formatCurrency(orderFinancials?.finalTotal || 0)}
                    </span>
                </motion.div>

                {isDrawerOpenMobile && (
                    <>
                        <div className={`p-3 flex justify-between items-center border-b ${NEUTRAL_BORDER_LIGHTER} shrink-0 relative`}>
                            <DragHandle className={DRAG_HANDLE_BG} />
                            <h3 id="order-drawer-title-mobile-oic" className={`text-lg font-semibold ${FONT_MONTSERRAT} ${DRAWER_TITLE_TEXT_COLOR} pl-2`}>
                                {sl.orderInteractionController.drawerTitle || "Your Order"}
                            </h3>
                            <button
                                ref={drawerCloseButtonRef}
                                onClick={toggleMobileDrawer}
                                className={`p-1.5 rounded-full ${NEUTRAL_TEXT_MUTED} hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none ${ROSE_ACCENT_RING_FOCUS} transition-colors`}
                                aria-label={sl.orderInteractionController.closeDrawerAriaLabel || "Close order summary"}
                            >
                                <Icon name="close" className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <OrderSummaryPanel
                                orderItems={orderItems}
                                orderFinancials={orderFinancials}
                                onUpdateQuantity={onUpdateQuantity}
                                onConfirmOrderAction={onConfirmOrderAction}
                                onPromoValidationChange={onPromoValidationChange}
                                isSidebarVersion={false}
                                venueContext={venueContext}
                                navigateToMenu={navigateToMenu}
                                hidePanelTitle={true}
                            />
                        </div>
                    </>
                )}
            </motion.div>
        </>
    );
};

export default OrderInteractionController;