import React, { useState, useMemo, useCallback, useEffect } from "react";
// eslint-disable-next-line
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import OrderItem from "./OrderItem";
import Icon from '../../../components/common/Icon';
import Spinner from '../../../components/common/Spinner';
import { useValidatePromoCode } from "../../../contexts/ProductDataContext";
import { useCurrency } from "../../../hooks/useCurrency";
import { scriptLines_menu_view as sl } from '../utils/script_lines.js'; // LOCALIZATION
import { interpolate } from '../utils/script_lines.js'; // LOCALIZATION

const PANEL_BG_DRAWER = "";
const PANEL_BG_SIDEBAR_LIGHT = "";

const ROSE_PRIMARY_BUTTON_BG = "bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600";
const ROSE_SECONDARY_BUTTON_BG = "bg-rose-500 hover:bg-rose-600 dark:bg-rose-500 dark:hover:bg-rose-600";
const BUTTON_TEXT_ON_ACCENT = "text-white";

const BUTTON_PRIMARY_CLASSES = "px-4 py-2.5 text-sm font-semibold text-white rounded-full shadow-md";
const BUTTON_SECONDARY_CLASSES = "px-4 py-2 text-sm font-semibold rounded-md";
const BUTTON_TERTIARY_CLASSES = "px-3 py-2 text-xs font-medium rounded-md";

const NEUTRAL_TEXT_PRIMARY = "text-neutral-800 dark:text-neutral-100";
const NEUTRAL_TEXT_SECONDARY = "text-neutral-700 dark:text-neutral-200";
const NEUTRAL_TEXT_MUTED = "text-neutral-500 dark:text-neutral-400";
const NEUTRAL_TEXT_PLACEHOLDER = "placeholder-neutral-400 dark:placeholder-neutral-500";
const NEUTRAL_TEXT_LABEL = "text-neutral-600 dark:text-neutral-300";
const NEUTRAL_INPUT_BG = "bg-white dark:bg-neutral-700";
const NEUTRAL_BORDER = "border-neutral-300 dark:border-neutral-600";
const NEUTRAL_BORDER_LIGHTER = "border-neutral-200 dark:border-neutral-700";

const ROSE_ACCENT_TEXT = "text-rose-600 dark:text-rose-400";
const ROSE_RING_FOCUS = "focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 focus:ring-offset-1 dark:focus:ring-offset-neutral-800";

const ERROR_TEXT = "text-red-600 dark:text-red-400";
const SUCCESS_TEXT = "text-green-600 dark:text-green-400";

const FONT_MONTSERRAT = "font-montserrat";
const FONT_INTER = "font-inter";

const HEADER_TEXT_SIZE_LARGE = "text-xl sm:text-2xl";
const BODY_TEXT_MEDIUM = "text-sm";
const BODY_TEXT_SMALL = "text-xs";
const TOTAL_PRICE_FONT_SIZE_LARGE = "text-lg";
const TOTAL_PRICE_ACCENT_FONT_SIZE_LARGE = "text-xl sm:text-2xl";

const PANEL_RADIUS_SIDEBAR = "rounded-xl";
const INPUT_RADIUS = "rounded-md";

const PADDING_STANDARD = "p-4 sm:p-5";
const PADDING_SMALL_INPUT = "px-3 py-2";

const sectionEntryVariantsDefault = {
    initial: { opacity: 0, height: 0, y: -10 },
    animate: { opacity: 1, height: 'auto', y: 0, transition: { duration: 0.3, ease: "circOut" } },
    exit: { opacity: 0, height: 0, y: -10, transition: { duration: 0.2, ease: "circIn" } }
};
const itemAppearVariantsDefault = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } }
};
const reducedMotionTransition = { duration: 0.01 };

function OrderSummaryPanel({
    orderItems = [],
    orderFinancials,
    onUpdateQuantity,
    onConfirmOrderAction,
    onPromoValidationChange,
    navigateToMenu,
    isSidebarVersion = false,
    isPreviewMode = false,
    venueContext,
    hidePanelTitle = false,
}) {
    const [localPromoCodeInput, setLocalPromoCodeInput] = useState("");
    const [localOrderNotes, setLocalOrderNotes] = useState("");
    const [isConfirming, setIsConfirming] = useState(false);
    const { formatCurrency } = useCurrency();

    const { subtotal, totalDiscountAmount, finalTotal, appliedPromoUIDetails, itemLevelDiscountsMap } = orderFinancials;

    const shouldReduceMotion = useReducedMotion();
    const sectionEntryVariants = shouldReduceMotion
        ? { ...sectionEntryVariantsDefault, animate: { ...sectionEntryVariantsDefault.animate, transition: reducedMotionTransition }, exit: { ...sectionEntryVariantsDefault.exit, transition: reducedMotionTransition } }
        : sectionEntryVariantsDefault;
    const itemAppearVariants = shouldReduceMotion
        ? { ...itemAppearVariantsDefault, animate: { ...itemAppearVariantsDefault.animate, transition: reducedMotionTransition }, exit: { ...itemAppearVariantsDefault.exit, transition: reducedMotionTransition } }
        : itemAppearVariantsDefault;

    const { mutate: validatePromoCodeAPI, isLoading: isApplyingPromo } = useValidatePromoCode({
        onSuccess: (data) => {
            if (onPromoValidationChange) onPromoValidationChange(data);
            if (data.valid && data.code_name) {
                setLocalPromoCodeInput(data.code_name);
            }
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.message || "Could not validate promo code.";
            const errorCode = error.response?.data?.error_code || error.code || 'NETWORK_OR_CLIENT_ERROR';
            if (onPromoValidationChange) onPromoValidationChange({ valid: false, message: errorMessage, error: true, errorCode: errorCode });
        }
    });

    useEffect(() => {
        if (appliedPromoUIDetails && appliedPromoUIDetails.codeName) {
            setLocalPromoCodeInput(appliedPromoUIDetails.codeName);
        } else if (!appliedPromoUIDetails) {
            setLocalPromoCodeInput("");
        }
    }, [appliedPromoUIDetails]);

    const handleApplyPromoSubmit = useCallback(async () => {
        if (isPreviewMode || !onPromoValidationChange) return;
        if (!localPromoCodeInput.trim()) {
            onPromoValidationChange({ valid: false, message: (sl.orderSummaryPanel.promoFeedback.inputEmpty || "Please enter a promo code."), error: true, errorCode: 'INPUT_EMPTY' });
            return;
        }
        if (!venueContext?.businessIdentifierForAPI) {
            onPromoValidationChange({ valid: false, message: (sl.orderSummaryPanel.promoFeedback.missingBusinessContext || "Business information is missing."), error: true, errorCode: 'MISSING_BUSINESS_CONTEXT' });
            return;
        }
        const currentSubtotalForPayload = orderItems.reduce((sum, item) => (sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 0)), 0);
        const orderItemsContextForPayload = orderItems.map(item => ({
            product_id: item.originalId,
            quantity: item.quantity,
            base_price_per_unit: (parseFloat(item.price) || 0).toFixed(2)
        }));
        const payload = {
            code_name: localPromoCodeInput.trim().toUpperCase(),
            business_identifier: venueContext.businessIdentifierForAPI,
            current_order_subtotal: currentSubtotalForPayload.toFixed(2),
            order_items_context: orderItemsContextForPayload,
        };
        onPromoValidationChange(null);
        validatePromoCodeAPI(payload);
    }, [localPromoCodeInput, venueContext, orderItems, validatePromoCodeAPI, onPromoValidationChange, isPreviewMode]);

    const handleRemovePromo = useCallback(() => {
        if (isPreviewMode || !onPromoValidationChange) return;
        setLocalPromoCodeInput("");
        onPromoValidationChange(null);
    }, [onPromoValidationChange, isPreviewMode]);

    const handleActualConfirmOrder = useCallback(async () => {
        if (isPreviewMode || !onConfirmOrderAction || orderItems.length === 0) return;
        if (!venueContext?.businessIdentifierForAPI || !venueContext?.tableNumber) {
            console.error("[OrderSummaryPanel] Cannot place order: Missing critical business/table info.");
            return;
        }
        setIsConfirming(true);
        const orderDetailsPayload = {
            business_identifier: venueContext.businessIdentifierForAPI,
            table_number: venueContext.tableNumber || null,
            customer_name: venueContext.userName || null,
            number_of_guests: venueContext.numberOfPeople || null,
            notes: localOrderNotes.trim() || null,
            items: orderItems.map(item => ({
                product_id: item.originalId,
                quantity: item.quantity,
                selected_options: item.detailedSelectedOptions
                    ? item.detailedSelectedOptions.map(opt => ({ group_id: opt.groupId, option_id: opt.id }))
                    : [],
            })),
            order_level_promo_code_name: (appliedPromoUIDetails && totalDiscountAmount > 0)
                ? appliedPromoUIDetails.codeName
                : null,
        };
        try {
            await onConfirmOrderAction(orderDetailsPayload);
            setLocalOrderNotes("");
        } catch (error) {
            console.error("[OrderSummaryPanel] Error during order confirmation callback:", error);
        } finally {
            setIsConfirming(false);
        }
    }, [
        isPreviewMode, onConfirmOrderAction, orderItems, venueContext, localOrderNotes,
        appliedPromoUIDetails, totalDiscountAmount
    ]);

    const currentPanelBg = isSidebarVersion ? PANEL_BG_SIDEBAR_LIGHT : PANEL_BG_DRAWER;
    const panelContainerClass = isSidebarVersion
        ? `h-full flex flex-col ${currentPanelBg} ${NEUTRAL_TEXT_PRIMARY} shadow-xl ${PANEL_RADIUS_SIDEBAR} overflow-hidden`
        : `flex flex-col h-full`;

    const headerTextColorClass = isSidebarVersion
        ? NEUTRAL_TEXT_PRIMARY
        : (hidePanelTitle ? NEUTRAL_TEXT_PRIMARY : ROSE_ACCENT_TEXT);

    const notesLabelColorClass = NEUTRAL_TEXT_LABEL;
    const BORDER_DIVIDER = NEUTRAL_BORDER_LIGHTER;
    const BORDER_INPUT_FIELD = NEUTRAL_BORDER;
    const BORDER_DASHED_COLOR_LIGHT = `border-neutral-300 dark:border-neutral-600`;
    const isPromoAppliedAndValid = appliedPromoUIDetails && totalDiscountAmount > 0 && appliedPromoUIDetails.type;

    const promoFeedback = useMemo(() => {
        if (isApplyingPromo) return { message: sl.orderSummaryPanel.promoFeedback.validating || "Validating...", type: "loading" };
        if (!appliedPromoUIDetails) return null;
        if (appliedPromoUIDetails.valid === false && appliedPromoUIDetails.error === true) {
            return { message: appliedPromoUIDetails.message, type: "error" };
        }
        if (appliedPromoUIDetails.valid === true && totalDiscountAmount > 0) {
            return { message: appliedPromoUIDetails.public_display_name || (sl.orderSummaryPanel.promoFeedback.applied || "Discount applied!"), type: "success" };
        }
        if (appliedPromoUIDetails.valid === true && totalDiscountAmount === 0 && !appliedPromoUIDetails.message) {
            return { message: sl.orderSummaryPanel.promoFeedback.noApplicableDiscount || "Code is valid, but no applicable discount for current order.", type: "info" };
        }
        if (appliedPromoUIDetails.message) {
            return { message: appliedPromoUIDetails.message, type: (appliedPromoUIDetails.valid ? "info" : "error") };
        }
        return null;
    }, [appliedPromoUIDetails, isApplyingPromo, totalDiscountAmount]);

    const renderOrderContent = () => (
        <div className="flex font-montserrat flex-col flex-1 min-h-0">
            <div className={`flex-1 ${orderItems.length > 0 ? 'overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent' : 'flex items-center justify-center'} ${isSidebarVersion ? PADDING_STANDARD : 'p-4'}`}>
                <AnimatePresence mode="popLayout">
                    {orderItems.length === 0 ? (
                        <motion.div
                            key="empty-order-state"
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            transition={shouldReduceMotion ? reducedMotionTransition : undefined}
                            className={`flex flex-col items-center justify-center text-center p-6 ${NEUTRAL_TEXT_MUTED} ${FONT_INTER}`}
                        >
                            <Icon name="shopping_basket" className={`w-16 h-16 md:w-20 md:h-20 ${NEUTRAL_TEXT_MUTED} mb-4 opacity-70`} />
                            <p className={`text-lg font-medium mb-2 ${NEUTRAL_TEXT_SECONDARY}`}>{sl.orderSummaryPanel.emptyOrderTitle || "Your Order is Empty"}</p>
                            <p className={`${BODY_TEXT_MEDIUM} mb-6 max-w-xs`}>
                                {isSidebarVersion ? (sl.orderSummaryPanel.emptyOrderMessageSidebar || "Add items from the menu.") : (navigateToMenu ? (sl.orderSummaryPanel.emptyOrderMessageDrawer || "Tap 'Menu' to explore!") : (sl.orderSummaryPanel.emptyOrderDefaultMessage || "Add items to get started."))}
                            </p>
                            {!isSidebarVersion && navigateToMenu && (
                                <motion.button
                                    onClick={navigateToMenu}
                                    className={`${BUTTON_PRIMARY_CLASSES} ${ROSE_PRIMARY_BUTTON_BG} px-8 py-2.5 ${BODY_TEXT_MEDIUM}`}
                                    whileHover={shouldReduceMotion ? {} : { scale: 1.03 }} whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                                > {sl.orderSummaryPanel.browseMenuButton || "Browse Menu"} </motion.button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="order-items-list"
                            initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } }} exit={{ opacity: 0 }}
                            transition={shouldReduceMotion ? reducedMotionTransition : undefined}
                            className="space-y-2.5 sm:space-y-3"
                        >
                            <AnimatePresence>
                                {orderItems.map(item => (
                                    <OrderItem
                                        key={item.id}
                                        item={item}
                                        onUpdateQuantity={onUpdateQuantity}
                                        isPreviewMode={isPreviewMode}
                                        appliedItemDiscountDetails={itemLevelDiscountsMap.get(item.id)}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {(orderItems.length > 0 || isPreviewMode) && (
                    <motion.div
                        className={`shrink-0 border-t ${BORDER_DIVIDER} ${isSidebarVersion ? 'bg-neutral-100/70 dark:bg-neutral-800/70' : PANEL_BG_DRAWER}`}
                        key="order-summary-details-block"
                        variants={sectionEntryVariants} initial="initial" animate="animate" exit="exit"
                    >
                        {!isPreviewMode && (
                            <div className={`${PADDING_STANDARD} pt-4 pb-2 ${isSidebarVersion ? '' : `border-b ${BORDER_DIVIDER}`}`}>
                                <label htmlFor="promoCodeInputPanel" className={`block ${BODY_TEXT_SMALL} font-medium ${notesLabelColorClass} mb-1.5`}>{sl.orderSummaryPanel.promoCodeLabel || "Promo Code"}</label>
                                <div className="flex items-stretch">
                                    <input id="promoCodeInputPanel" type="text" value={localPromoCodeInput}
                                        onChange={(e) => setLocalPromoCodeInput(e.target.value.toUpperCase())}
                                        placeholder={sl.orderSummaryPanel.promoCodePlaceholder || "Enter promo code"}
                                        className={`flex-grow h-10 ${PADDING_SMALL_INPUT} ${INPUT_RADIUS} ${BODY_TEXT_MEDIUM} ${FONT_INTER} ${NEUTRAL_TEXT_PRIMARY} ${NEUTRAL_INPUT_BG} focus:ring-2 ${ROSE_RING_FOCUS} outline-none ${NEUTRAL_TEXT_PLACEHOLDER} border ${BORDER_INPUT_FIELD} border-r-0 rounded-r-none transition-colors duration-150`}
                                        disabled={isApplyingPromo || isPromoAppliedAndValid || isPreviewMode}
                                        autoCapitalize="characters" aria-describedby="promo-feedback-message" />
                                    {isPromoAppliedAndValid ? (
                                        <button onClick={handleRemovePromo} className={`${BUTTON_TERTIARY_CLASSES} ${NEUTRAL_TEXT_MUTED} hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-l-none h-10 border ${BORDER_INPUT_FIELD} border-l-0 ${ROSE_RING_FOCUS}`} aria-label="Remove Promo Code"> {sl.orderSummaryPanel.removePromoButton || "Remove"} </button>
                                    ) : (
                                        <button onClick={handleApplyPromoSubmit} disabled={isApplyingPromo || !localPromoCodeInput.trim() || isPreviewMode}
                                            className={`${BUTTON_SECONDARY_CLASSES} ${ROSE_SECONDARY_BUTTON_BG} ${BUTTON_TEXT_ON_ACCENT} rounded-l-none h-10 ${ROSE_RING_FOCUS}`}
                                            style={{ minWidth: '80px' }} aria-label="Apply Promo Code">
                                            {isApplyingPromo ? <Spinner size="xs" color="text-white" /> : (sl.orderSummaryPanel.applyPromoButton || "Apply")}
                                        </button>
                                    )}
                                </div>
                                <AnimatePresence>
                                    {promoFeedback && (
                                        <motion.p id="promo-feedback-message" key={promoFeedback.message}
                                            variants={itemAppearVariants} initial="initial" animate="animate" exit="exit"
                                            className={`${BODY_TEXT_SMALL} mt-1.5 px-1 ${promoFeedback.type === 'success' ? SUCCESS_TEXT : (promoFeedback.type === 'error' ? ERROR_TEXT : NEUTRAL_TEXT_MUTED)}`}
                                            role={promoFeedback.type === 'error' ? "alert" : "status"}>
                                            {promoFeedback.message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                        <div className={`${PADDING_STANDARD} pt-3 pb-3 ${isSidebarVersion ? '' : `border-b ${BORDER_DIVIDER}`}`}>
                            <label htmlFor="orderNotesPanel" className={`block ${BODY_TEXT_SMALL} font-medium ${notesLabelColorClass} mb-1.5`}>{sl.orderSummaryPanel.orderNotesLabel || "Order Notes"} {isPreviewMode ? (sl.orderSummaryPanel.orderNotesPreviewLabel || "(Preview)") : ""}</label>
                            <textarea id="orderNotesPanel" rows="2" value={localOrderNotes} onChange={(e) => setLocalOrderNotes(e.target.value)}
                                className={`w-full ${PADDING_SMALL_INPUT} ${INPUT_RADIUS} ${BODY_TEXT_MEDIUM} ${FONT_INTER} ${NEUTRAL_TEXT_PRIMARY} ${NEUTRAL_INPUT_BG} focus:ring-2 ${ROSE_RING_FOCUS} outline-none ${NEUTRAL_TEXT_PLACEHOLDER} border ${BORDER_INPUT_FIELD} transition-colors duration-150 resize-none`}
                                placeholder={sl.orderSummaryPanel.orderNotesPlaceholder || "e.g., no onions, extra spicy..."} disabled={isPreviewMode || isConfirming}></textarea>
                        </div>
                        {isSidebarVersion && (<div className="relative h-0 my-3 mx-4"><div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 ${currentPanelBg} rounded-full z-10`}></div><div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 ${currentPanelBg} rounded-full z-10`}></div><div className={`absolute left-3 right-3 top-1/2 -translate-y-px border-t-2 border-dashed ${BORDER_DASHED_COLOR_LIGHT}`}></div></div>)}
                        <div className={`${PADDING_STANDARD} pt-3 pb-4 sm:pb-5`}>
                            <div className={`space-y-1.5 ${BODY_TEXT_MEDIUM} ${FONT_INTER} ${NEUTRAL_TEXT_SECONDARY}`}>
                                <div className="flex justify-between">
                                    <span>{sl.orderSummaryPanel.subtotalLabel || "Subtotal"}</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <AnimatePresence>
                                    {isPromoAppliedAndValid && totalDiscountAmount > 0 && (
                                        <motion.div key="order-discount-line" variants={itemAppearVariants} initial="initial" animate="animate" exit="exit" className="flex justify-between">
                                            <span className="truncate pr-2">{interpolate(sl.orderSummaryPanel.discountLabel, { promoCode: appliedPromoUIDetails.public_display_name || appliedPromoUIDetails.codeName }) || `Discount (${appliedPromoUIDetails.public_display_name || appliedPromoUIDetails.codeName})`}</span>
                                            <span className={SUCCESS_TEXT}>-{formatCurrency(totalDiscountAmount)}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div className={`flex justify-between font-bold mt-2 pt-2 border-t ${BORDER_DIVIDER} ${headerTextColorClass}`}>
                                    <span className={`${FONT_MONTSERRAT} ${TOTAL_PRICE_FONT_SIZE_LARGE}`}>{sl.orderSummaryPanel.totalLabel || "Total"}</span>
                                    <span className={`${FONT_MONTSERRAT} ${TOTAL_PRICE_ACCENT_FONT_SIZE_LARGE} ${ROSE_ACCENT_TEXT}`}>{formatCurrency(finalTotal)}</span>
                                </div>
                            </div>
                            {!isPreviewMode && (
                                <motion.button whileTap={shouldReduceMotion ? {} : { scale: 0.98 }} onClick={handleActualConfirmOrder}
                                    disabled={isConfirming || orderItems.length === 0}
                                    className={`${BUTTON_PRIMARY_CLASSES} ${ROSE_PRIMARY_BUTTON_BG} w-full mt-5 sm:mt-6 text-base flex items-center justify-center ${ROSE_RING_FOCUS}`}
                                    aria-live="polite">
                                    {isConfirming ? <><Spinner color="text-white" size="sm" className="mr-2" />{sl.orderSummaryPanel.processingButton || "Processing..."}</> : (sl.orderSummaryPanel.placeOrderButton || "Place Order")}
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className={`${panelContainerClass} ${FONT_INTER}`} role="region" aria-labelledby={!hidePanelTitle ? "order-summary-panel-title" : undefined}>
            <div className={hidePanelTitle ? "flex flex-col flex-1 min-h-0" : "contents"}>
                {!hidePanelTitle && (
                    <div className={`${PADDING_STANDARD} border-b ${BORDER_DIVIDER} shrink-0 ${isSidebarVersion ? 'bg-transparent' : PANEL_BG_DRAWER}`}>
                        <div className="flex items-center justify-between">
                            <h2 id="order-summary-panel-title" className={`${FONT_MONTSERRAT} ${HEADER_TEXT_SIZE_LARGE} font-semibold ${headerTextColorClass}`}>
                                {isPreviewMode ? (sl.orderSummaryPanel.titlePreview || "Order Preview") : (sl.orderSummaryPanel.titleYourOrder || "Your Order")}
                            </h2>
                            {(venueContext?.tableNumber || venueContext?.userName || venueContext?.numberOfPeople) && !isPreviewMode && (
                                <div className={`${BODY_TEXT_SMALL} ${NEUTRAL_TEXT_MUTED} text-right`}>
                                    {venueContext?.tableNumber && <span className="block sm:inline">{interpolate(sl.orderSummaryPanel.tableLabel, { tableNumber: venueContext.tableNumber }) || `Table: ${venueContext.tableNumber}`}</span>}
                                    {(venueContext?.userName || venueContext?.numberOfPeople) &&
                                        <span className="block sm:inline sm:ml-2">
                                            {interpolate(sl.orderSummaryPanel.forLabel, { userName: venueContext.userName || (sl.orderSummaryPanel.guestFallback || 'Guest') }) || `For: ${venueContext.userName || 'Guest'}`}
                                            {venueContext.numberOfPeople && interpolate(sl.orderSummaryPanel.guestCountLabel, { count: venueContext.numberOfPeople, plural: venueContext.numberOfPeople === 1 ? (sl.orderSummaryPanel.guestSingular || 'guest') : (sl.orderSummaryPanel.guestPlural || 'guests') }) || ` (${venueContext.numberOfPeople} ${venueContext.numberOfPeople === 1 ? 'guest' : 'guests'})`}
                                        </span>
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {hidePanelTitle ? renderOrderContent() : <div className="flex flex-col flex-1 min-h-0">{renderOrderContent()}</div>}
            </div>
        </div>
    );
}

const OrderSummaryPanelWrapper = (props) => {
    return <OrderSummaryPanel {...props} />;
};

export default OrderSummaryPanelWrapper;