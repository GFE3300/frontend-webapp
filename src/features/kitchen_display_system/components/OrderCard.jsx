import React from 'react';
import OrderItemList from './OrderItemList';
import OrderStatusBadge from './OrderStatusBadge';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { scriptLines_kitchenDisplaySystem } from '../utils/script_lines';
import i18n from '../../../i18n';

const sl = scriptLines_kitchenDisplaySystem.orderCard;
const slPage = scriptLines_kitchenDisplaySystem.page;

const OrderCard = ({ order, onUpdateStatus }) => {
    const timeAgo = order.last_updated_timestamp ? formatDistanceToNowStrict(parseISO(order.last_updated_timestamp), { addSuffix: true }) : (sl.timeAgoNA || 'N/A');

    const getNextStatusAndAction = () => {
        switch (order.status) {
            case 'PENDING_CONFIRMATION':
                return { nextStatus: 'CONFIRMED', actionText: sl.actionConfirm || "Confirm" };
            case 'CONFIRMED':
                return { nextStatus: 'PREPARING', actionText: sl.actionStartPreparing || "Start Preparing" };
            case 'PREPARING':
                return { nextStatus: 'READY_FOR_PICKUP', actionText: sl.actionMarkAsReady || "Mark as Ready" };
            case 'READY_FOR_PICKUP':
                return { nextStatus: 'SERVED', actionText: sl.actionMarkServed || "Mark as Served" };
            default:
                return { nextStatus: null, actionText: "" };
        }
    };

    const { nextStatus, actionText } = getNextStatusAndAction();

    const cardBgColor = () => {
        switch (order.status) {
            case 'PENDING_CONFIRMATION': return 'bg-sky-50 dark:bg-sky-800/30 border-sky-300 dark:border-sky-700';
            case 'CONFIRMED': return 'bg-blue-50 dark:bg-blue-800/30 border-blue-300 dark:border-blue-700';
            case 'PREPARING': return 'bg-amber-50 dark:bg-amber-800/30 border-amber-300 dark:border-amber-700';
            case 'READY_FOR_PICKUP': return 'bg-emerald-50 dark:bg-emerald-800/30 border-emerald-300 dark:border-emerald-700';
            case 'SERVED': return 'bg-neutral-100 dark:bg-neutral-800/30 border-neutral-300 dark:border-neutral-700 opacity-80';
            default: return 'bg-white dark:bg-neutral-700/50 border-neutral-300 dark:border-neutral-600';
        }
    };

    const actionButtonColor = () => {
        switch (order.status) {
            case 'PENDING_CONFIRMATION': return 'bg-sky-500 hover:bg-sky-600 text-white';
            case 'CONFIRMED': return 'bg-blue-500 hover:bg-blue-600 text-white';
            case 'PREPARING': return 'bg-amber-500 hover:bg-amber-600 text-white';
            case 'READY_FOR_PICKUP': return 'bg-emerald-500 hover:bg-emerald-600 text-white';
            default: return 'bg-slate-500 hover:bg-slate-600 text-white';
        }
    };

    const orderIdentifier = order.table_number
        ? i18n.t(slPage.tableLabel, { tableNumber: order.table_number })
        : (order.pickup_code ? i18n.t(sl.pickupIdentifier, { pickupCode: order.pickup_code }) : (sl.defaultIdentifier || 'Order'));

    return (
        <div className={`flex flex-col rounded-xl shadow-lg border overflow-hidden transition-all duration-300 ease-in-out ${cardBgColor()}`}>
            <div className="p-3 sm:p-4 border-b border-[inherit]">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 text-base sm:text-lg">
                        {orderIdentifier}
                    </h3>
                    <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {i18n.t(sl.lastUpdate, { timeAgo: timeAgo })}
                </p>
            </div>

            <div className="p-3 sm:p-4 flex-1">
                <OrderItemList items={order.items} />
            </div>

            {nextStatus && (
                <div className="p-3 sm:p-4 border-t border-[inherit]">
                    <button
                        onClick={() => onUpdateStatus({ orderId: order.id, status: nextStatus })}
                        className={`w-full px-3 py-2.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 ${actionButtonColor()} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800 focus-visible:ring-current`}
                    >
                        {actionText}
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderCard;