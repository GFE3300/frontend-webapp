// frontend/src/features/menu_view/subcomponents/OrderSummaryPanel.jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrderItem from "./OrderItem";
import Icon from '../../../components/common/Icon';
import Spinner from '../../../components/common/Spinner';
import { useValidatePromoCode } from "../../../contexts/ProductDataContext";

// Color Palette (Guideline 2.1)
const PANEL_BG_DRAWER = "bg-white dark:bg-neutral-800";
const PANEL_BG_SIDEBAR_LIGHT = "bg-neutral-50 dark:bg-neutral-800/80"; // Main panel for sidebar

const ROSE_PRIMARY_BUTTON_BG = "bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"; // Primary actions like Place Order
const ROSE_SECONDARY_BUTTON_BG = "bg-rose-500 hover:bg-rose-600 dark:bg-rose-500 dark:hover:bg-rose-600"; // Secondary actions like Apply Promo
const BUTTON_TEXT_ON_ACCENT = "text-white";

const BUTTON_PRIMARY_CLASSES = "px-4 py-2 text-sm font-semibold text-white rounded-md";
const BUTTON_SECONDARY_CLASSES = "px-4 py-2 text-sm font-semibold rounded-md";
const BUTTON_TERTIARY_CLASSES = "px-4 py-2 text-sm font-semibold rounded-md";

const NEUTRAL_BUTTON_TERTIARY_BG_HOVER = "hover:bg-neutral-100 dark:hover:bg-neutral-700/60";
const NEUTRAL_TEXT_PRIMARY = "text-neutral-800 dark:text-neutral-100";
const NEUTRAL_TEXT_SECONDARY = "text-neutral-700 dark:text-neutral-200";
const NEUTRAL_TEXT_MUTED = "text-neutral-500 dark:text-neutral-400";
const NEUTRAL_TEXT_PLACEHOLDER = "text-neutral-500 dark:text-neutral-400";
const NEUTRAL_TEXT_LABEL = "text-neutral-600 dark:text-neutral-300"; // For labels
const NEUTRAL_INPUT_BG = "bg-white dark:bg-neutral-700"; // Input field background
const NEUTRAL_BORDER = "border-neutral-300 dark:border-neutral-600"; // Standard borders for inputs, sections
const NEUTRAL_BORDER_LIGHTER = "border-neutral-200 dark:border-neutral-700"; // Dividers

const ROSE_ACCENT_TEXT = "text-rose-600 dark:text-rose-400"; // Accent text for totals
const ROSE_RING_FOCUS = "focus:ring-rose-500 dark:focus:ring-rose-400"; // Focus ring for interactive elements

// Semantic Colors
const ERROR_TEXT = "text-red-600 dark:text-red-400";
const SUCCESS_TEXT = "text-green-600 dark:text-green-400";

// Typography (Guideline 2.2)
const FONT_MONTSERRAT = "font-montserrat"; // Headings & Display
const FONT_INTER = "font-inter";         // UI & Body

const HEADER_TEXT_SIZE_LARGE = "text-xl sm:text-2xl"; // H2 equivalent for Panel Title
// const HEADER_TEXT_SIZE_SMALL = "text-lg"; // H3 equivalent for section titles if needed
const BODY_TEXT_MEDIUM = "text-sm"; // Standard text
const BODY_TEXT_SMALL = "text-xs";  // Smaller text, like promo messages, labels
const BUTTON_FONT_PRIMARY = "font-semibold"; // Primary button text
const BUTTON_FONT_SECONDARY = "font-semibold"; // Secondary button text
const TOTAL_PRICE_FONT_SIZE_LARGE = "text-lg"; // Main total price label
const TOTAL_PRICE_ACCENT_FONT_SIZE_LARGE = "text-xl sm:text-2xl"; // Accent total price value

// Borders & Corner Radii (Guideline 2.6)
const PANEL_RADIUS_SIDEBAR = "rounded-xl"; // Sidebar panel radius (using larger option from 2.6)
const INPUT_RADIUS = "rounded-md"; // Input fields (non-pill)
const BUTTON_RADIUS = "rounded-lg"; // Buttons

// Spacing (Guideline 3.2) - Using Tailwind's scale which aligns with 4px base
const PADDING_STANDARD = "p-4 sm:p-5"; // Standard padding for sections
const PADDING_SMALL_INPUT = "p-2.5"; // Smaller padding for inputs

// Animation Variants (Guideline 4.1, 4.3)
const sectionEntryVariants = {
    initial: { opacity: 0, height: 0, y: -10 },
    animate: { opacity: 1, height: 'auto', y: 0, transition: { duration: 0.3, ease: "circOut" } },
    exit: { opacity: 0, height: 0, y: -10, transition: { duration: 0.2, ease: "circIn" } }
};

const itemAppearVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } }
};

function OrderSummaryPanel({
    orderItems = [],
    onUpdateQuantity,
    onConfirmOrderAction,
    navigateToMenu,
    isSidebarVersion = false,
    isPreviewMode = false,
    venueContext, // { businessIdentifierForAPI, tableNumber, userName, numberOfPeople, businessName }
    hidePanelTitle = false,
}) {
    const [localPromoCodeInput, setLocalPromoCodeInput] = useState("");
    const [localOrderNotes, setLocalOrderNotes] = useState("");
    const [isConfirming, setIsConfirming] = useState(false);
    const [promoValidationResult, setPromoValidationResult] = useState(null);

    const { mutate: validatePromoCode, isLoading: isApplyingPromo } = useValidatePromoCode({
        onSuccess: (data) => {
            setPromoValidationResult(data);
            if (data.valid && data.code_name) {
                setLocalPromoCodeInput(data.code_name);
            }
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.message || "Could not validate promo code. Please try again.";
            const errorCode = error.response?.data?.error_code || error.code || 'NETWORK_OR_CLIENT_ERROR';
            setPromoValidationResult({
                valid: false,
                message: errorMessage,
                error: true,
                errorCode: errorCode
            });
        }
    });

    useEffect(() => {
        if (promoValidationResult && promoValidationResult.valid && promoValidationResult.code_name) {
            setLocalPromoCodeInput(promoValidationResult.code_name);
        } else if (promoValidationResult === null) {
            setLocalPromoCodeInput("");
        }
    }, [promoValidationResult]);


    const handleApplyPromoSubmit = useCallback(async () => {
        if (!localPromoCodeInput.trim()) {
            setPromoValidationResult({ valid: false, message: "Please enter a promo code.", error: true, errorCode: 'INPUT_EMPTY' });
            return;
        }
        if (!venueContext?.businessIdentifierForAPI) {
            setPromoValidationResult({ valid: false, message: "Business information is missing to validate promo.", error: true, errorCode: 'MISSING_BUSINESS_CONTEXT' });
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

        setPromoValidationResult(null); // Clear previous result before new validation
        validatePromoCode(payload);

    }, [localPromoCodeInput, venueContext, orderItems, validatePromoCode]);

    const handleRemovePromo = useCallback(() => {
        setLocalPromoCodeInput("");
        setPromoValidationResult(null);
    }, []);

    const { subtotal, totalDiscountAmount, finalTotal, appliedPromoUIDetails, itemLevelDiscountsMap } = useMemo(() => {
        // ... (calculation logic remains the same as provided in frontend.txt) ...
        const currentSubtotal = orderItems.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity, 10) || 0;
            return sum + (price * quantity);
        }, 0);

        let calculatedOverallDiscount = 0;
        let uiPromoDetailsForDisplay = null;
        const tempItemDiscountsMap = new Map();

        if (promoValidationResult && promoValidationResult.valid === true && !promoValidationResult.error) {
            const { type: promoType, value: promoValueStr, applicability, minimum_order_value_for_order_discount, public_display_name, code_name } = promoValidationResult;
            const promoValue = parseFloat(promoValueStr);

            if (!isNaN(promoValue)) {
                let meetsMinOrderValueForOrderDiscount = true;
                if ((promoType === "ORDER_TOTAL_PERCENTAGE" || promoType === "ORDER_TOTAL_FIXED_AMOUNT") && minimum_order_value_for_order_discount) {
                    const minOrderValue = parseFloat(minimum_order_value_for_order_discount);
                    if (!isNaN(minOrderValue) && currentSubtotal < minOrderValue) {
                        meetsMinOrderValueForOrderDiscount = false;
                        // Update validation result if min order value not met AFTER applying
                        setPromoValidationResult(prev => ({
                            ...prev,
                            valid: false, // Set to false to reflect it's not applicable now
                            error: true, // Indicate it's an error state for UI
                            message: `Order subtotal must be at least $${minOrderValue.toFixed(2)} for this code. Current subtotal: $${currentSubtotal.toFixed(2)}.`,
                            errorCode: 'MIN_ORDER_VALUE_NOT_MET'
                        }));
                    }
                }

                if (meetsMinOrderValueForOrderDiscount) {
                    if (promoType === "ORDER_TOTAL_PERCENTAGE") {
                        calculatedOverallDiscount = currentSubtotal * (promoValue / 100);
                        if (calculatedOverallDiscount > 0) uiPromoDetailsForDisplay = { codeName: code_name, public_display_name: public_display_name || `${promoValue}% Off Order`, type: promoType };
                    } else if (promoType === "ORDER_TOTAL_FIXED_AMOUNT") {
                        calculatedOverallDiscount = promoValue;
                        if (calculatedOverallDiscount > 0) uiPromoDetailsForDisplay = { codeName: code_name, public_display_name: public_display_name || `$${promoValue.toFixed(2)} Off Order`, type: promoType };
                    } else if (promoType === "percentage" || promoType === "fixed_amount_product") {
                        const applicableProductUUIDs = new Set(applicability?.applicable_target_product_uuids || []);
                        let sumOfItemDiscounts = 0;

                        orderItems.forEach(orderItem => {
                            if (orderItem.originalId && applicableProductUUIDs.has(orderItem.originalId)) {
                                const itemPriceBeforeOptions = parseFloat(orderItem.price) || 0;
                                const itemQuantity = parseInt(orderItem.quantity, 10) || 0;
                                const originalItemLineTotal = itemPriceBeforeOptions * itemQuantity;
                                let discountAmountForThisLineItem = 0;

                                if (promoType === "percentage") {
                                    discountAmountForThisLineItem = originalItemLineTotal * (promoValue / 100);
                                } else {
                                    let discountPerUnit = Math.min(promoValue, itemPriceBeforeOptions);
                                    discountAmountForThisLineItem = discountPerUnit * itemQuantity;
                                }

                                discountAmountForThisLineItem = parseFloat(discountAmountForThisLineItem.toFixed(2));

                                if (discountAmountForThisLineItem > 0) {
                                    sumOfItemDiscounts += discountAmountForThisLineItem;
                                    tempItemDiscountsMap.set(orderItem.id, {
                                        amount: discountAmountForThisLineItem,
                                        description: public_display_name || (promoType === "percentage" ? `${promoValue}% off` : `$${promoValue.toFixed(2)} off`),
                                        originalItemTotal: parseFloat(originalItemLineTotal.toFixed(2)),
                                    });
                                }
                            }
                        });
                        calculatedOverallDiscount = sumOfItemDiscounts;
                        if (calculatedOverallDiscount > 0 && !uiPromoDetailsForDisplay) {
                            uiPromoDetailsForDisplay = { codeName: code_name, public_display_name: public_display_name || "Item Discounts Applied", type: "ITEM_SPECIFIC_AGGREGATE" };
                        }
                    }
                }
            }
        }

        calculatedOverallDiscount = Math.min(calculatedOverallDiscount, currentSubtotal > 0 ? currentSubtotal : 0);
        if (currentSubtotal === 0) calculatedOverallDiscount = 0;

        const currentTotal = currentSubtotal - calculatedOverallDiscount;

        return {
            subtotal: parseFloat(currentSubtotal.toFixed(2)),
            totalDiscountAmount: parseFloat(calculatedOverallDiscount.toFixed(2)),
            finalTotal: Math.max(0, parseFloat(currentTotal.toFixed(2))),
            appliedPromoUIDetails: uiPromoDetailsForDisplay,
            itemLevelDiscountsMap: tempItemDiscountsMap,
        };
    }, [orderItems, promoValidationResult]);

    const handleActualConfirmOrder = useCallback(async () => {
        // ... (logic remains the same as provided in frontend.txt) ...
        if (!onConfirmOrderAction || orderItems.length === 0) return;
        if (!venueContext?.businessIdentifierForAPI || !venueContext?.tableNumber) {
            console.error("[OrderSummaryPanel] Cannot place order: Missing critical business or table information in venueContext.");
            return;
        }

        setIsConfirming(true);
        const orderDetailsPayload = {
            business_identifier: venueContext.businessIdentifierForAPI,
            table_number: venueContext.tableNumber,
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
            order_level_promo_code_name: (promoValidationResult && promoValidationResult.valid && promoValidationResult.code_name && totalDiscountAmount > 0)
                ? promoValidationResult.code_name
                : null,
        };

        try {
            await onConfirmOrderAction(orderDetailsPayload);
            setLocalOrderNotes("");
            setPromoValidationResult(null);
            setLocalPromoCodeInput("");
        } catch (error) {
            console.error("[OrderSummaryPanel] Error during order confirmation (onConfirmOrderAction callback threw):", error);
        } finally {
            setIsConfirming(false);
        }
    }, [onConfirmOrderAction, orderItems, venueContext, localOrderNotes, promoValidationResult, totalDiscountAmount]);

    const currentPanelBg = isSidebarVersion ? PANEL_BG_SIDEBAR_LIGHT : PANEL_BG_DRAWER;
    const panelContainerClass = isSidebarVersion
        ? `h-full flex flex-col ${currentPanelBg} ${NEUTRAL_TEXT_PRIMARY} shadow-xl ${PANEL_RADIUS_SIDEBAR} overflow-hidden`
        : `flex flex-col h-full`;
    const innerPanelContentClass = isSidebarVersion
        ? "flex flex-col h-full"
        : "flex flex-col flex-1";

    const headerTextColorClass = isSidebarVersion
        ? NEUTRAL_TEXT_PRIMARY
        : (hidePanelTitle ? NEUTRAL_TEXT_PRIMARY : ROSE_ACCENT_TEXT); // Rose only if title shown in drawer

    const notesLabelColorClass = NEUTRAL_TEXT_LABEL;
    const BORDER_DIVIDER = NEUTRAL_BORDER_LIGHTER;
    const BORDER_INPUT_FIELD = NEUTRAL_BORDER;
    const BORDER_DASHED_COLOR_LIGHT = `border-neutral-300 dark:border-neutral-600`; // From Guideline 2.6

    const isPromoSuccessfullyAppliedAndActive = appliedPromoUIDetails && totalDiscountAmount > 0 && promoValidationResult?.valid;


    const renderOrderContent = () => (
        <>
            {/* Order Items List Area (Guideline 3.2 Spacing) */}
            <div className={`flex-1 ${orderItems.length > 0 ? 'overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-500 scrollbar-track-transparent' : 'flex items-center justify-center'} ${isSidebarVersion ? PADDING_STANDARD : 'p-4'}`}>
                <AnimatePresence mode="popLayout">
                    {orderItems.length === 0 ? (
                        <motion.div
                            key="empty-order-state"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`flex flex-col items-center justify-center text-center p-6 ${NEUTRAL_TEXT_MUTED} ${FONT_INTER}`}
                        >
                            {/* Icon (Guideline 2.3 Extra Large) */}
                            <Icon name="shopping_basket" className={`w-16 h-16 md:w-20 md:h-20 ${NEUTRAL_TEXT_MUTED} mb-4 opacity-70`} />
                            {/* Text (Guideline 2.2 Body Large for title, Body Medium for message) */}
                            <p className={`text-lg font-medium mb-2 ${NEUTRAL_TEXT_SECONDARY}`}>Your Order is Empty</p>
                            <p className={`${BODY_TEXT_MEDIUM} mb-6 max-w-xs`}>
                                {isSidebarVersion ? "Add items from the menu." : (navigateToMenu ? "Tap 'Menu' to explore!" : "Add items to get started.")}
                            </p>
                            {!isSidebarVersion && navigateToMenu && (
                                <motion.button
                                    onClick={navigateToMenu}
                                    className={`${BUTTON_PRIMARY_CLASSES} px-8 py-2.5 ${BODY_TEXT_MEDIUM}`}
                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                > Browse Menu </motion.button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="order-items-list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } }}
                            exit={{ opacity: 0 }}
                            className="space-y-2.5 sm:space-y-3" // Guideline 3.2 Spacing scale (10px, 12px)
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

            {/* Summary Details Block */}
            <AnimatePresence>
                {(orderItems.length > 0 || isPreviewMode) && (
                    <motion.div
                        className={`shrink-0 border-t ${BORDER_DIVIDER} ${isSidebarVersion ? 'bg-neutral-100/70 dark:bg-neutral-800/70' : PANEL_BG_DRAWER}`}
                        key="order-summary-details-block"
                        variants={sectionEntryVariants} initial="initial" animate="animate" exit="exit"
                    >
                        {/* Promo Code Section (Guideline 6.2 Input Fields, 6.1 Buttons) */}
                        {!isPreviewMode && (
                            <div className={`${PADDING_STANDARD} pt-4 pb-2 ${isSidebarVersion ? '' : `border-b ${BORDER_DIVIDER}`}`}>
                                {/* Label (Guideline 2.2 Body Small) */}
                                <label htmlFor="promoCodeInputPanel" className={`block ${BODY_TEXT_SMALL} font-medium ${notesLabelColorClass} mb-1.5`}>Promo Code</label>
                                <div className="flex items-center">
                                    {/* Input (Guideline 6.2 InputFields - h-9/10, py-2 px-4, rounded-full or md/lg) */}
                                    <input id="promoCodeInputPanel" type="text" value={localPromoCodeInput}
                                        onChange={(e) => setLocalPromoCodeInput(e.target.value.toUpperCase())}
                                        placeholder="Enter promo code"
                                        className={`flex-grow h-10 ${PADDING_SMALL_INPUT} ${INPUT_RADIUS} ${BODY_TEXT_MEDIUM} ${FONT_INTER} ${NEUTRAL_TEXT_PRIMARY} ${NEUTRAL_INPUT_BG} focus:ring-2 ${ROSE_RING_FOCUS} outline-none ${NEUTRAL_TEXT_PLACEHOLDER} border ${BORDER_INPUT_FIELD} border-r-0 rounded-r-none transition-colors duration-150`}
                                        disabled={isApplyingPromo || isPromoSuccessfullyAppliedAndActive || isPreviewMode}
                                        autoCapitalize="characters" aria-describedby="promo-feedback-message" />
                                    {isPromoSuccessfullyAppliedAndActive ? (
                                        // Remove Button (Tertiary/Ghost)
                                        <button onClick={handleRemovePromo} className={`${BUTTON_TERTIARY_CLASSES} rounded-l-none ${BUTTON_RADIUS} h-10 border ${BORDER_INPUT_FIELD} border-l-0`} aria-label="Remove Promo Code"> Remove </button>
                                    ) : (
                                        // Apply Button (Secondary Rose)
                                        <button onClick={handleApplyPromoSubmit} disabled={isApplyingPromo || !localPromoCodeInput.trim() || isPreviewMode}
                                            className={`${BUTTON_SECONDARY_CLASSES} rounded-l-none`}
                                            style={{ minWidth: '80px' }} aria-label="Apply Promo Code">
                                            {isApplyingPromo ? <Spinner size="xs" color="text-white" /> : "Apply"}
                                        </button>
                                    )}
                                </div>
                                <AnimatePresence>
                                    {promoValidationResult?.message && (
                                        <motion.p id="promo-feedback-message" key={promoValidationResult.message}
                                            variants={itemAppearVariants} initial="initial" animate="animate" exit="exit"
                                            className={`${BODY_TEXT_SMALL} mt-1.5 px-1 ${promoValidationResult.valid && !promoValidationResult.error ? SUCCESS_TEXT : ERROR_TEXT}`}
                                            role={promoValidationResult.error || !promoValidationResult.valid ? "alert" : "status"}>
                                            {promoValidationResult.message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Order Notes Section (Guideline 6.2 Textarea) */}
                        <div className={`${PADDING_STANDARD} pt-3 pb-3 ${isSidebarVersion ? '' : `border-b ${BORDER_DIVIDER}`}`}>
                            <label htmlFor="orderNotesPanel" className={`block ${BODY_TEXT_SMALL} font-medium ${notesLabelColorClass} mb-1.5`}>Order Notes {isPreviewMode ? "(Preview)" : ""}</label>
                            <textarea id="orderNotesPanel" rows="2" value={localOrderNotes} onChange={(e) => setLocalOrderNotes(e.target.value)}
                                className={`w-full ${PADDING_SMALL_INPUT} ${INPUT_RADIUS} ${BODY_TEXT_MEDIUM} ${FONT_INTER} ${NEUTRAL_TEXT_PRIMARY} ${NEUTRAL_INPUT_BG} focus:ring-2 ${ROSE_RING_FOCUS} outline-none ${NEUTRAL_TEXT_PLACEHOLDER} border ${BORDER_INPUT_FIELD} transition-colors duration-150`}
                                placeholder="e.g., no onions, extra spicy..." disabled={isPreviewMode || isConfirming}></textarea>
                        </div>

                        {/* Visual Separator for Sidebar (Guideline 2.6 Dashed border) */}
                        {isSidebarVersion && (<div className="relative h-0 my-3 mx-4"><div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 ${currentPanelBg} rounded-full z-10`}></div><div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 ${currentPanelBg} rounded-full z-10`}></div><div className={`absolute left-3 right-3 top-1/2 -translate-y-px border-t-2 border-dashed ${BORDER_DASHED_COLOR_LIGHT}`}></div></div>)}

                        {/* Totals Section (Guideline 2.2 Typography, 3.2 Spacing) */}
                        <div className={`${PADDING_STANDARD} pt-3 pb-4 sm:pb-5`}>
                            <div className={`space-y-1.5 ${BODY_TEXT_MEDIUM} ${FONT_INTER} ${NEUTRAL_TEXT_SECONDARY}`}>
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    {isPromoSuccessfullyAppliedAndActive && totalDiscountAmount > 0 && (promoValidationResult?.type === "ORDER_TOTAL_PERCENTAGE" || promoValidationResult?.type === "ORDER_TOTAL_FIXED_AMOUNT") ? (
                                        <del className={NEUTRAL_TEXT_MUTED}>${subtotal.toFixed(2)}</del>
                                    ) : (
                                        <span>${subtotal.toFixed(2)}</span>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {isPromoSuccessfullyAppliedAndActive && totalDiscountAmount > 0 && (
                                        <motion.div
                                            key="order-discount-line"
                                            variants={itemAppearVariants} initial="initial" animate="animate" exit="exit"
                                            className="flex justify-between"
                                        >
                                            <span className="truncate pr-2">Discount ({appliedPromoUIDetails.public_display_name || appliedPromoUIDetails.codeName})</span>
                                            <span className={SUCCESS_TEXT}>-${totalDiscountAmount.toFixed(2)}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {isPromoSuccessfullyAppliedAndActive && totalDiscountAmount > 0 && (promoValidationResult?.type === "ORDER_TOTAL_PERCENTAGE" || promoValidationResult?.type === "ORDER_TOTAL_FIXED_AMOUNT") && (
                                    <motion.div
                                        key="new-subtotal-line"
                                        variants={itemAppearVariants} initial="initial" animate="animate" exit="exit"
                                        className={`flex justify-between ${NEUTRAL_TEXT_SECONDARY} font-medium`}
                                    >
                                        <span>New Subtotal</span>
                                        <span>${(subtotal - totalDiscountAmount).toFixed(2)}</span>
                                    </motion.div>
                                )}

                                {/* Total Price (Guideline 2.2 Typography - H3 Montserrat Medium for label, H2 Montserrat Bold for value) */}
                                <div className={`flex justify-between font-bold mt-2 pt-2 border-t ${BORDER_DIVIDER} ${headerTextColorClass}`}>
                                    <span className={`${FONT_MONTSERRAT} ${TOTAL_PRICE_FONT_SIZE_LARGE}`}>Total</span>
                                    <span className={`${FONT_MONTSERRAT} ${TOTAL_PRICE_ACCENT_FONT_SIZE_LARGE} ${ROSE_ACCENT_TEXT}`}>${finalTotal.toFixed(2)}</span>
                                </div>
                            </div>
                            {/* Place Order Button (Guideline 6.1 Primary Button) */}
                            {!isPreviewMode && (
                                <motion.button whileTap={{ scale: 0.98 }} onClick={handleActualConfirmOrder}
                                    disabled={isConfirming || orderItems.length === 0}
                                    className={`${BUTTON_PRIMARY_CLASSES} w-full mt-5 sm:mt-6 text-base flex items-center justify-center`} // Using Body Medium (16px) for button text
                                    aria-live="polite"
                                >
                                    {isConfirming ? <><Spinner color="text-white" size="sm" className="mr-2" />Processing...</> : "Place Order"}
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );

    return (
        <div className={`${panelContainerClass} ${FONT_INTER}`} role="region" aria-labelledby={!hidePanelTitle ? "order-summary-panel-title" : undefined}>
            <div className={innerPanelContentClass}>
                {!hidePanelTitle && (
                    <div className={`${PADDING_STANDARD} border-b ${BORDER_DIVIDER} shrink-0 ${isSidebarVersion ? 'bg-transparent' : PANEL_BG_DRAWER}`}>
                        <div className="flex items-center justify-between">
                            {/* Panel Title (Guideline 2.2 H2: Montserrat SemiBold, 30px. Using text-xl/2xl for responsive) */}
                            <h2 id="order-summary-panel-title" className={`${FONT_MONTSERRAT} ${HEADER_TEXT_SIZE_LARGE} font-semibold ${headerTextColorClass}`}> {/* Changed to font-semibold per H2 */}
                                {isPreviewMode ? "Order Preview" : "Your Order"}
                            </h2>
                            {(venueContext?.tableNumber || venueContext?.userName || venueContext?.numberOfPeople) && !isPreviewMode && (
                                // Context Info (Guideline 2.2 Body Small)
                                <div className={`${BODY_TEXT_SMALL} ${NEUTRAL_TEXT_MUTED} text-right`}>
                                    {venueContext?.tableNumber && <span className="block sm:inline">Table: {venueContext.tableNumber}</span>}
                                    {(venueContext?.userName || venueContext?.numberOfPeople) &&
                                        <span className="block sm:inline sm:ml-2">
                                            For: {venueContext.userName || 'Guest'}
                                            {venueContext.numberOfPeople && ` (${venueContext.numberOfPeople} ${venueContext.numberOfPeople === 1 ? 'guest' : 'guests'})`}
                                        </span>
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {renderOrderContent()}
            </div>
        </div>
    );
}

export default OrderSummaryPanel;