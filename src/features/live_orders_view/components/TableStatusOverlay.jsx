import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import { scriptLines_liveOrders, t } from '../utils/script_lines';

const statusStyles = {
    IDLE: {
        bgColor: 'bg-gray-400/80 dark:bg-gray-700/80 hover:bg-gray-500/90',
        textColor: 'text-white',
        icon: 'chair_alt',
    },
    NEW_ORDER: {
        // REFINED: Added pulsing ring for higher visibility
        bgColor: 'bg-green-500/90 dark:bg-green-600/90 hover:bg-green-600/100 ring-4 ring-green-500/50 animate-pulse',
        textColor: 'text-white font-bold',
        icon: 'notifications_active',
    },
    WAITING: {
        bgColor: 'bg-yellow-500/90 dark:bg-yellow-600/90 hover:bg-yellow-600/100',
        textColor: 'text-white',
        icon: 'hourglass_top',
    },
    SERVED: {
        bgColor: 'bg-blue-500/90 dark:bg-blue-600/90 hover:bg-blue-600/100',
        textColor: 'text-white',
        icon: 'restaurant',
    },
    NEEDS_PAYMENT: {
        bgColor: 'bg-purple-600/90 dark:bg-purple-700/90 hover:bg-purple-700/100',
        textColor: 'text-white',
        icon: 'payment',
    },
    NEEDS_ATTENTION: {
        // REFINED: Added pulsing ring for higher visibility
        bgColor: 'bg-red-600/90 dark:bg-red-700/90 hover:bg-red-700/100 ring-4 ring-red-500/50 animate-pulse',
        textColor: 'text-white font-bold',
        icon: 'error',
    },
};

// --- NEW: Jiggle animation definition for framer-motion ---
const jiggleAnimation = {
    x: [0, -1, 1, -1, 1, 0],
    transition: {
        duration: 0.4,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "easeInOut"
    }
};

const TableStatusOverlay = ({ tableStaticData, tableLiveData, onSelect }) => {
    const aggregateStatus = tableLiveData?.aggregate_status || 'IDLE';
    const statusConfig = statusStyles[aggregateStatus] || statusStyles.IDLE;

    // --- REFINED: Smart indicator logic ---
    const isIdle = aggregateStatus === 'IDLE';
    const isNewOrder = aggregateStatus === 'NEW_ORDER';

    const statusText = t(scriptLines_liveOrders.status[aggregateStatus]) || aggregateStatus;
    const tableNumber = tableStaticData.item_specific_props.table_number;
    const guestsText = t(scriptLines_liveOrders.guestsSummary, { count: tableLiveData?.total_guests || 0 });
    const ordersText = t(scriptLines_liveOrders.ordersSummary, { count: tableLiveData?.order_count || 0 });

    const tooltipText = `Table ${tableNumber} - ${statusText} (${guestsText}, ${ordersText})`;

    return (
        <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-1 rounded-md
                       cursor-pointer group transition-all duration-300 transform hover:scale-105
                       ${statusConfig.bgColor} ${statusConfig.textColor}`}
            onClick={onSelect}
            title={tooltipText}
            role="button"
            aria-label={tooltipText}
        >
            {/* TYPOGRAPHY: font-montserrat for table number */}
            { isIdle &&
            <div className="text-lg font-semibold font-montserrat">{tableNumber}</div>
            }

            {/* --- REFINED: Animate presence of status details --- */}
            <AnimatePresence>
                {!isIdle && (
                    <motion.div
                        key="status-details"
                        className="flex flex-col items-center justify-center"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.1 }}
                    >
                        <motion.div animate={isNewOrder ? jiggleAnimation : {}}>
                            {/* ICON: Sizing mandate */}
                            <Icon name={statusConfig.icon} style={{ fontSize: '1.5rem' }} className="mt-1" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TableStatusOverlay;