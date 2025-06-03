// frontend/src/features/menu_view/subcomponents/OrderSummaryPanel.jsx

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrderItem from "./OrderItem";
import Icon from '../../../components/common/Icon';
import Spinner from '../../../components/common/Spinner';
import { useValidatePromoCode } from "../../../contexts/ProductDataContext"; // Path from frontend.txt

const PANEL_BG_CUSTOMER_LIGHT = "bg-rose-50 dark:bg-neutral-800"; // Not used directly in this refined version
const PANEL_BG_DRAWER = "bg-white dark:bg-neutral-800"; // For mobile drawer
const PANEL_BG_SIDEBAR_LIGHT = "bg-neutral-50 dark:bg-neutral-800/80"; // For desktop sidebar

const BUTTON_PRIMARY_CLASSES = "bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 dark:focus:ring-offset-neutral-800 disabled:opacity-60";
const BUTTON_TERTIARY_CLASSES = "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700/60 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 font-semibold py-2.5 px-4 rounded-md text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-400 dark:focus:ring-offset-neutral-800";

const sectionEntryVariants = {
    initial: { opacity: 0, height: 0, y: -10 },
    animate: { opacity: 1, height: 'auto', y: 0, transition: { duration: 0.3, ease: "circOut" } },
    exit: { opacity: 0, height: 0, y: -10, transition: { duration: 0.2, ease: "circIn" } }
};

const itemAppearVariants = { // For messages and discount line items
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
    isPreviewMode = false, // If true, disables confirmation and promo code input
    venueContext, // { businessIdentifierForAPI, tableNumber, userName, numberOfPeople }
    hidePanelTitle = false, // For mobile drawer view primarily
}) {
    const [localPromoCodeInput, setLocalPromoCodeInput] = useState("");
    const [localOrderNotes, setLocalOrderNotes] = useState("");
    const [isConfirming, setIsConfirming] = useState(false); // For the main "Place Order" button
    const [promoValidationResult, setPromoValidationResult] = useState(null); // Stores API response for promo validation

    const { mutate: validatePromoCode, isLoading: isApplyingPromo } = useValidatePromoCode({
        onSuccess: (data) => {
            // data structure from backend: { valid, code_name, type, value, public_display_name, message, applicability, minimum_order_value_for_order_discount }
            // or { valid: false, message, code_name, error_code }
            setPromoValidationResult(data);
            if (data.valid && data.code_name) {
                setLocalPromoCodeInput(data.code_name); // Update input with validated/formatted code
            }
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.message || "Could not validate promo code. Please try again.";
            const errorCode = error.response?.data?.error_code || error.code || 'NETWORK_OR_CLIENT_ERROR';
            setPromoValidationResult({ 
                valid: false, 
                message: errorMessage, 
                error: true, // Explicitly mark as an error from our side
                errorCode: errorCode 
            });
        }
    });

    // Effect to update localPromoCodeInput from validation result (e.g. if backend uppercases it)
    useEffect(() => {
        if (promoValidationResult && promoValidationResult.valid && promoValidationResult.code_name) {
            setLocalPromoCodeInput(promoValidationResult.code_name);
        } else if (promoValidationResult === null) { // When promo is cleared
            setLocalPromoCodeInput("");
        }
    }, [promoValidationResult]);


    const handleApplyPromoSubmit = useCallback(async () => {
        if (!localPromoCodeInput.trim()) {
            setPromoValidationResult({ valid: false, message: "Please enter a promo code.", error: true, errorCode: 'INPUT_EMPTY' });
            return;
        }
        if (!venueContext?.businessIdentifierForAPI) { // Check businessIdentifierForAPI from venueContext
            setPromoValidationResult({ valid: false, message: "Business information is missing to validate promo.", error: true, errorCode: 'MISSING_BUSINESS_CONTEXT' });
            return;
        }

        const currentSubtotalForPayload = orderItems.reduce((sum, item) => (sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 0)), 0);
        const orderItemsContextForPayload = orderItems.map(item => ({
            product_id: item.originalId, // Assuming item.originalId holds the Product UUID
            quantity: item.quantity,
            base_price_per_unit: (parseFloat(item.price) || 0).toFixed(2) // Price per unit before any item-specific UI discount
        }));

        const payload = {
            code_name: localPromoCodeInput.trim().toUpperCase(), // Send standardized code
            business_identifier: venueContext.businessIdentifierForAPI,
            current_order_subtotal: currentSubtotalForPayload.toFixed(2),
            order_items_context: orderItemsContextForPayload,
        };
        
        setPromoValidationResult(null); // Clear previous validation message
        validatePromoCode(payload);

    }, [localPromoCodeInput, venueContext, orderItems, validatePromoCode]);

    const handleRemovePromo = useCallback(() => {
        setLocalPromoCodeInput("");
        setPromoValidationResult(null); // Clear validation result to remove discount
    }, []);

    const { subtotal, totalDiscountAmount, finalTotal, appliedPromoUIDetails, itemLevelDiscountsMap } = useMemo(() => {
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
            const promoValue = parseFloat(promoValueStr); // e.g., 10 for 10% or 5 for $5 fixed

            if (!isNaN(promoValue)) {
                let meetsMinOrderValueForOrderDiscount = true;
                if ((promoType === "ORDER_TOTAL_PERCENTAGE" || promoType === "ORDER_TOTAL_FIXED_AMOUNT") && minimum_order_value_for_order_discount) {
                    const minOrderValue = parseFloat(minimum_order_value_for_order_discount);
                    if (!isNaN(minOrderValue) && currentSubtotal < minOrderValue) {
                        meetsMinOrderValueForOrderDiscount = false;
                        // Message for this scenario is handled by promoValidationResult.message from backend/hook
                    }
                }

                if (meetsMinOrderValueForOrderDiscount) {
                    if (promoType === "ORDER_TOTAL_PERCENTAGE") {
                        calculatedOverallDiscount = currentSubtotal * (promoValue / 100);
                        if (calculatedOverallDiscount > 0) uiPromoDetailsForDisplay = { codeName: code_name, public_display_name: public_display_name || `${promoValue}% Off Order`, type: promoType };
                    } else if (promoType === "ORDER_TOTAL_FIXED_AMOUNT") {
                        calculatedOverallDiscount = promoValue;
                        if (calculatedOverallDiscount > 0) uiPromoDetailsForDisplay = { codeName: code_name, public_display_name: public_display_name || `$${promoValue.toFixed(2)} Off Order`, type: promoType };
                    } else if (promoType === "percentage" || promoType === "fixed_amount_product") { // These are item-specific types from DiscountMaster.DiscountType
                        const applicableProductUUIDs = new Set(applicability?.applicable_target_product_uuids || []);
                        let sumOfItemDiscounts = 0;

                        orderItems.forEach(orderItem => {
                            // Ensure orderItem.originalId matches the UUID format expected by applicableProductUUIDs
                            if (orderItem.originalId && applicableProductUUIDs.has(orderItem.originalId)) {
                                const itemPriceBeforeOptions = parseFloat(orderItem.price) || 0; // This price should be the one after product-level options are applied by ProductOptionsPopup
                                const itemQuantity = parseInt(orderItem.quantity, 10) || 0;
                                const originalItemLineTotal = itemPriceBeforeOptions * itemQuantity;
                                let discountAmountForThisLineItem = 0;

                                if (promoType === "percentage") {
                                    discountAmountForThisLineItem = originalItemLineTotal * (promoValue / 100);
                                } else { // fixed_amount_product
                                    // Fixed amount is per unit, so multiply by quantity
                                    let discountPerUnit = Math.min(promoValue, itemPriceBeforeOptions); // Cap discount at item's unit price
                                    discountAmountForThisLineItem = discountPerUnit * itemQuantity;
                                }
                                
                                discountAmountForThisLineItem = parseFloat(discountAmountForThisLineItem.toFixed(2));

                                if (discountAmountForThisLineItem > 0) {
                                    sumOfItemDiscounts += discountAmountForThisLineItem;
                                    tempItemDiscountsMap.set(orderItem.id, { // Use orderItem.id (unique per configuration)
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
            itemLevelDiscountsMap: tempItemDiscountsMap, // This map will be used by OrderItem
        };
    }, [orderItems, promoValidationResult]);


    const handleActualConfirmOrder = useCallback(async () => {
        if (!onConfirmOrderAction || orderItems.length === 0) return;
        if (!venueContext?.businessIdentifierForAPI || !venueContext?.tableNumber) {
            // This component shouldn't directly call `alert`. Userpage.jsx should handle system-wide alerts/modals.
            // For now, logging and preventing action.
            console.error("[OrderSummaryPanel] Cannot place order: Missing critical business or table information in venueContext.");
            // Potentially call a Userpage provided modal function here: showUserModal("Error", "Missing table/business info.", "error");
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
                product_id: item.originalId, // This should be the base Product UUID
                quantity: item.quantity,
                selected_options: item.detailedSelectedOptions // Array of {group_id, option_id} as expected by backend OrderItemCreateSerializer
                    ? item.detailedSelectedOptions.map(opt => ({ group_id: opt.groupId, option_id: opt.optionId }))
                    : [],
            })),
            // Send promo code name if a discount was successfully applied AND resulted in a discount amount
            order_level_promo_code_name: (promoValidationResult && promoValidationResult.valid && promoValidationResult.code_name && totalDiscountAmount > 0)
                ? promoValidationResult.code_name 
                : null,
            // Backend will recalculate prices and discounts based on this payload.
            // No need to send item_specific_promo_codes here if order_level_promo_code_name handles item-specific discounts via its applicability.
            // If backend expects item-specific codes distinctly, this payload needs adjustment.
            // Current backend `get_validated_discount_details` seems to handle one code that can be order-level or product-specific.
        };

        try {
            await onConfirmOrderAction(orderDetailsPayload); // This is Userpage's handleConfirmOrderAction
            // Reset local state after successful order placement (Userpage handles global state like orderItems)
            setLocalOrderNotes("");
            setPromoValidationResult(null);
            setLocalPromoCodeInput("");
        } catch (error) {
            // Error display is handled by Userpage.jsx via showUserModal
            console.error("[OrderSummaryPanel] Error during order confirmation (onConfirmOrderAction callback threw):", error);
        } finally {
            setIsConfirming(false);
        }
    }, [onConfirmOrderAction, orderItems, venueContext, localOrderNotes, promoValidationResult, totalDiscountAmount]);

    const currentPanelBg = isSidebarVersion ? PANEL_BG_SIDEBAR_LIGHT : PANEL_BG_DRAWER;
    const panelContainerClass = isSidebarVersion
        ? `h-full flex flex-col ${currentPanelBg} text-neutral-800 dark:text-neutral-100 shadow-xl rounded-xl overflow-hidden`
        : `flex flex-col h-full`; 
    const innerPanelContentClass = isSidebarVersion
        ? "flex flex-col h-full"
        : "flex flex-col flex-1"; 
    const headerTextColorClass = isSidebarVersion ? "text-neutral-800 dark:text-neutral-100" : "text-rose-700 dark:text-rose-300"; // Keep rose for drawer title
    const notesLabelColorClass = "text-neutral-600 dark:text-neutral-300";
    const BORDER_COLOR_LIGHT = "border-neutral-200 dark:border-neutral-700";
    const BORDER_DASHED_COLOR_LIGHT = "border-neutral-300 dark:border-neutral-600";

    const isPromoSuccessfullyAppliedAndActive = appliedPromoUIDetails && totalDiscountAmount > 0;


    const renderOrderContent = () => (
        <>
            <div className={`flex-1 ${orderItems.length > 0 ? 'overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-500 scrollbar-track-transparent' : 'flex items-center justify-center'} ${isSidebarVersion ? 'p-4 sm:p-5' : 'p-4'}`}>
                <AnimatePresence mode="popLayout"> {/* Ensures items animate out correctly */}
                    {orderItems.length === 0 ? (
                        <motion.div 
                            key="empty-order-state"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center text-center p-6 text-neutral-500 dark:text-neutral-400"
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
                            key="order-items-list" // Key for AnimatePresence
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } }}
                            exit={{ opacity: 0 }}
                            className="space-y-2.5 sm:space-y-3"
                        >
                            <AnimatePresence> {/* Inner AnimatePresence for individual item add/remove */}
                                {orderItems.map(item => (
                                    <OrderItem 
                                        key={item.id} // item.id is unique for configured items
                                        item={item} 
                                        onUpdateQuantity={onUpdateQuantity} 
                                        isPreviewMode={isPreviewMode}
                                        appliedItemDiscountDetails={itemLevelDiscountsMap.get(item.id)} // Pass item-specific discount
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer section only shown if there are items or in preview mode */}
            <AnimatePresence>
                {(orderItems.length > 0 || isPreviewMode) && (
                    <motion.div
                        className={`shrink-0 border-t ${BORDER_COLOR_LIGHT} ${isSidebarVersion ? 'bg-neutral-100/70 dark:bg-neutral-800/70' : 'bg-white dark:bg-neutral-800'}`}
                        key="order-summary-details-block"
                        variants={sectionEntryVariants} initial="initial" animate="animate" exit="exit"
                    >
                        {/* Promo Code Section */}
                        {!isPreviewMode && (
                            <div className={`px-4 sm:px-5 pt-4 pb-2 ${isSidebarVersion ? '' : `border-b ${BORDER_COLOR_LIGHT}`}`}>
                                <label htmlFor="promoCodeInputPanel" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1.5">Promo Code</label>
                                <div className="flex items-center">
                                    <input id="promoCodeInputPanel" type="text" value={localPromoCodeInput}
                                        onChange={(e) => setLocalPromoCodeInput(e.target.value.toUpperCase())}
                                        placeholder="Enter promo code"
                                        className={`flex-grow h-10 p-2.5 rounded-l-md text-sm text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-700 focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 outline-none placeholder-neutral-500 dark:placeholder-neutral-400 border ${BORDER_COLOR_LIGHT} border-r-0 transition-colors duration-150`}
                                        disabled={isApplyingPromo || isPromoSuccessfullyAppliedAndActive || isPreviewMode}
                                        autoCapitalize="characters" aria-describedby="promo-feedback-message" />
                                    {isPromoSuccessfullyAppliedAndActive ? (
                                        <button onClick={handleRemovePromo} className={`${BUTTON_TERTIARY_CLASSES} rounded-l-none rounded-r-md h-10 border ${BORDER_COLOR_LIGHT} border-l-0`} aria-label="Remove Promo Code"> Remove </button>
                                    ) : (
                                        <button onClick={handleApplyPromoSubmit} disabled={isApplyingPromo || !localPromoCodeInput.trim() || isPreviewMode}
                                            className={`bg-rose-500 text-white font-semibold px-4 h-10 rounded-r-md hover:bg-rose-600 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-rose-500 disabled:opacity-50 flex items-center justify-center`}
                                            style={{ minWidth: '80px' }} aria-label="Apply Promo Code">
                                            {isApplyingPromo ? <Spinner size="xs" color="text-white" /> : "Apply"}
                                        </button>
                                    )}
                                </div>
                                <AnimatePresence>
                                {promoValidationResult?.message && (
                                    <motion.p id="promo-feedback-message" key={promoValidationResult.message}
                                        variants={itemAppearVariants} initial="initial" animate="animate" exit="exit"
                                        className={`text-xs mt-1.5 px-1 ${promoValidationResult.valid && !promoValidationResult.error ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                        role={promoValidationResult.error || !promoValidationResult.valid ? "alert" : "status"}>
                                        {promoValidationResult.message}
                                    </motion.p>
                                )}
                                </AnimatePresence>
                            </div>
                        )}
                        
                        {/* Order Notes Section */}
                        <div className={`px-4 sm:px-5 pt-3 pb-3 ${isSidebarVersion ? '' : `border-b ${BORDER_COLOR_LIGHT}`}`}>
                            <label htmlFor="orderNotesPanel" className={`block text-sm font-medium ${notesLabelColorClass} mb-1.5`}>Order Notes {isPreviewMode ? "(Preview)" : ""}</label>
                            <textarea id="orderNotesPanel" rows="2" value={localOrderNotes} onChange={(e) => setLocalOrderNotes(e.target.value)}
                                className={`w-full p-2.5 rounded-md text-sm text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-700 focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 outline-none placeholder-neutral-500 dark:placeholder-neutral-400 border ${BORDER_COLOR_LIGHT} transition-colors duration-150`}
                                placeholder="e.g., no onions, extra spicy..." disabled={isPreviewMode || isConfirming}></textarea>
                        </div>

                        {/* Dashed line for sidebar version */}
                        {isSidebarVersion && ( <div className="relative h-0 my-3 mx-4"><div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 ${currentPanelBg} rounded-full z-10`}></div><div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 ${currentPanelBg} rounded-full z-10`}></div><div className={`absolute left-3 right-3 top-1/2 -translate-y-px border-t-2 border-dashed ${BORDER_DASHED_COLOR_LIGHT}`}></div></div> )}

                        {/* Totals and Confirm Button */}
                        <div className="px-4 sm:px-5 pt-3 pb-4 sm:pb-5">
                            <div className={`space-y-1.5 text-sm text-neutral-600 dark:text-neutral-300`}>
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    {isPromoSuccessfullyAppliedAndActive && totalDiscountAmount > 0 && (promoValidationResult?.type === "ORDER_TOTAL_PERCENTAGE" || promoValidationResult?.type === "ORDER_TOTAL_FIXED_AMOUNT") ? (
                                        <del className="text-neutral-400 dark:text-neutral-500">${subtotal.toFixed(2)}</del>
                                    ) : (
                                        <span>${subtotal.toFixed(2)}</span>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {isPromoSuccessfullyAppliedAndActive && totalDiscountAmount > 0 && (
                                        <motion.div 
                                            key="order-discount-line" // Unique key for AnimatePresence
                                            variants={itemAppearVariants} initial="initial" animate="animate" exit="exit"
                                            className="flex justify-between"
                                        >
                                            <span>Discount ({appliedPromoUIDetails.public_display_name || appliedPromoUIDetails.codeName})</span>
                                            <span className="text-green-600 dark:text-green-400">-${totalDiscountAmount.toFixed(2)}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                
                                {/* Optional "New Subtotal" if an order-level discount was applied */}
                                {isPromoSuccessfullyAppliedAndActive && totalDiscountAmount > 0 && (promoValidationResult?.type === "ORDER_TOTAL_PERCENTAGE" || promoValidationResult?.type === "ORDER_TOTAL_FIXED_AMOUNT") && (
                                     <motion.div 
                                        key="new-subtotal-line"
                                        variants={itemAppearVariants} initial="initial" animate="animate" exit="exit"
                                        className="flex justify-between text-neutral-700 dark:text-neutral-200 font-medium"
                                    >
                                        <span>New Subtotal</span>
                                        <span>${(subtotal - totalDiscountAmount).toFixed(2)}</span>
                                    </motion.div>
                                )}

                                <div className={`flex justify-between text-lg font-bold mt-2 pt-2 border-t ${BORDER_COLOR_LIGHT} ${isSidebarVersion ? headerTextColorClass : 'text-neutral-800 dark:text-neutral-100'}`}>
                                    <span>Total</span><span>${finalTotal.toFixed(2)}</span>
                                </div>
                            </div>
                             {!isPreviewMode && (
                                <motion.button whileTap={{ scale: 0.98 }} onClick={handleActualConfirmOrder}
                                    disabled={isConfirming || orderItems.length === 0}
                                    className={`${BUTTON_PRIMARY_CLASSES} w-full mt-5 sm:mt-6 text-base flex items-center justify-center`}>
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
        <div className={panelContainerClass} role="region" aria-labelledby={!hidePanelTitle ? "order-summary-panel-title" : undefined}>
            <div className={innerPanelContentClass}>
                {!isSidebarVersion && !hidePanelTitle && ( // Only show this header in the mobile drawer if not explicitly hidden
                     <div className={`p-4 sm:p-5 border-b ${BORDER_COLOR_LIGHT} shrink-0 bg-white dark:bg-neutral-800`}>
                        <div className="flex items-center justify-between">
                            <h2 id="order-summary-panel-title" className={`font-montserrat text-xl sm:text-2xl font-bold ${headerTextColorClass}`}>
                                {isPreviewMode ? "Order Preview" : "Your Order"}
                            </h2>
                            {(venueContext?.tableNumber || venueContext?.userName) && !isPreviewMode && (
                                <div className={`text-xs text-neutral-500 dark:text-neutral-400 text-right`}>
                                    {venueContext?.tableNumber && <span className="block sm:inline">Table: {venueContext.tableNumber}</span>}
                                    {venueContext?.userName && <span className="block sm:inline sm:ml-2">For: {venueContext.userName}</span>}
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