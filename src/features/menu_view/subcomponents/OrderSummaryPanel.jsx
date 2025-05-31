import React, { useState, useEffect, useMemo } from "react";
// eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";
import OrderItem from "./OrderItem";
import Modal from "../../../components/animated_alerts/Modal";
import Icon from "../../../components/common/Icon";

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

const pageContainerVariants = {
    initial: (customInitialX) => ({ opacity: 0, x: customInitialX }),
    in: { opacity: 1, x: 0 },
    out: (customExitX) => ({ opacity: 0, x: customExitX }),
};

const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4,
};


function OrderSummaryPanel({
    orderItems = [], // Default to empty array
    onUpdateQuantity,
    onConfirmOrderAction,
    navigateToMenu, // For mobile "Browse Menu" button
    isSidebarVersion = false, // True if used in desktop sidebar
    tableNumber,
    userName,
    isPreviewMode = false, // To alter button text slightly for admin preview
    initialX = 100, // For mobile page transition direction
}) {
    const [promoCode, setPromoCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState({ amount: 0, code: null, message: null, type: null });
    const [orderNotes, setOrderNotes] = useState("");
    const [isConfirming, setIsConfirming] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalProps, setModalProps] = useState({ title: '', message: '', type: 'info' });

    const { subtotal, total } = useMemo(() => {
        const currentSubtotal = orderItems.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity, 10) || 0;
            return sum + (price * quantity);
        }, 0);
        const currentTotal = currentSubtotal - appliedDiscount.amount;
        return { subtotal: currentSubtotal, total: currentTotal < 0 ? 0 : currentTotal };
    }, [orderItems, appliedDiscount.amount]);

    const applyPromoCode = () => {
        if (!promoCode.trim()) {
            setModalProps({ title: "Promo Code Required", message: "Please enter a promo code to apply.", type: "info" });
            setIsModalOpen(true);
            setAppliedDiscount({ amount: 0, code: null, message: null, type: null }); // Clear previous if any
            return;
        }
        // SIMULATED promo code logic for now
        if (promoCode.toUpperCase() === "SAVE10") {
            const discountValue = subtotal * 0.10; // 10% discount
            setAppliedDiscount({
                amount: discountValue,
                code: promoCode.toUpperCase(),
                message: `10% discount ($${discountValue.toFixed(2)}) applied!`,
                type: 'percentage'
            });
            setModalProps({ title: "Promo Applied!", message: `Discount of $${discountValue.toFixed(2)} has been applied.`, type: "success" });
        } else if (promoCode.toUpperCase() === "FIXED5") {
            const discountValue = 5.00;
            setAppliedDiscount({
                amount: discountValue,
                code: promoCode.toUpperCase(),
                message: `$${discountValue.toFixed(2)} fixed discount applied!`,
                type: 'fixed_amount'
            });
            setModalProps({ title: "Promo Applied!", message: `Discount of $${discountValue.toFixed(2)} has been applied.`, type: "success" });
        } else {
            setAppliedDiscount({ amount: 0, code: promoCode, message: "Invalid promo code.", type: 'error' });
            setModalProps({ title: "Invalid Promo", message: `The promo code "${promoCode}" is not valid.`, type: "error" });
        }
        setIsModalOpen(true);
    };

    const removePromoCode = () => {
        setPromoCode("");
        setAppliedDiscount({ amount: 0, code: null, message: null, type: null });
        // Optionally show a modal that promo was removed
    };

    useEffect(() => {
        // Re-evaluate discount if subtotal changes (e.g. item removed) and discount is percentage based
        if (appliedDiscount.code && appliedDiscount.type === 'percentage' && appliedDiscount.code.toUpperCase() === "SAVE10") {
            const newDiscountValue = subtotal * 0.10;
            if (newDiscountValue !== appliedDiscount.amount) {
                setAppliedDiscount(prev => ({ ...prev, amount: newDiscountValue, message: `10% discount ($${newDiscountValue.toFixed(2)}) applied!` }));
            }
        } else if (subtotal === 0 && appliedDiscount.amount > 0) { // Clear discount if cart becomes empty
            removePromoCode();
        }
    }, [subtotal, appliedDiscount.code, appliedDiscount.type]);


    const handleActualConfirmOrder = async () => {
        setIsConfirming(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));

        const orderDetails = {
            items: orderItems.map(item => ({ // Send a clean representation of items
                id: item.originalId || item.id, // Prefer originalId if available
                name: item.name,
                quantity: item.quantity,
                price_per_item: parseFloat(item.price), // The configured price per item
                total_price: parseFloat(item.price) * item.quantity,
                selected_options_summary: `${item.selectedSizeName || ''}${item.selectedSizeName && item.selectedExtrasNames?.length ? '; ' : ''}${item.selectedExtrasNames?.join(', ') || ''}`.trim() || null
            })),
            subtotal: subtotal,
            discount_applied: appliedDiscount.amount > 0 ? {
                code: appliedDiscount.code,
                amount: appliedDiscount.amount,
                type: appliedDiscount.type,
            } : null,
            total_amount: total,
            notes: orderNotes.trim() || null,
            table_number: tableNumber,
            user_name: userName,
        };

        onConfirmOrderAction(orderDetails); // Pass the structured details
        setIsConfirming(false);
        // Parent component will handle modal display after successful confirmation
    };

    // Dynamic transition for mobile full page view
    const customInitialX = initialX;
    const customExitX = initialX > 0 ? -100 : 100;


    const renderOrderContent = () => (
        <>
            <div className={`p-5 flex-1 ${orderItems.length > 0 ? 'overflow-y-auto scrollbar-thin scrollbar-thumb-rose-300 dark:scrollbar-thumb-rose-700 scrollbar-track-transparent' : 'flex items-center justify-center'}`}>
                <AnimatePresence mode="popLayout">
                    {orderItems.length === 0 ? (
                        <motion.div
                            key="empty-order-message"
                            variants={listAnimationVariants} // Use same variant for consistency
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="text-center text-rose-100 dark:text-rose-200/70 flex flex-col items-center"
                        >
                            <Icon name="shopping_basket" className="w-16 h-16 md:w-20 md:h-20 text-rose-300 dark:text-rose-600 mb-4 opacity-60" />
                            <p className="text-lg font-medium mb-2">Your order is empty</p>
                            <p className="text-sm mb-6 text-rose-200 dark:text-rose-300/60">
                                {isSidebarVersion ? "Add items from the menu." : "Tap below to browse the menu."}
                            </p>
                            {!isSidebarVersion && navigateToMenu && (
                                <motion.button
                                    onClick={navigateToMenu}
                                    className="bg-yellow-400 dark:bg-yellow-500 text-neutral-800 dark:text-neutral-900 font-semibold px-6 py-2.5 rounded-lg shadow-md hover:bg-yellow-300 dark:hover:bg-yellow-400 transition-colors"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    Browse Menu
                                </motion.button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="order-items-list"
                            variants={listAnimationVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="space-y-3"
                        >
                            <AnimatePresence>
                                {orderItems.map(item => (
                                    <OrderItem
                                        key={item.id} // Ensure item.id is unique (e.g., by including selected options in its generation)
                                        item={item}
                                        onUpdateQuantity={onUpdateQuantity}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {orderItems.length > 0 && (
                    <motion.div
                        className="shrink-0 border-t border-rose-500/30 dark:border-rose-400/30"
                        key="order-summary-details-block"
                        variants={summarySectionVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        <div className="px-5 pt-4 pb-3">
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    placeholder="Promo code"
                                    className="flex-grow p-2.5 rounded-l-md text-sm text-neutral-800 dark:text-neutral-100 bg-white/90 dark:bg-neutral-700/80 focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 outline-none placeholder-neutral-500 dark:placeholder-neutral-400 border border-r-0 border-neutral-300 dark:border-neutral-600"
                                />
                                <button
                                    onClick={applyPromoCode}
                                    className="bg-yellow-400 text-neutral-800 font-semibold px-4 py-2.5 rounded-r-md hover:bg-yellow-300 dark:bg-yellow-500 dark:text-neutral-900 dark:hover:bg-yellow-400 text-sm transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                            {appliedDiscount.code && (
                                <div className={`flex justify-between text-xs mt-2 items-center px-1 ${appliedDiscount.type === 'error' ? 'text-red-300 dark:text-red-400' : 'text-green-200 dark:text-green-300'}`}>
                                    <span>{appliedDiscount.message}</span>
                                    {appliedDiscount.amount > 0 && <button onClick={removePromoCode} className="text-xs underline hover:text-yellow-300 dark:hover:text-yellow-400 transition-colors">Remove</button>}
                                </div>
                            )}
                        </div>
                        <div className="px-5 pt-1 pb-4">
                            <label htmlFor="orderNotes" className="block text-sm font-medium text-rose-100 dark:text-rose-200/80 mb-1">Order Notes:</label>
                            <textarea
                                id="orderNotes"
                                rows="2"
                                value={orderNotes}
                                onChange={(e) => setOrderNotes(e.target.value)}
                                className="w-full p-2.5 rounded-md text-sm text-neutral-800 dark:text-neutral-100 bg-white/90 dark:bg-neutral-700/80 focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 outline-none placeholder-neutral-500 dark:placeholder-neutral-400 border border-neutral-300 dark:border-neutral-600"
                                placeholder="e.g., extra sauce, no onions..."
                            ></textarea>
                        </div>

                        {/* Dotted Separator */}
                        <div className="relative h-0 my-3 mx-2">
                            <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 ${isSidebarVersion ? 'bg-neutral-50 dark:bg-neutral-800' : 'bg-white dark:bg-neutral-900'} rounded-full z-10`}></div>
                            <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 ${isSidebarVersion ? 'bg-neutral-50 dark:bg-neutral-800' : 'bg-white dark:bg-neutral-900'} rounded-full z-10`}></div>
                            <div className="absolute left-3 right-3 top-1/2 -translate-y-px border-t-2 border-dashed border-rose-400/50 dark:border-rose-500/40"></div>
                        </div>

                        <div className="px-5 pt-3 pb-5">
                            <div className="space-y-1.5 text-sm text-rose-50 dark:text-rose-100/90">
                                <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between">
                                    <span>Discount</span>
                                    <span className={appliedDiscount.amount > 0 ? "text-green-300 dark:text-green-400" : ""}>
                                        -${appliedDiscount.amount.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-rose-500/40 dark:border-rose-400/50 text-white dark:text-white">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleActualConfirmOrder}
                                disabled={isConfirming || orderItems.length === 0}
                                className="w-full bg-yellow-400 text-neutral-800 font-bold py-3.5 mt-6 rounded-lg shadow-md hover:bg-yellow-300 dark:bg-yellow-500 dark:text-neutral-900 dark:hover:bg-yellow-400 transition-colors text-base flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isConfirming ? (
                                    <>
                                        <Icon name="progress_activity" className="w-5 h-5 mr-2 animate-spin" />
                                        {isPreviewMode ? "Confirming Preview..." : "Placing Order..."}
                                    </>
                                ) : (
                                    isPreviewMode ? "Confirm Preview Order" : "Place Order"
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );

    return (
        <>
            {isSidebarVersion ? ( // Desktop sidebar layout
                <div className="h-full flex flex-col"> {/* Ensure parent takes full height */}
                    <div
                        className="bg-rose-600 dark:bg-rose-800 text-white rounded-xl shadow-xl relative flex flex-col overflow-hidden h-full"
                    >
                        <div className="p-5 border-b border-rose-500/30 dark:border-rose-700/40 shrink-0">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">{isPreviewMode ? "Preview Order" : "Your Order"}</h2>
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
                </div>
            ) : ( // Mobile full page layout
                <motion.div
                    custom={customInitialX}
                    initial="initial"
                    animate="in"
                    exit="out"
                    customExit={customExitX}
                    variants={pageContainerVariants}
                    transition={pageTransition}
                    className="p-4 pt-8 pb-24" // Ensure padding for mobile nav
                >
                    <div className="bg-rose-600 dark:bg-rose-800 text-white p-0 rounded-xl shadow-xl relative overflow-hidden flex flex-col" style={{ minHeight: 'calc(100vh - 7rem)' }}> {/* Adjusted min-height */}
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">{isPreviewMode ? "Preview Order" : "Order Summary"}</h2>
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
                </motion.div>
            )}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalProps.title}
                type={modalProps.type}
            >
                <p>{modalProps.message}</p>
            </Modal>
        </>
    );
}

export default OrderSummaryPanel;