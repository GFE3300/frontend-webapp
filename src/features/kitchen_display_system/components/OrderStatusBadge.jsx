import React from 'react';
import slRaw from '../../venue_management/utils/script_lines.js'; // Adjust path
const sl = slRaw.kitchenDisplaySystem.orderCard;

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
        case 'paid': // New case
            bgColor = 'bg-lime-100 dark:bg-lime-500/30';
            textColor = 'text-lime-700 dark:text-lime-300';
            text = sl.markAsPaid || 'Paid'; // Assuming you have a 'paidStatus' or similar in script_lines for display
                                            // For now, using markAsPaid, but 'Paid' would be better for the badge.
                                            // Let's add 'paidStatus' to script_lines later if needed.
            text = sl.paidStatus || 'Paid';
            break;
        case 'served': // or 'completed'
            bgColor = 'bg-neutral-200 dark:bg-neutral-600/30';
            textColor = 'text-neutral-600 dark:text-neutral-300';
            text = sl.servedStatus || 'Served';
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