// src/features/kitchen_display_system/components/OrderCard.jsx
import React from 'react';
import OrderItemList from './OrderItemList';
import OrderStatusBadge from './OrderStatusBadge';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { scriptLines_kitchenDisplaySystem } from '../utils/script_lines';
import i18n from '../../../i18n';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon';

const sl = scriptLines_kitchenDisplaySystem.orderCard;
const slPage = scriptLines_kitchenDisplaySystem.page;
const slModal = scriptLines_kitchenDisplaySystem.modal;

const OrderCard = ({ order, onUpdateStatus, onSelectOrder }) => {
    const timeAgo = order.order_timestamp ? formatDistanceToNowStrict(parseISO(order.order_timestamp)) : (sl.timeAgoNA || 'N/A');

    const getNextStatusAndAction = () => {
        switch (order.status) {
            case 'PENDING_CONFIRMATION': return { nextStatus: 'CONFIRMED', actionText: sl.actionConfirm, icon: "check_circle" };
            case 'CONFIRMED': return { nextStatus: 'PREPARING', actionText: sl.actionStartPreparing, icon: "soup_kitchen" };
            case 'PREPARING': return { nextStatus: 'READY_FOR_PICKUP', actionText: sl.actionMarkAsReady, icon: "room_service" };
            case 'READY_FOR_PICKUP': return { nextStatus: 'SERVED', actionText: sl.actionMarkServed, icon: "done_all" };
            default: return { nextStatus: null, actionText: "", icon: null };
        }
    };

    const { nextStatus, actionText, icon: actionIcon } = getNextStatusAndAction();

    const cardStyles = () => {
        switch (order.status) {
            case 'PENDING_CONFIRMATION': return { bg: 'bg-sky-50 dark:bg-sky-900/40', border: 'border-sky-400 dark:border-sky-600', accentText: 'text-sky-600 dark:text-sky-400', actionButton: 'bg-sky-500 hover:bg-sky-600' };
            case 'CONFIRMED': return { bg: 'bg-blue-50 dark:bg-blue-900/40', border: 'border-blue-400 dark:border-blue-600', accentText: 'text-blue-600 dark:text-blue-400', actionButton: 'bg-blue-500 hover:bg-blue-600' };
            case 'PREPARING': return { bg: 'bg-amber-50 dark:bg-amber-900/40', border: 'border-amber-400 dark:border-amber-500', accentText: 'text-amber-600 dark:text-amber-400', actionButton: 'bg-amber-500 hover:bg-amber-600' };
            case 'READY_FOR_PICKUP': return { bg: 'bg-emerald-50 dark:bg-emerald-900/40', border: 'border-emerald-400 dark:border-emerald-500', accentText: 'text-emerald-600 dark:text-emerald-400', actionButton: 'bg-emerald-500 hover:bg-emerald-600' };
            case 'SERVED': return { bg: 'bg-neutral-100 dark:bg-neutral-800/60', border: 'border-neutral-300 dark:border-neutral-700', accentText: 'text-neutral-500', actionButton: 'bg-neutral-500' };
            default: return { bg: 'bg-white dark:bg-neutral-800', border: 'border-neutral-300 dark:border-neutral-700', accentText: 'text-neutral-600', actionButton: 'bg-slate-500' };
        }
    };

    const { bg, border, accentText, actionButton } = cardStyles();

    const orderIdentifier = order.table_number
        ? i18n.t(slPage.tableLabel, { tableNumber: order.table_number })
        : (order.pickup_code ? i18n.t(sl.pickupIdentifier, { pickupCode: order.pickup_code }) : (sl.defaultIdentifier || 'Order'));

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`flex flex-col rounded-2xl shadow-lg border-2 ${bg} ${border} overflow-hidden h-full`}
        >
            <div
                className="p-4 cursor-pointer flex-grow"
                onClick={onSelectOrder}
            >
                <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold text-xl ${accentText}`}>
                        {orderIdentifier}
                    </h3>
                    <OrderStatusBadge status={order.status} />
                </div>
                <div className={`flex items-center text-xs mb-4 ${accentText}`}>
                    <Icon name="timer" className="w-4 h-4 mr-1.5" />
                    <span>{i18n.t(sl.timeAgo, { time: timeAgo })}</span>
                </div>

                <div className="space-y-1">
                    <OrderItemList items={order.items} isDetailed={false} />
                </div>
            </div>

            {nextStatus && (
                <div className="p-3 bg-black/5 dark:bg-black/10 mt-auto">
                    <button
                        onClick={() => onUpdateStatus({ orderId: order.id, status: nextStatus })}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-white transition-colors duration-150 ${actionButton} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800 focus-visible:ring-current`}
                    >
                        {actionIcon && <Icon name={actionIcon} className="w-5 h-5" />}
                        {actionText}
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default OrderCard;