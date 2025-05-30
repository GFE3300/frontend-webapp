import React, {useState, useEffect} from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrderItem from "./OrderItem";
import Modal from "../../../components/animated_alerts/Modal";
import Icon from "../../../components/common/Icon";

const listAnimationVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { staggerChildren: 0.05, duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.90, y: 15, transition: { duration: 0.2, ease: 'easeIn' } }
};

const summaryAnimationVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut", delay: 0.1 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2, ease: "easeIn" } }
};


function OrderPage({ orderItems, onUpdateQuantity, onRemoveItem, onConfirmOrder, navigateToMenu, initialX, isSidebarVersion = false, tableNumber }) {
    const [promoCode, setPromoCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [orderNotes, setOrderNotes] = useState("");
    const [isConfirming, setIsConfirming] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalProps, setModalProps] = useState({ title: '', message: '', type: 'info'});

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal - discount;

    const applyPromoCode = () => {
        if (promoCode.toUpperCase() === "TEST5") {
            setDiscount(5.00);
            setModalProps({
                title: "Promo Code Applied",
                message: "Discount of $5.00 has been successfully applied.",
                type: "success"
            })
        } else {
            setDiscount(0);
            if (promoCode){
                setModalProps({
                    title: "Invalid Promo Code",
                    message: `The promo code "${promoCode}" is not valid.`,
                    type: "error"
                });
            } else {
                setModalProps({
                    title: "Promo Code Required",
                    message: "Please enter a promo code.",
                    type: "info"
                });
            }
        }
        setIsModalOpen(true);
    };

    useEffect(() => {
        if (!promoCode && discount > 0){
            setDiscount(0);
        }
    }, [promoCode, discount]);

    const handleActualConfirmOrder = async () => {
        setIsConfirming(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        onConfirmOrder({ notes: orderNotes, promo: promoCode, discount }); // Pass local state
        setIsConfirming(false);
    };

    const pageVariants = {
        initial: { opacity: 0, x: initialX || 100 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: initialX > 0 ? -100 : 100 },
    };

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.4,
    };

  return (
        <>
        {isSidebarVersion ? (
            <div className="p-4">
                <div
                    className="bg-red-600 dark:bg-red-500 text-white rounded-xl shadow-xl relative flex flex-col overflow-hidden"
                    style={{ minHeight: '300px', maxHeight: 'calc(100vh - 8rem)' }}
                >
                    <div className="p-5 border-b border-red-500/30 dark:border-red-400/40 shrink-0">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Your Order</h2>
                            {tableNumber && <span className="text-sm opacity-80">Table {tableNumber}</span>}
                        </div>
                    </div>
                    <div className={`p-5 flex-1 ${orderItems.length > 0 ? 'overflow-y-auto' : 'flex items-center justify-center'}`}>
                            <AnimatePresence mode="popLayout">
                                {orderItems.length === 0 ? (
                                    <motion.div
                                        key="empty-order-message"
                                        variants={listAnimationVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="text-center text-red-100 flex flex-col items-center"
                                    >
                                        <Icon name="shopping_basket" className="w-16 h-16 md:w-20 md:h-20 text-red-300 mb-4 opacity-50" />
                                        <p className="text-lg mb-2">Your cart is empty!</p>
                                        <p className="text-sm mb-6 text-red-200">Add some delicious items from the menu.</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="order-items-container"
                                        variants={listAnimationVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="space-y-3"
                                    >
                                        <AnimatePresence>
                                            {orderItems.map(item => (
                                                <OrderItem
                                                    key={item.id}
                                                    item={item}
                                                    onUpdateQuantity={onUpdateQuantity}
                                                    onRemoveItem={onRemoveItem}
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
                                className="shrink-0 border-t border-red-500/30 dark:border-red-400/40"
                                key="order-details-summary-block"
                                variants={summaryAnimationVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                            >
                                <div className="px-5 pt-4 pb-4 border-t border-red-500/50 dark:border-red-400/60">
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            placeholder="Enter promo code"
                                            className="flex-grow p-2.5 rounded-l-md text-sm text-gray-800 dark:text-neutral-100 bg-white/90 dark:bg-neutral-700/80 focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 outline-none placeholder-gray-500 dark:placeholder-neutral-400"
                                        />
                                        <button
                                            onClick={applyPromoCode}
                                            className="bg-yellow-400 text-gray-800 font-semibold px-4 py-2.5 rounded-r-md hover:bg-yellow-300 dark:hover:bg-yellow-500 text-sm transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {promoCode && discount > 0 && (
                                        <div className="flex justify-between text-sm text-red-100 mt-2 mb-1 items-center">
                                            <span> Promo '{promoCode}' Applied: <span className="text-green-300">-${discount.toFixed(2)}</span></span>
                                            <button onClick={() => {setPromoCode(''); setDiscount(0);}} className="text-xs underline hover:text-yellow-300 dark:hover:text-yellow-400 transition-colors">Remove</button>
                                        </div>
                                    )}
                                </div>
                                <div className="px-5 pt-2 pb-4">
                                    <label htmlFor="orderNotes" className="block text-sm font-medium text-red-100 mb-1">Special Instructions:</label>
                                    <textarea
                                        id="orderNotes"
                                        rows="2"
                                        value={orderNotes}
                                        onChange={(e) => setOrderNotes(e.target.value)}
                                        className="w-full p-2.5 rounded-md text-sm text-gray-800 dark:text-neutral-100 bg-white/90 dark:bg-neutral-700/80 focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 outline-none placeholder-gray-500 dark:placeholder-neutral-400"
                                        placeholder="e.g., extra sauce, no onions..."
                                    ></textarea>
                                </div>
                                <div className="relative h-0 my-4">
                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 ${isSidebarVersion ? 'bg-neutral-50 dark:bg-neutral-800' : 'bg-white dark:bg-neutral-900'} rounded-full z-10`}></div>
                                    <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 ${isSidebarVersion ? 'bg-neutral-50 dark:bg-neutral-800' : 'bg-white dark:bg-neutral-900'} rounded-full z-10`}></div>
                                    <div className="absolute left-4 right-4 top-1/2 -translate-y-px border-t-2 border-dashed border-red-400/70"></div>
                                </div>
                                <div className="px-5 pt-4 pb-5">
                                    <div className="space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Discount</span>
                                            <span className={discount > 0 ? "text-green-300" : ""}>-${discount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-red-500/50 dark:border-red-400/60">
                                            <span>Total</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleActualConfirmOrder}
                                        disabled={isConfirming}
                                        className="w-full bg-yellow-400 text-gray-800 font-bold py-3.5 mt-8 rounded-lg shadow-md hover:bg-yellow-300 dark:hover:bg-yellow-500 transition-colors text-base flex items-center justify-center disabled:opacity-70"
                                    >
                                        {isConfirming ? (
                                            <>
                                                <Icon name="progress_activity" className="w-5 h-5 mr-2 animate-spin" />
                                                Confirming...
                                            </>
                                        ) : (
                                            'Confirm Order'
                                        )}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        ) : (
            <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className="p-4 pt-8 pb-24"
            >
                 <div className="bg-red-600 dark:bg-red-500 text-white p-0 rounded-xl shadow-xl relative overflow-hidden">
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Order Summary</h2>
                            {tableNumber && <span className="text-sm opacity-80">Table No. {tableNumber}</span>}
                        </div>
                        <AnimatePresence mode="popLayout">
                        {orderItems.length === 0 ? (
                            <motion.div
                                key="empty-order-message"
                                variants={listAnimationVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="text-center text-red-100 py-10 flex flex-col items-center"
                            >
                                <Icon name="shopping_basket" className="w-20 h-20 text-red-300 mb-4 opacity-50" />
                                <p className="text-lg mb-2">Your cart is empty!</p>
                                <p className="text-sm mb-6 text-red-200">Add some delicious items from the menu.</p>
                                {navigateToMenu && (
                                    <motion.button
                                    onClick={navigateToMenu}
                                    className="bg-yellow-400 text-gray-800 font-semibold px-6 py-2.5 rounded-lg shadow-md hover:bg-yellow-300 transition-colors"
                                    whileHover={{ scale: 1.05, backgroundColor: "#facc15" }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Browse Menu
                                </motion.button>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="order-items-container"
                                variants={listAnimationVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="space-y-3"
                            >
                                <AnimatePresence>
                                    {orderItems.map(item => (
                                        <OrderItem
                                            key={item.id}
                                            item={item}
                                            onUpdateQuantity={onUpdateQuantity}
                                            onRemoveItem={onRemoveItem}
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
                                key="order-details-summary-block"
                                variants={summaryAnimationVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                            >
                                <div className="px-5 pt-4 pb-4 border-t border-red-500/50 dark:border-red-400/60">
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            placeholder="Enter promo code"
                                            className="flex-grow p-2.5 rounded-l-md text-sm text-gray-800 dark:text-neutral-100 bg-white/90 dark:bg-neutral-700/80 focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 outline-none placeholder-gray-500 dark:placeholder-neutral-400"
                                        />
                                        <button
                                            onClick={applyPromoCode}
                                            className="bg-yellow-400 text-gray-800 font-semibold px-4 py-2.5 rounded-r-md hover:bg-yellow-300 dark:hover:bg-yellow-500 text-sm transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {promoCode && discount > 0 && (
                                        <div className="flex justify-between text-sm text-red-100 mt-2 mb-1 items-center">
                                            <span> Promo '{promoCode}' Applied: <span className="text-green-300">-${discount.toFixed(2)}</span></span>
                                            <button onClick={() => {setPromoCode(''); setDiscount(0);}} className="text-xs underline hover:text-yellow-300 dark:hover:text-yellow-400 transition-colors">Remove</button>
                                        </div>
                                    )}
                                </div>
                                <div className="px-5 pt-2 pb-4">
                                    <label htmlFor="orderNotes" className="block text-sm font-medium text-red-100 mb-1">Special Instructions:</label>
                                    <textarea
                                        id="orderNotes"
                                        rows="2"
                                        value={orderNotes}
                                        onChange={(e) => setOrderNotes(e.target.value)}
                                        className="w-full p-2.5 rounded-md text-sm text-gray-800 dark:text-neutral-100 bg-white/90 dark:bg-neutral-700/80 focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 outline-none placeholder-gray-500 dark:placeholder-neutral-400"
                                        placeholder="e.g., extra sauce, no onions..."
                                    ></textarea>
                                </div>
                                <div className="relative h-0 my-4">
                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 ${isSidebarVersion ? 'bg-neutral-50 dark:bg-neutral-800' : 'bg-white dark:bg-neutral-900'} rounded-full z-10`}></div>
                                    <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 ${isSidebarVersion ? 'bg-neutral-50 dark:bg-neutral-800' : 'bg-white dark:bg-neutral-900'} rounded-full z-10`}></div>
                                    <div className="absolute left-4 right-4 top-1/2 -translate-y-px border-t-2 border-dashed border-red-400/70"></div>
                                </div>
                                <div className="px-5 pt-4 pb-5">
                                    <div className="space-y-1.5 text-sm">
                                        <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                        <div className="flex justify-between"><span>Discount</span><span className={discount > 0 ? "text-green-300" : ""}>-${discount.toFixed(2)}</span></div>
                                        <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-red-500/50 dark:border-red-400/60"><span>Total</span><span>${total.toFixed(2)}</span></div>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleActualConfirmOrder}
                                        disabled={isConfirming}
                                        className="w-full bg-yellow-400 text-gray-800 font-bold py-3.5 mt-8 rounded-lg shadow-md hover:bg-yellow-300 dark:hover:bg-yellow-500 transition-colors text-base flex items-center justify-center disabled:opacity-70"
                                    >
                                        {isConfirming ? (<><Icon name="progress_activity" className="w-5 h-5 mr-2 animate-spin" />Confirming...</>) : ('Confirm Order')}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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

export default OrderPage;