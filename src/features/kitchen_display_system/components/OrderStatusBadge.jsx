import React from 'react';
import { scriptLines_kitchenDisplaySystem } from '../utils/script_lines';

const sl = scriptLines_kitchenDisplaySystem.orderStatus;

const OrderStatusBadge = ({ status }) => {
    let bgColor, textColor, text;

    // Use the centralized status strings from the KDS script file
    const statusText = sl[status] || sl.finalized;

    switch (status) {
        case 'PENDING_CONFIRMATION':
            bgColor = 'bg-amber-100 dark:bg-amber-500/30';
            textColor = 'text-amber-700 dark:text-amber-300';
            text = statusText;
            break;
        case 'CONFIRMED':
            bgColor = 'bg-blue-100 dark:bg-blue-500/30';
            textColor = 'text-blue-700 dark:text-blue-300';
            text = statusText;
            break;
        case 'PREPARING':
            bgColor = 'bg-purple-100 dark:bg-purple-500/30';
            textColor = 'text-purple-700 dark:text-purple-300';
            text = statusText;
            break;
        case 'READY_FOR_PICKUP':
        case 'SERVED':
            bgColor = 'bg-emerald-100 dark:bg-emerald-500/30';
            textColor = 'text-emerald-700 dark:text-emerald-300';
            text = sl['SERVED']; // Always show "Served" for both states
            break;
        case 'COMPLETED':
        case 'CANCELLED_BY_BUSINESS':
        case 'CANCELLED_BY_CUSTOMER':
            bgColor = 'bg-gray-200 dark:bg-gray-700/30';
            textColor = 'text-gray-500 dark:text-gray-400';
            text = statusText;
            break;
        default:
            bgColor = 'bg-gray-100 dark:bg-gray-500/30';
            textColor = 'text-gray-700 dark:text-gray-300';
            text = status || sl.finalized;
    }

    return (
        <span className={`px-2 py-1 text-xxs sm:text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>
            {text}
        </span>
    );
};

export default OrderStatusBadge;