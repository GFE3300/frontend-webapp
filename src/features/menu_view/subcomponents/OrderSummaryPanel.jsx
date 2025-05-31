import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrderItem from "./OrderItem"; // Assuming in the same directory
import Modal from "../../../components/animated_alerts/Modal"; // Adjusted path
import Icon from "../../../components/common/Icon"; // Adjusted path
import Spinner from "../../../components/common/Spinner"; // Adjusted path
// import apiService from "../../../services/api"; // For future real promo validation

const listAnimationVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.07, duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } }
};

const summarySectionVariants = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: "easeOut", delay: 0.1 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeIn" } }
};

// Default theme colors for the panel itself, can be overridden by parent container if needed.
const DEFAULT_PANEL_BG_LIGHT = "bg-rose-600";
const DEFAULT_PANEL_TEXT_LIGHT = "text-white";
const DEFAULT_PANEL_BG_DARK = "dark:bg-neutral-800";
const DEFAULT_PANEL_TEXT_DARK = "dark:text-neutral-100";


function OrderSummaryPanel({
    orderItems = [],
    onUpdateQuantity,
    onConfirmOrderAction,
    navigateToMenu,
    isSidebarVersion = false,
    isPreviewMode = false,
    tableNumber,
    userName,
}) {
    const [promoCode, setPromoCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState({ amount: 0, code: null, message: null, type: null });
    const [orderNotes, setOrderNotes] = useState("");
    const [isConfirming, setIsConfirming] = useState(false);

    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [promoModalProps, setPromoModalProps] = useState({ title: '', message: '', type: 'info' });

    const { subtotal, total } = useMemo(() => {
        const currentSubtotal = orderItems.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity, 10) || 0;
            return sum + (price * quantity);
        }, 0);

        let discountAmountToApply = appliedDiscount.amount;
        // Cap fixed discount at subtotal
        if (appliedDiscount.type === 'fixed_amount' && discountAmountToApply > currentSubtotal) {
            discountAmountToApply = currentSubtotal;
        }

        const currentTotal = currentSubtotal - discountAmountToApply;
        return {
            subtotal: parseFloat(currentSubtotal.toFixed(2)),
            total: Math.max(0, parseFloat(currentTotal.toFixed(2))) // Ensure total is not negative
        };
    }, [orderItems, appliedDiscount]);

    const applyPromoCode = useCallback(async () => {
        if (!promoCode.trim()) {
            setPromoModalProps({ title: "Promo Code Required", message: "Please enter a promo code to apply.", type: "info" });
            setIsPromoModalOpen(true);
            return;
        }

        // Simulate promo code logic (client-side for both modes for now)
        // In a real app, !isPreviewMode would trigger an API call here.
        if (isPreviewMode || true) { // Keep simulation for customer view for now
            console.log(`Simulating promo code validation for: ${promoCode} (Subtotal: $${subtotal.toFixed(2)})`);
            if (promoCode.toUpperCase() === "SAVE10") {
                const discountValue = subtotal * 0.10;
                setAppliedDiscount({
                    amount: parseFloat(discountValue.toFixed(2)),
                    code: promoCode.toUpperCase(),
                    message: `10% discount ($${discountValue.toFixed(2)}) applied!`,
                    type: 'percentage'
                });
                setPromoModalProps({ title: "Promo Applied!", message: `10% discount ($${discountValue.toFixed(2)}) has been applied.`, type: "success" });
            } else if (promoCode.toUpperCase() === "FIXED5") {
                const discountValue = 5.00;
                setAppliedDiscount({
                    amount: discountValue,
                    code: promoCode.toUpperCase(),
                    message: `$${discountValue.toFixed(2)} fixed discount applied!`,
                    type: 'fixed_amount'
                });
                setPromoModalProps({ title: "Promo Applied!", message: `$${discountValue.toFixed(2)} fixed discount has been applied.`, type: "success" });
            } else {
                setAppliedDiscount({ amount: 0, code: promoCode, message: "Invalid promo code.", type: 'error' });
                setPromoModalProps({ title: "Invalid Promo", message: `The promo code "${promoCode}" is not valid.`, type: "error" });
            }
        }
        // else {
        //     // Hypothetical real API call for customer view
        //     console.log(`[Customer View] Intending to validate promo code via API: ${promoCode}`);
        //     // try {
        //     //    const response = await apiService.post('/discounts/validate-promo/', { code: promoCode, subtotal });
        //     //    setAppliedDiscount({ amount: response.data.discount_amount, code: promoCode.toUpperCase(), message: response.data.description, type: response.data.type });
        //     //    setPromoModalProps({ title: "Promo Applied!", message: response.data.description, type: "success" });
        //     // } catch (error) {
        //     //    setAppliedDiscount({ amount: 0, code: promoCode, message: error.response?.data?.detail || "Failed to validate promo.", type: 'error' });
        //     //    setPromoModalProps({ title: "Promo Error", message: error.response?.data?.detail || "Failed to validate promo.", type: "error" });
        //     // }
        // }
        setIsPromoModalOpen(true);
    }, [promoCode, subtotal, isPreviewMode]);

    const removePromoCode = useCallback(() => {
        setPromoCode("");
        setAppliedDiscount({ amount: 0, code: null, message: null, type: null });
    }, []);

    // Recalculate percentage discount if subtotal changes
    useEffect(() => {
        if (appliedDiscount.code && appliedDiscount.type === 'percentage' && appliedDiscount.code.toUpperCase() === "SAVE10") {
            const newDiscountValue = subtotal * 0.10;
            if (parseFloat(newDiscountValue.toFixed(2)) !== appliedDiscount.amount) {
                setAppliedDiscount(prev => ({
                    ...prev,
                    amount: parseFloat(newDiscountValue.toFixed(2)),
                    message: `10% discount ($${newDiscountValue.toFixed(2)}) applied!`
                }));
            }
        }
        if (subtotal === 0 && appliedDiscount.amount > 0) { // Auto-remove discount if cart becomes empty
            removePromoCode();
        }
    }, [subtotal, appliedDiscount.code, appliedDiscount.type, appliedDiscount.amount, removePromoCode]);


    const handleActualConfirmOrder = async () => {
        setIsConfirming(true);
        const orderDetailsPayload = {
            items: orderItems.map(item => ({
                id: item.originalId || item.id, // Prefer original product ID if available
                name: item.name,
                quantity: item.quantity,
                price_per_item: parseFloat(item.price),
                total_price: parseFloat(item.price) * item.quantity,
                selected_options_summary: item.selectedOptionsSummary || null
            })),
            subtotal: subtotal,
            discount_applied: appliedDiscount.amount > 0 ? {
                code: appliedDiscount.code,
                amount: appliedDiscount.amount,
                type: appliedDiscount.type, // 'percentage' or 'fixed_amount'
            } : null,
            total_amount: total,
            notes: orderNotes.trim() || null,
            table_number: tableNumber || null,
            user_name: userName || null,
        };
        await onConfirmOrderAction(orderDetailsPayload); // Parent handles actual submission/simulation
        setIsConfirming(false);
        // Parent will manage clearing orderItems etc. This panel just resets its own interaction state.
        if (!isPreviewMode) { // For customer view, clear local form state after successful order action
            setPromoCode("");
            setAppliedDiscount({ amount: 0, code: null, message: null, type: null });
            setOrderNotes("");
        }
    };

    const panelContainerClass = isSidebarVersion
        ? `h-full flex flex-col ${DEFAULT_PANEL_BG_LIGHT} ${DEFAULT_PANEL_BG_DARK} ${DEFAULT_PANEL_TEXT_LIGHT} ${DEFAULT_PANEL_TEXT_DARK} shadow-xl overflow-hidden`
        : "p-4 pt-6 pb-24 md:pt-8"; // Mobile page padding

    const innerPanelClass = isSidebarVersion
        ? "flex flex-col h-full" // Sidebar takes full height of its column
        : `${DEFAULT_PANEL_BG_LIGHT} ${DEFAULT_PANEL_BG_DARK} ${DEFAULT_PANEL_TEXT_LIGHT} ${DEFAULT_PANEL_TEXT_DARK} p-0 rounded-xl shadow-xl relative overflow-hidden flex flex-col min-h-[calc(100vh-8rem)]`; // Mobile needs min height

    const headerTextColorClass = isSidebarVersion ? "text-white dark:text-white" : "text-white dark:text-white";
    const notesLabelColorClass = isSidebarVersion ? "text-rose-100 dark:text-neutral-300/80" : "text-rose-100 dark:text-neutral-300/80";

    const renderOrderContent = () => (
        <>
            {/* Items List */}
            <div className={`p-4 sm:p-5 flex-1 ${orderItems.length > 0 ? 'overflow-y-auto scrollbar-thin scrollbar-thumb-rose-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent' : 'flex items-center justify-center'}`}>
                <AnimatePresence mode="popLayout">
                    {orderItems.length === 0 ? (
                        <motion.div
                            key="empty-order-message"
                            variants={listAnimationVariants} initial="initial" animate="animate" exit="exit"
                            className="text-center text-rose-100 dark:text-neutral-300/70 flex flex-col items-center"
                        >
                            <Icon name="shopping_basket" className="w-16 h-16 md:w-20 md:h-20 text-rose-300 dark:text-neutral-500 mb-4 opacity-60" />
                            <p className="text-lg font-medium mb-2">Your order is empty</p>
                            <p className="text-sm mb-6 text-rose-200 dark:text-neutral-400/60">
                                {isSidebarVersion ? "Add items from the menu." : (navigateToMenu ? "Tap below to browse the menu." : "Add items to get started.")}
                            </p>
                            {!isSidebarVersion && navigateToMenu && (
                                <motion.button
                                    onClick={navigateToMenu}
                                    className="bg-yellow-400 dark:bg-yellow-500 text-neutral-800 dark:text-neutral-900 font-semibold px-6 py-2.5 rounded-lg shadow-md hover:bg-yellow-300 dark:hover:bg-yellow-400 transition-colors"
                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                > Browse Menu </motion.button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="order-items-list"
                            variants={listAnimationVariants} initial="initial" animate="animate" exit="exit"
                            className="space-y-3"
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

            {/* Summary & Actions Section */}
            <AnimatePresence>
                {orderItems.length > 0 && (
                    <motion.div
                        className={`shrink-0 border-t border-rose-500/30 dark:border-neutral-700/40 ${isSidebarVersion ? 'bg-rose-700/50 dark:bg-neutral-800/50' : `${DEFAULT_PANEL_BG_LIGHT} ${DEFAULT_PANEL_BG_DARK}`}`}
                        key="order-summary-details-block"
                        variants={summarySectionVariants} initial="initial" animate="animate" exit="exit"
                    >
                        {/* Promo Code */}
                        <div className="px-4 sm:px-5 pt-4 pb-3">
                            <label htmlFor="promoCodeInput" className="sr-only">Promo Code</label>
                            <div className="flex items-center">
                                <input
                                    id="promoCodeInput" type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                                    placeholder="Promo code"
                                    className="flex-grow p-2.5 rounded-l-md text-sm text-neutral-800 dark:text-neutral-100 bg-white/90 dark:bg-neutral-700/80 focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 outline-none placeholder-neutral-500 dark:placeholder-neutral-400 border border-r-0 border-neutral-300 dark:border-neutral-600"
                                />
                                <button
                                    onClick={applyPromoCode}
                                    className="bg-yellow-400 text-neutral-800 font-semibold px-4 py-2.5 rounded-r-md hover:bg-yellow-300 dark:bg-yellow-500 dark:text-neutral-900 dark:hover:bg-yellow-400 text-sm transition-colors"
                                    aria-label="Apply Promo Code"
                                >Apply</button>
                            </div>
                            {appliedDiscount.message && (
                                <div className={`flex justify-between text-xs mt-2 items-center px-1 ${appliedDiscount.type === 'error' ? 'text-red-300 dark:text-red-400' : 'text-green-200 dark:text-green-300'}`}>
                                    <span>{appliedDiscount.message}</span>
                                    {appliedDiscount.amount > 0 && <button onClick={removePromoCode} className="text-xs underline hover:text-yellow-300 dark:hover:text-yellow-400 transition-colors">Remove</button>}
                                </div>
                            )}
                        </div>
                        {/* Order Notes */}
                        <div className="px-4 sm:px-5 pt-1 pb-4">
                            <label htmlFor="orderNotes" className={`block text-sm font-medium ${notesLabelColorClass} mb-1`}>Order Notes:</label>
                            <textarea
                                id="orderNotes" rows="2" value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)}
                                className="w-full p-2.5 rounded-md text-sm text-neutral-800 dark:text-neutral-100 bg-white/90 dark:bg-neutral-700/80 focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 outline-none placeholder-neutral-500 dark:placeholder-neutral-400 border border-neutral-300 dark:border-neutral-600"
                                placeholder="e.g., extra sauce, no onions..."
                            ></textarea>
                        </div>

                        {/* Visual Separator for Sidebar */}
                        {isSidebarVersion && (
                            <div className="relative h-0 my-3 mx-2">
                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 ${isSidebarVersion ? 'bg-rose-600 dark:bg-neutral-800' : 'bg-white dark:bg-neutral-900'} rounded-full z-10`}></div>
                                <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 ${isSidebarVersion ? 'bg-rose-600 dark:bg-neutral-800' : 'bg-white dark:bg-neutral-900'} rounded-full z-10`}></div>
                                <div className="absolute left-3 right-3 top-1/2 -translate-y-px border-t-2 border-dashed border-rose-400/50 dark:border-neutral-700/50"></div>
                            </div>
                        )}

                        {/* Totals & Confirm Button */}
                        <div className="px-4 sm:px-5 pt-3 pb-4 sm:pb-5">
                            <div className="space-y-1.5 text-sm text-rose-50 dark:text-neutral-200/90">
                                <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                {appliedDiscount.amount > 0 && (
                                    <div className="flex justify-between">
                                        <span>Discount ({appliedDiscount.code})</span>
                                        <span className="text-green-300 dark:text-green-400">-${appliedDiscount.amount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className={`flex justify-between text-lg font-bold mt-2 pt-2 border-t border-rose-500/40 dark:border-neutral-700/50 ${headerTextColorClass}`}>
                                    <span>Total</span><span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.98 }} onClick={handleActualConfirmOrder}
                                disabled={isConfirming || orderItems.length === 0}
                                className="w-full bg-yellow-400 text-neutral-800 font-bold py-3 sm:py-3.5 mt-5 sm:mt-6 rounded-lg shadow-md hover:bg-yellow-300 dark:bg-yellow-500 dark:text-neutral-900 dark:hover:bg-yellow-400 transition-colors text-base flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isConfirming ? (
                                    <><Spinner color="text-neutral-800" size="sm" className="mr-2" />{isPreviewMode ? "Processing Preview..." : "Placing Order..."}</>
                                ) : (isPreviewMode ? "Confirm Preview Order" : "Place Order")}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );

    // Main return logic for sidebar vs full page
    if (!isSidebarVersion) { // Mobile full-page view
        return (
            <div className={panelContainerClass}> {/* Outer container for mobile page padding */}
                <div className={innerPanelClass}> {/* Themed panel itself */}
                    <div className="p-4 sm:p-5 border-b border-rose-500/30 dark:border-neutral-700/40 shrink-0">
                        <div className="flex items-center justify-between">
                            <h2 className={`text-2xl font-bold ${headerTextColorClass}`}>{isPreviewMode ? "Preview Order" : "Your Order"}</h2>
                            {(tableNumber || userName) &&
                                <div className="text-xs opacity-80 text-right">
                                    {tableNumber && <span>Table: {tableNumber}</span>}
                                    {userName && <span className="block">For: {userName}</span>}
                                </div>
                            }
                        </div>
                    </div>
                    {renderOrderContent()}
                </div>
                <Modal isOpen={isPromoModalOpen} onClose={() => setIsPromoModalOpen(false)} title={promoModalProps.title} type={promoModalProps.type}>
                    <p>{promoModalProps.message}</p>
                </Modal>
            </div>
        );
    }

    // Desktop sidebar version
    return (
        <div className={panelContainerClass}> {/* Themed panel, full height for sidebar */}
            <div className="p-4 sm:p-5 border-b border-rose-500/30 dark:border-neutral-700/40 shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className={`text-xl lg:text-2xl font-bold ${headerTextColorClass}`}>{isPreviewMode ? "Preview Order" : "Your Order"}</h2>
                    {(tableNumber || userName) &&
                        <div className="text-xs opacity-80 text-right">
                            {tableNumber && <span className="block sm:inline">Table: {tableNumber}</span>}
                            {userName && <span className="block sm:inline sm:ml-2">For: {userName}</span>}
                        </div>
                    }
                </div>
            </div>
            {renderOrderContent()}
            <Modal isOpen={isPromoModalOpen} onClose={() => setIsPromoModalOpen(false)} title={promoModalProps.title} type={promoModalProps.type}>
                <p>{promoModalProps.message}</p>
            </Modal>
        </div>
    );
}

export default OrderSummaryPanel;