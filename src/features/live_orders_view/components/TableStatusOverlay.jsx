import React from 'react';
import Icon from '../../../components/common/Icon';
import { scriptLines_liveOrders, t } from '../utils/script_lines';

/**
 * Maps aggregate_status values to Tailwind CSS classes for styling.
 * The colors are chosen to be visually distinct and informative.
 */
const statusStyles = {
    IDLE: {
        bgColor: 'bg-gray-400/80 dark:bg-gray-700/80',
        textColor: 'text-white',
        icon: 'chair_alt',
    },
    NEW_ORDER: {
        bgColor: 'bg-green-500/90 dark:bg-green-600/90 ring-4 ring-green-500/50 animate-pulse',
        textColor: 'text-white',
        icon: 'notifications_active',
    },
    WAITING: {
        bgColor: 'bg-yellow-500/90 dark:bg-yellow-600/90',
        textColor: 'text-white',
        icon: 'hourglass_top',
    },
    SERVED: {
        bgColor: 'bg-blue-500/90 dark:bg-blue-600/90',
        textColor: 'text-white',
        icon: 'restaurant',
    },
    NEEDS_PAYMENT: {
        bgColor: 'bg-purple-600/90 dark:bg-purple-700/90',
        textColor: 'text-white',
        icon: 'payment',
    },
    NEEDS_ATTENTION: {
        bgColor: 'bg-red-600/90 dark:bg-red-700/90 ring-4 ring-red-500/50 animate-pulse',
        textColor: 'text-white',
        icon: 'error',
    },
};

/**
 * An overlay component that displays the status of a table based on live data.
 * It is designed to be positioned absolutely over a table item rendered in the layout.
 *
 * @param {{ 
 *   tableStaticData: object, 
 *   tableLiveData: object | null,
 *   onSelect: () => void
 * }} props
 *        - tableStaticData: The item object from the venue layout (contains id, table_number, etc.).
 *        - tableLiveData: The corresponding live data object from the API, or null if no live data exists.
 *        - onSelect: A function to call when the overlay is clicked.
 */
const TableStatusOverlay = ({ tableStaticData, tableLiveData, onSelect }) => {
    // Default to IDLE status if no live data is available for the table
    const aggregateStatus = tableLiveData?.aggregate_status || 'IDLE';
    const statusConfig = statusStyles[aggregateStatus] || statusStyles.IDLE; // Fallback to IDLE if status is unknown

    const totalGuests = tableLiveData?.total_guests || 0;
    const orderCount = tableLiveData?.order_count || 0;

    // Use the i18n script lines for text and the `t` function for pluralization
    const statusText = scriptLines_liveOrders.status[aggregateStatus] || aggregateStatus;
    const tableLabel = t(scriptLines_liveOrders.tableLabel, { tableNumber: tableStaticData.item_specific_props.table_number });
    const guestsText = t(scriptLines_liveOrders.guestsSummary, { count: totalGuests });
    const ordersText = t(scriptLines_liveOrders.ordersSummary, { count: orderCount });

    const tooltipText = `${tableLabel} - ${statusText} (${guestsText}, ${ordersText})`;

    return (
        <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-2 rounded-md 
                       cursor-pointer group transition-all duration-300
                       ${statusConfig.bgColor} ${statusConfig.textColor}`}
            onClick={onSelect}
            title={tooltipText}
            role="button"
            aria-label={tooltipText}
        >
            <div className="text-lg font-semibold">{tableStaticData.item_specific_props.table_number}</div>
            <Icon name={statusConfig.icon} className="w-6 h-6 mt-1" />
            <div className="mt-1 text-xs font-medium uppercase tracking-wider">{statusText}</div>
        </div>
    );
};

export default TableStatusOverlay;