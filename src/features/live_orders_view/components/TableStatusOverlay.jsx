import React from 'react';
import Icon from '../../../components/common/Icon';
import { scriptLines_liveOrders } from '../utils/script_lines';
import { t } from '../../../i18n'; // Import i18n t function for direct pluralization usage if needed

/**
 * Maps aggregate_status values to Tailwind CSS classes for styling.
 * The colors are chosen to be visually distinct and informative.
 */
const statusStyles = {
    IDLE: {
        bgColor: 'bg-gray-300/70 dark:bg-gray-700/70', // Slightly transparent gray
        textColor: 'text-gray-900 dark:text-gray-100',
        iconColor: 'text-gray-600 dark:text-gray-300',
        icon: 'chair_alt', // Or just 'chair'
    },
    NEW_ORDER: {
        bgColor: 'bg-green-500/80 dark:bg-green-600/80', // Green for new activity
        textColor: 'text-white',
        iconColor: 'text-white',
        icon: 'notifications', // Bell icon
    },
    WAITING: {
        bgColor: 'bg-yellow-500/80 dark:bg-yellow-600/80', // Yellow for needing attention
        textColor: 'text-white',
        iconColor: 'text-white',
        icon: 'timer', // Timer icon
    },
    SERVED: {
        bgColor: 'bg-blue-500/80 dark:bg-blue-600/80', // Blue for service completed
        textColor: 'text-white',
        iconColor: 'text-white',
        icon: 'restaurant', // Utensils icon
    },
    NEEDS_PAYMENT: {
        bgColor: 'bg-purple-500/80 dark:bg-purple-600/80', // Purple for payment required
        textColor: 'text-white',
        iconColor: 'text-white',
        icon: 'payment', // Payment icon
    },
    NEEDS_ATTENTION: {
        bgColor: 'bg-red-500/80 dark:bg-red-600/80', // Red for urgent issues
        textColor: 'text-white',
        iconColor: 'text-white',
        icon: 'error', // Error icon
    },
};

/**
 * An overlay component that displays the status of a table based on live data.
 * It is designed to be positioned absolutely over a table item rendered in the layout.
 *
 * @param {{ tableStaticData: object, tableLiveData: object | null }} props
 *        - tableStaticData: The item object from the venue layout (contains id, table_number, etc.).
 *        - tableLiveData: The corresponding live data object from the API, or null if no live data exists.
 */
const TableStatusOverlay = ({ tableStaticData, tableLiveData, onSelect }) => {
    // Default to IDLE status if no live data is available for the table
    const aggregateStatus = tableLiveData?.aggregate_status || 'IDLE';
    const statusConfig = statusStyles[aggregateStatus] || statusStyles.IDLE; // Fallback to IDLE if status is unknown

    const totalGuests = tableLiveData?.total_guests || 0;
    const orderCount = tableLiveData?.order_count || 0; // Total number of orders for this table

    // Use the i18n script lines for text, accessing the status translation directly
    const statusText = scriptLines_liveOrders.status[aggregateStatus] || aggregateStatus;
    const tableLabel = t(scriptLines_liveOrders.tableLabel, { tableNumber: tableStaticData.table_number });

    // We can add pluralization for order count here if needed, using the t() function directly.
    // Example: const ordersText = t(scriptLines_liveOrders.ordersSummary, { count: orderCount }); // Assuming you add ordersSummary to script_lines

    return (
        // Position the overlay absolutely within the parent container (which is relative)
        // Adjust top, right, bottom, left, width, height as needed to fit your layout design.
        // This example places a small badge in the top-right corner.
        <div
            className={`absolute top-1 right-1 transform translate-x-1/4 -translate-y-1/4
                        flex items-center justify-center p-1 rounded-full shadow-md
                        ${statusConfig.bgColor} ${statusConfig.textColor} text-xs font-bold
                        min-w-[1.75rem] min-h-[1.75rem] text-center
                        transition-transform duration-200 ease-in-out group-hover:scale-110`}
            onClick={onSelect}
            title={`${tableLabel} - ${statusText} (${totalGuests} guests, ${orderCount} orders)`} // Tooltip for detailed info
        >
            <Icon
                name={statusConfig.icon}
                className={`w-4 h-4 ${statusConfig.iconColor}`}
            />
            {/* Optionally display table number or guest count inside or next to the badge */}
            {/* <span className="ml-1">{tableStaticData.table_number}</span> */}
        </div>
        // Alternative: A larger overlay covering part of the table
        // <div
        //     className={`absolute inset-0 flex flex-col items-center justify-center p-2
        //                ${statusConfig.bgColor} ${statusConfig.textColor} text-sm font-bold`}
        // >
        //     <div className="text-lg font-semibold">{tableLabel}</div>
        //     <Icon name={statusConfig.icon} className={`w-6 h-6 mt-1 ${statusConfig.iconColor}`} />
        //     <div className="mt-1">{statusText}</div>
        //     {totalGuests > 0 && (
        //         <div className="text-xs mt-0.5">{totalGuests} guests</div>
        //     )}
        // </div>
    );
};

export default TableStatusOverlay;