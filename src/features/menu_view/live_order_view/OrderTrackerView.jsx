import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderTracking } from '../hooks/useOrderTracking';
import Icon from '../../../components/common/Icon';
import Spinner from '../../../components/common/Spinner';

// --- Theming & Status Mapping ---
// Maps backend statuses to UI themes for a dynamic and engaging experience.
const statusConfig = {
    PENDING_CONFIRMATION: {
        bgColor: "bg-gradient-to-br from-amber-400 to-amber-600",
        textColor: "text-white",
        icon: "hourglass_top",
        title: "Waiting for Confirmation",
        message: "The kitchen will confirm your order shortly."
    },
    CONFIRMED: {
        bgColor: "bg-gradient-to-br from-sky-500 to-sky-700",
        textColor: "text-white",
        icon: "thumb_up",
        title: "Order Confirmed!",
        message: "We've received your order and will start preparing it soon."
    },
    PREPARING: {
        bgColor: "bg-gradient-to-br from-indigo-500 to-indigo-700",
        textColor: "text-white",
        icon: "soup_kitchen",
        title: "Your Order is Being Prepared",
        message: "Our chefs are working their magic. It won't be long!"
    },
    SERVED: {
        bgColor: "bg-gradient-to-br from-lime-500 to-lime-700",
        textColor: "text-white",
        icon: "room_service",
        title: "Your Order is on its Way!",
        message: "Look out for our staff bringing your items."
    },
    READY_FOR_PICKUP: {
        bgColor: "bg-gradient-to-br from-teal-500 to-teal-700",
        textColor: "text-white",
        icon: "local_mall",
        title: "Ready for Pickup!",
        message: "Please show your pickup code at the counter."
    },
    COMPLETED: {
        bgColor: "bg-gradient-to-br from-green-500 to-green-700",
        textColor: "text-white",
        icon: "check_circle",
        title: "Order Complete!",
        message: "Thank you for your order. Enjoy!"
    },
    CANCELLED_BY_BUSINESS: {
        bgColor: "bg-gradient-to-br from-slate-600 to-slate-800",
        textColor: "text-white",
        icon: "cancel",
        title: "Order Cancelled",
        message: "There was an issue with the order. Please see staff for details."
    },
    CANCELLED_BY_CUSTOMER: {
        bgColor: "bg-gradient-to-br from-slate-600 to-slate-800",
        textColor: "text-white",
        icon: "cancel",
        title: "Order Cancelled",
        message: "Your order has been successfully cancelled."
    },
    default: {
        bgColor: "bg-gradient-to-br from-slate-500 to-slate-700",
        textColor: "text-white",
        icon: "help_outline",
        title: "Order Status Unknown",
        message: "We're currently updating the order status."
    }
};

/**
 * A small, self-contained component to display a running timer since a given start time.
 */
const Timer = ({ startTime }) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!startTime) return;
        const start = new Date(startTime).getTime();
        const interval = setInterval(() => {
            setElapsed(Date.now() - start);
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    return <span className="tabular-nums">{formatTime(elapsed)}</span>;
};

export default function OrderTrackerView({ orderId, onReturnToMenu }) {
    const { data: order, isLoading, isError, error, isFetching } = useOrderTracking(orderId);

    // Determine the current configuration based on order status, with a fallback.
    const config = statusConfig[order?.status] || statusConfig.default;

    if (isLoading && !order) {
        return (
            <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 flex items-center justify-center z-[200]">
                <Spinner size="xl" message="Loading your order status..." />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="fixed inset-0 bg-red-100 dark:bg-red-900/50 flex flex-col items-center justify-center p-8 text-center z-[200]">
                <Icon name="error" className="w-24 h-24 text-red-500 mb-6" style={{ fontSize: "6rem" }} />
                <h2 className="text-2xl font-bold text-red-700 dark:text-red-200 font-montserrat">Could Not Load Order</h2>
                <p className="text-red-600 dark:text-red-300 mt-2 max-w-md">{error?.message || "An unknown error occurred. Please show this screen to a staff member."}</p>
                <button onClick={onReturnToMenu} className="mt-8 px-6 py-2 bg-red-600 text-white font-semibold rounded-full shadow-lg hover:bg-red-700 transition-colors">
                    Back to Menu
                </button>
            </div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                key={order?.status || 'loading'}
                className={`fixed inset-0 flex flex-col items-center justify-center p-6 text-center z-[150] ${config.textColor} ${config.bgColor}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.8, ease: "easeInOut" } }}
                exit={{ opacity: 0, transition: { duration: 0.4 } }}
            >
                {/* Subtle decorative background animation */}
                <motion.div className="absolute inset-0 opacity-20 animate-[pulse_6s_cubic-bezier(0.4,0,0.6,1)_infinite]" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)' }} />

                {isFetching && !isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-4 right-4">
                        <Spinner size="sm" color="text-white" />
                    </motion.div>
                )}

                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1, transition: { delay: 0.2, type: 'spring', stiffness: 260, damping: 20 } }}>
                    <Icon name={config.icon} className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-lg" style={{ fontSize: "8rem" }} />
                </motion.div>

                <motion.h1
                    className="mt-6 text-3xl sm:text-4xl font-bold font-montserrat drop-shadow-md"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { delay: 0.4, duration: 0.5 } }}
                >
                    {config.title}
                </motion.h1>

                <motion.p
                    className="mt-2 text-base sm:text-lg opacity-90 max-w-md drop-shadow"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { delay: 0.5, duration: 0.5 } }}
                >
                    {config.message}
                </motion.p>

                {order?.pickup_code && (
                    <motion.div className="mt-8" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.6, duration: 0.5 } }}>
                        <p className="text-sm font-semibold opacity-80 uppercase tracking-widest">Pickup Code</p>
                        <p className="text-5xl font-mono font-bold tracking-widest bg-white/20 dark:bg-black/20 px-6 py-3 rounded-xl mt-1">{order.pickup_code}</p>
                    </motion.div>
                )}

                <motion.div
                    className="absolute bottom-20 text-center text-sm font-medium opacity-70"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 1, duration: 1 } }}
                >
                    <p>Time in current state: <Timer startTime={order.last_updated_timestamp} /></p>
                </motion.div>

                <motion.div
                    className="absolute bottom-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 1.2, duration: 1 } }}
                >
                    <button onClick={onReturnToMenu} className="px-5 py-2.5 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-full text-sm font-semibold hover:bg-white/30 dark:hover:bg-black/30 transition-colors">
                        Place Another Order
                    </button>
                </motion.div>

            </motion.div>
        </AnimatePresence>
    );
}