import React from 'react';
import { kitchenDisplaySystem } from '../utils/script_lines.js'; // MODIFIED: Import from local file
const sl = kitchenDisplaySystem.orderCard;

const OrderStatusBadge = ({ status }) => {
    let bgColor, textColor, text;

    switch (status) {
        case 'new':
            bgColor = 'bg-sky-100 dark:bg-sky-500/30';
            textColor = 'text-sky-700 dark:text-sky-300';
            text = sl.newStatus || 'New';
            break;
        case 'preparing':
            bgColor = 'bg-amber-100 dark:bg-amber-500/30';
            textColor = 'text-amber-700 dark:text-amber-300';
            text = sl.preparingStatus || 'Preparing';
            break;
        case 'ready':
            bgColor = 'bg-emerald-100 dark:bg-emerald-500/30';
            textColor = 'text-emerald-700 dark:text-emerald-300';
            text = sl.readyStatus || 'Ready';
            break;
        case 'served':
            bgColor = 'bg-neutral-200 dark:bg-neutral-600/30';
            textColor = 'text-neutral-600 dark:text-neutral-300';
            text = sl.servedStatus || 'Served';
            break;
        case 'paid':
            bgColor = 'bg-lime-100 dark:bg-lime-500/30';
            textColor = 'text-lime-700 dark:text-lime-300';
            text = sl.paidStatus || 'Paid';
            break;
        case 'completed': // This status will cause the card to be removed, but styled for safety.
            bgColor = 'bg-gray-200 dark:bg-gray-700/30';
            textColor = 'text-gray-500 dark:text-gray-400';
            text = sl.completedStatus || 'Completed';
            break;
        default:
            bgColor = 'bg-gray-100 dark:bg-gray-500/30';
            textColor = 'text-gray-700 dark:text-gray-300';
            text = status;
    }

    return (
        <span className={`px-2 py-1 text-xxs sm:text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>
            {text}
        </span>
    );
};

export default OrderStatusBadge;