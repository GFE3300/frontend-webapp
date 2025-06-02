// frontend/src/features/menu_view/subcomponents/OrderSummaryPanel.jsx
// (Showing relevant parts for modification, assuming previous structure is intact)

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrderItem from "./OrderItem";
import Icon from '../../../components/common/Icon';
import Spinner from '../../../components/common/Spinner';

// ... (constants and animation variants as before) ...
const PANEL_BG_CUSTOMER_LIGHT = "bg-rose-50 dark:bg-neutral-800";
const PANEL_BG_DRAWER = "bg-white dark:bg-neutral-800";
const PANEL_BG_SIDEBAR_LIGHT = "bg-neutral-50 dark:bg-neutral-800/80";

const BUTTON_PRIMARY_CLASSES = "bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 dark:focus:ring-offset-neutral-800 disabled:opacity-60";
const BUTTON_TERTIARY_CLASSES = "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700/60 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 font-semibold py-2.5 px-4 rounded-md text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-400 dark:focus:ring-offset-neutral-800";

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
    tableNumber,
    userName,
    validatedPromoCode,
    onApplyPromoCode,
    onRemovePromoCode,
    hidePanelTitle = false,
}) {
    const [localPromoCodeInput, setLocalPromoCodeInput] = useState("");
    const [localOrderNotes, setLocalOrderNotes] = useState("");
    const [isConfirming, setIsConfirming] = useState(false);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);

    useEffect(() => {
        if (validatedPromoCode && validatedPromoCode.codeName && !validatedPromoCode.error) {
            setLocalPromoCodeInput(validatedPromoCode.codeName);
        } else {
            if (!validatedPromoCode?.error) {
                 setLocalPromoCodeInput("");
            }
        }
    }, [validatedPromoCode]);

    const { subtotal, totalDiscountAmount, finalTotal } = useMemo(() => {
        const currentSubtotal = orderItems.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0; // item.price is price AFTER options
            const quantity = parseInt(item.quantity, 10) || 0;
            return sum + (price * quantity);
        }, 0);

        let calculatedDiscount = 0;

        if (validatedPromoCode && validatedPromoCode.valid === true && !validatedPromoCode.error) {
            const promoType = validatedPromoCode.type;
            const promoValue = parseFloat(validatedPromoCode.value); // e.g., 20 for 20%, 5 for $5
            const applicability = validatedPromoCode.applicability;

            if (isNaN(promoValue)) {
                console.warn("Promo code value is not a number:", validatedPromoCode);
            } else {
                if (promoType === "ORDER_TOTAL_PERCENTAGE") {
                    calculatedDiscount = currentSubtotal * (promoValue / 100);
                } else if (promoType === "ORDER_TOTAL_FIXED_AMOUNT") {
                    calculatedDiscount = promoValue;
                } else if (promoType === "PERCENTAGE" || promoType === "FIXED_AMOUNT_PRODUCT") {
                    // Product-specific discount
                    let itemSpecificDiscountSum = 0;
                    const applicableProductIds = new Set(applicability?.product_ids || []);
                    // TODO: Consider applicability.category_ids and applicability.tag_ids if backend supports them for these promo types.
                    // This would require having category/tag info available for each orderItem.originalId.

                    orderItems.forEach(item => {
                        if (item.originalId && applicableProductIds.has(item.originalId)) {
                            const itemPriceWithOptions = parseFloat(item.price) || 0; // Price per unit with options
                            let discountForItem = 0;
                            if (promoType === "PERCENTAGE") {
                                discountForItem = itemPriceWithOptions * (promoValue / 100);
                            } else if (promoType === "FIXED_AMOUNT_PRODUCT") {
                                discountForItem = promoValue; // Fixed amount off this specific product
                            }
                            // Ensure discount doesn't make item price negative for this unit
                            discountForItem = Math.min(discountForItem, itemPriceWithOptions);
                            itemSpecificDiscountSum += (discountForItem * item.quantity);
                        }
                    });
                    calculatedDiscount = itemSpecificDiscountSum;
                } else {
                    console.warn("Unknown promo code type:", promoType);
                }
            }
        }

        // Ensure discount does not exceed subtotal
        calculatedDiscount = Math.min(calculatedDiscount, currentSubtotal > 0 ? currentSubtotal : 0);
        if (currentSubtotal === 0) calculatedDiscount = 0; // No discount if subtotal is zero

        const currentTotal = currentSubtotal - calculatedDiscount;

        return {
            subtotal: parseFloat(currentSubtotal.toFixed(2)),
            totalDiscountAmount: parseFloat(calculatedDiscount.toFixed(2)),
            finalTotal: Math.max(0, parseFloat(currentTotal.toFixed(2))) // Final total cannot be negative
        };
    }, [orderItems, validatedPromoCode]);

    // ... (handleApplyPromoSubmit, handleRemovePromo, handleActualConfirmOrder - as before, but handleActualConfirmOrder will need totalDiscountAmount from this new calculation) ...
    const handleApplyPromoSubmit = async () => {
        if (!localPromoCodeInput.trim() || !onApplyPromoCode) return;
        setIsApplyingPromo(true);
        try {
            await onApplyPromoCode(localPromoCodeInput.trim().toUpperCase());
        } catch (error) {
            console.error("[OrderSummaryPanel] Error during promo application (propagated):", error);
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const handleRemovePromo = () => {
        if (onRemovePromoCode) {
            onRemovePromoCode();
        }
    };
    
    const handleActualConfirmOrder = async () => {
        if (!onConfirmOrderAction || orderItems.length === 0) return;
        setIsConfirming(true);
        const orderDetailsPayload = {
            items: orderItems.map(item => ({
                id: item.originalId || item.id,
                name: item.name,
                quantity: item.quantity,
                price_per_item: parseFloat(item.price),
                total_price: parseFloat(item.price) * item.quantity,
                selected_options_summary: item.selectedOptionsSummary || null,
                selected_options_payload: item.detailedSelectedOptions ? item.detailedSelectedOptions.map(opt => ({ group_id: opt.groupId, option_id: opt.optionId })) : [],
            })),
            subtotal_amount: subtotal,
            // This part will be updated in Task 3.1 for precise backend payload structure
            discount_applied: (validatedPromoCode && validatedPromoCode.valid && !validatedPromoCode.error && validatedPromoCode.codeName && totalDiscountAmount > 0) ? {
                code_name: validatedPromoCode.codeName,
                amount: totalDiscountAmount, // Now accurately calculated
                type: validatedPromoCode.type,
                description: validatedPromoCode.public_display_name,
            } : null,
            total_amount: finalTotal, // Now accurately calculated
            notes: localOrderNotes.trim() || null,
            table_number: tableNumber || null,
            user_name: userName || null,
        };

        try {
            await onConfirmOrderAction(orderDetailsPayload);
            setLocalOrderNotes("");
        } catch (error) {
            console.error("[OrderSummaryPanel] Error confirming order (propagated):", error);
        } finally {
            setIsConfirming(false);
        }
    };


    const currentPanelBg = isSidebarVersion ? PANEL_BG_SIDEBAR_LIGHT : PANEL_BG_DRAWER;
    const panelContainerClass = isSidebarVersion
        ? `h-full flex flex-col ${currentPanelBg} text-neutral-800 dark:text-neutral-100 shadow-xl rounded-xl overflow-hidden`
        : `flex flex-col h-full`; 
    const innerPanelContentClass = isSidebarVersion
        ? "flex flex-col h-full"
        : "flex flex-col flex-1"; 
    const headerTextColorClass = isSidebarVersion ? "text-neutral-800 dark:text-neutral-100" : "text-rose-700 dark:text-rose-300";
    const notesLabelColorClass = "text-neutral-600 dark:text-neutral-300";
    const BORDER_COLOR_LIGHT = "border-neutral-200 dark:border-neutral-700";
    const BORDER_DASHED_COLOR_LIGHT = "border-neutral-300 dark:border-neutral-600";

    const isPromoAppliedSuccessfully = validatedPromoCode && validatedPromoCode.valid === true && !validatedPromoCode.error && validatedPromoCode.codeName;

    const renderOrderContent = () => (
        <>
            {/* Item List Area */}
            <div className={`flex-1 ${orderItems.length > 0 ? 'overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-500 scrollbar-track-transparent' : 'flex items-center justify-center'} ${isSidebarVersion ? 'p-4 sm:p-5' : 'p-4'}`}>
                <AnimatePresence mode="popLayout">
                    {orderItems.length === 0 ? (
                         <motion.div
                            key="empty-order-message"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className={`text-center text-neutral-500 dark:text-neutral-400 flex flex-col items-center px-4`}
                        >
                            <Icon name="shopping_basket" className="w-16 h-16 md:w-20 md:h-20 text-neutral-400 dark:text-neutral-500 mb-4 opacity-70" />
                            <p className="text-lg font-medium mb-2 text-neutral-700 dark:text-neutral-200">Your Order is Empty</p>
                            <p className="text-sm mb-6 max-w-xs">
                                {isSidebarVersion ? "Add items from the menu." : (navigateToMenu ? "Tap 'Menu' to explore!" : "Add items to get started.")}
                            </p>
                            {!isSidebarVersion && navigateToMenu && (
                                <motion.button
                                    onClick={navigateToMenu}
                                    className={`${BUTTON_PRIMARY_CLASSES} px-8 py-2.5 text-sm`}
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
                            className="space-y-2.5 sm:space-y-3"
                        >
                            <AnimatePresence>
                                {orderItems.map(item => (
                                    <OrderItem key={item.id} item={item} onUpdateQuantity={onUpdateQuantity} isPreviewMode={isPreviewMode} />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Summary and Actions Area */}
            <AnimatePresence>
                {orderItems.length > 0 && (
                    <motion.div
                        className={`shrink-0 border-t ${BORDER_COLOR_LIGHT} ${isSidebarVersion ? 'bg-neutral-100/70 dark:bg-neutral-800/70' : 'bg-white dark:bg-neutral-800'}`}
                        key="order-summary-details-block"
                        variants={sectionEntryVariants}
                        initial="initial" animate="animate" exit="exit"
                    >
                        {/* Promo Code Section */}
                        {onApplyPromoCode && (
                            <div className={`px-4 sm:px-5 pt-4 pb-2 ${isSidebarVersion ? '' : 'border-b dark:border-neutral-700/50'}`}>
                                <label htmlFor="promoCodeInputPanel" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1.5">
                                    Promo Code
                                </label>
                                <div className="flex items-center">
                                    <input
                                        id="promoCodeInputPanel" type="text" value={localPromoCodeInput}
                                        onChange={(e) => setLocalPromoCodeInput(e.target.value.toUpperCase())}
                                        placeholder="Enter promo code"
                                        className={`flex-grow h-10 p-2.5 rounded-l-md text-sm text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-700 focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 outline-none placeholder-neutral-500 dark:placeholder-neutral-400 border ${BORDER_COLOR_LIGHT} border-r-0 transition-colors duration-150`}
                                        disabled={isApplyingPromo || isPromoAppliedSuccessfully}
                                        autoCapitalize="characters"
                                        aria-describedby="promo-feedback-message"
                                    />
                                    {isPromoAppliedSuccessfully ? (
                                        <button
                                            onClick={handleRemovePromo}
                                            className={`${BUTTON_TERTIARY_CLASSES} rounded-l-none rounded-r-md h-10 border ${BORDER_COLOR_LIGHT} border-l-0`}
                                            aria-label="Remove Promo Code"
                                        > Remove </button>
                                    ) : (
                                        <button
                                            onClick={handleApplyPromoSubmit}
                                            disabled={isApplyingPromo || !localPromoCodeInput.trim()}
                                            className={`bg-rose-500 text-white font-semibold px-4 h-10 rounded-r-md hover:bg-rose-600 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-rose-500 disabled:opacity-50 flex items-center justify-center`}
                                            style={{ minWidth: '80px' }}
                                            aria-label="Apply Promo Code"
                                        >
                                            {isApplyingPromo ? <Spinner size="xs" color="text-white" /> : "Apply"}
                                        </button>
                                    )}
                                </div>
                                <AnimatePresence>
                                {validatedPromoCode?.message && (
                                    <motion.p
                                        id="promo-feedback-message"
                                        key="promo-message"
                                        variants={itemAppearVariants} initial="initial" animate="animate" exit="exit"
                                        className={`text-xs mt-1.5 px-1 ${validatedPromoCode.error ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                                        role={validatedPromoCode.error ? "alert" : "status"}
                                    >
                                        {validatedPromoCode.message}
                                    </motion.p>
                                )}
                                </AnimatePresence>
                            </div>
                        )}
                        
                        {/* Order Notes Section */}
                        <div className={`px-4 sm:px-5 pt-3 pb-3 ${isSidebarVersion ? '' : 'border-b dark:border-neutral-700/50'}`}>
                            <label htmlFor="orderNotesPanel" className={`block text-sm font-medium ${notesLabelColorClass} mb-1.5`}>
                                Order Notes {isPreviewMode ? "(Preview)" : ""}
                            </label>
                            <textarea
                                id="orderNotesPanel" rows="2" value={localOrderNotes} onChange={(e) => setLocalOrderNotes(e.target.value)}
                                className={`w-full p-2.5 rounded-md text-sm text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-700 focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 outline-none placeholder-neutral-500 dark:placeholder-neutral-400 border ${BORDER_COLOR_LIGHT} transition-colors duration-150`}
                                placeholder="e.g., no onions, extra spicy..."
                            ></textarea>
                        </div>

                        {/* Sidebar-specific "Ticket" dashed line */}
                        {isSidebarVersion && (
                            <div className="relative h-0 my-3 mx-4">
                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 ${currentPanelBg} rounded-full z-10`}></div>
                                <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 ${currentPanelBg} rounded-full z-10`}></div>
                                <div className={`absolute left-3 right-3 top-1/2 -translate-y-px border-t-2 border-dashed ${BORDER_DASHED_COLOR_LIGHT}`}></div>
                            </div>
                        )}

                        {/* Totals and Confirm Button */}
                        <div className="px-4 sm:px-5 pt-3 pb-4 sm:pb-5">
                            <div className={`space-y-1.5 text-sm text-neutral-600 dark:text-neutral-300`}>
                                <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                {isPromoAppliedSuccessfully && totalDiscountAmount > 0 && (
                                    <motion.div 
                                        key="discount-line"
                                        variants={itemAppearVariants} initial="initial" animate="animate" exit="exit"
                                        className="flex justify-between"
                                    >
                                        <span>Discount ({validatedPromoCode.public_display_name || validatedPromoCode.codeName})</span>
                                        <span className="text-green-600 dark:text-green-400">-${totalDiscountAmount.toFixed(2)}</span>
                                    </motion.div>
                                )}
                                <div className={`flex justify-between text-lg font-bold mt-2 pt-2 border-t ${BORDER_COLOR_LIGHT} ${isSidebarVersion ? headerTextColorClass : 'text-neutral-800 dark:text-neutral-100'}`}>
                                    <span>Total</span><span>${finalTotal.toFixed(2)}</span>
                                </div>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.98 }} onClick={handleActualConfirmOrder}
                                disabled={isConfirming || orderItems.length === 0}
                                className={`${BUTTON_PRIMARY_CLASSES} w-full mt-5 sm:mt-6 text-base flex items-center justify-center`}
                            >
                                {isConfirming ? (
                                    <><Spinner color="text-white" size="sm" className="mr-2" />Processing...</>
                                ) : (isPreviewMode ? "Confirm Preview Order" : "Place Order")}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );

    return (
        <div className={panelContainerClass} role="region" aria-labelledby={!hidePanelTitle ? "order-summary-panel-title" : undefined}>
            <div className={innerPanelContentClass}>
                {!isSidebarVersion && !hidePanelTitle && (
                     <div className={`p-4 sm:p-5 border-b ${BORDER_COLOR_LIGHT} shrink-0 bg-white dark:bg-neutral-800`}>
                        <div className="flex items-center justify-between">
                            <h2 id="order-summary-panel-title" className={`font-montserrat text-xl sm:text-2xl font-bold ${headerTextColorClass}`}>
                                {isPreviewMode ? "Order Preview" : "Your Order"}
                            </h2>
                            {(tableNumber || userName) && !isPreviewMode && (
                                <div className={`text-xs text-neutral-500 dark:text-neutral-400 text-right`}>
                                    {tableNumber && <span className="block sm:inline">Table: {tableNumber}</span>}
                                    {userName && <span className="block sm:inline sm:ml-2">For: {userName}</span>}
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