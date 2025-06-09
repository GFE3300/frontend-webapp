import React from 'react';
import Icon from '../../../components/common/Icon';
import OrderItemList from './OrderItemList';
import OrderStatusBadge from './OrderStatusBadge';
import { formatDistanceToNowStrict } from 'date-fns'; // For time ago

import { kitchenDisplaySystem } from '../utils/script_lines.js'; // MODIFIED: Import from local file
const sl = kitchenDisplaySystem.orderCard;

const OrderCard = ({ order, onUpdateStatus }) => {
    const timeAgo = order.orderTime ? formatDistanceToNowStrict(new Date(order.orderTime), { addSuffix: true }) : 'N/A';

    const getNextStatusAndAction = () => {
        if (order.status === 'new') return { nextStatus: 'preparing', actionText: sl.markAsPreparing || "Start Preparing" };
        if (order.status === 'preparing') return { nextStatus: 'ready', actionText: sl.markAsReady || "Mark as Ready" };
        if (order.status === 'ready') return { nextStatus: 'served', actionText: sl.markAsServed || "Mark as Served" };
        if (order.status === 'served') return { nextStatus: 'paid', actionText: sl.markAsPaid || "Mark as Paid" };
        if (order.status === 'paid') return { nextStatus: 'completed', actionText: sl.markAsCompleted || "Complete Order" };
        return { nextStatus: null, actionText: "" };
    };

    const { nextStatus, actionText } = getNextStatusAndAction();

    const cardBgColor = () => {
        switch (order.status) {
            case 'new': return 'bg-sky-50 dark:bg-sky-800/30 border-sky-300 dark:border-sky-700';
            case 'preparing': return 'bg-amber-50 dark:bg-amber-800/30 border-amber-300 dark:border-amber-700';
            case 'ready': return 'bg-emerald-50 dark:bg-emerald-800/30 border-emerald-300 dark:border-emerald-700';
            case 'served': return 'bg-neutral-100 dark:bg-neutral-800/30 border-neutral-300 dark:border-neutral-700 opacity-80';
            case 'paid': return 'bg-lime-50 dark:bg-lime-800/30 border-lime-300 dark:border-lime-700'; // New color for paid
            case 'completed': return 'bg-neutral-200 dark:bg-neutral-900/50 border-neutral-300 dark:border-neutral-700 opacity-60'; // Should be removed, but styled just in case
            default: return 'bg-white dark:bg-neutral-700/50 border-neutral-300 dark:border-neutral-600';
        }
    };

    return (
        <div className={`flex flex-col rounded-xl shadow-lg border overflow-hidden transition-all duration-300 ease-in-out ${cardBgColor()}`}>
            <div className="p-3 sm:p-4 border-b border-[inherit]">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 text-base sm:text-lg">
                        {sl.tableLabel ? sl.tableLabel.replace('{tableNumber}', order.tableNumber) : `Table ${order.tableNumber}`}
                    </h3>
                    <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {sl.orderedAtLabel ? sl.orderedAtLabel.replace('{time}', timeAgo) : `Ordered: ${timeAgo}`}
                </p>
            </div>

            <div className="p-3 sm:p-4 flex-1">
                <OrderItemList items={order.items} />
            </div>

            {nextStatus && (
                <div className="p-3 sm:p-4 border-t border-[inherit]">
                    <button
                        onClick={() => onUpdateStatus(order.id, nextStatus)}
                        className={`w-full px-3 py-2.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150
                                    ${order.status === 'new' ? 'bg-sky-500 hover:bg-sky-600 text-white' : ''}
                                    ${order.status === 'preparing' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
                                    ${order.status === 'ready' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}
                                    ${order.status === 'served' ? 'bg-slate-500 hover:bg-slate-600 text-white' : ''} 
                                    ${order.status === 'paid' ? 'bg-lime-500 hover:bg-lime-600 text-white' : ''} 
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800 focus-visible:ring-current`}
                    >
                        {actionText}
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderCard;