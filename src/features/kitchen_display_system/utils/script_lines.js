/**
 * @auto-managed
 *
 * This file is managed by the I18N script. Any manual changes to this file will be
 * overwritten during the next synchronization. To add or modify text, please
 * update the original string in this file and then run the 'sync' command.
 *
 * @last-synced 2025-06-10 21:51:03 UTC
 */

import i18n from '../../../i18n';

// src/features/kitchen_display_system/utils/script_lines.js
/**
 * Internationalization strings for the Kitchen Display System feature.
 * This file is managed by the I18N script.
 *
 * As per the workflow, this file contains the initial English strings.
 * The 'sync' command will process this file to generate i18n keys
 * and transform the values into t() function calls.
 */
export const scriptLines_kitchenDisplaySystem = {
    // For KitchenDisplayPage.jsx
    page: {
        pageTitle: "Kitchen Display System",
        loadingOrders: "Loading Live Orders...",
        errorFetchingOrders: "Error Fetching Orders",
        noOrdersTitle: "No Orders to Display",
        noOrdersMessage: "When a new order comes in, it will appear here.",
        takeoutPickup: "Takeout / Pickup",
        tableLabel: "Table #{{tableNumber}}",
        orderCount: {
            one: "{{count}} order",
            other: "{{count}} orders",
        },
    },
    // For KitchenHeader.jsx
    header: {
        filterAll: "All",
        filterPending: "Pending",
        filterConfirmed: "Confirmed",
        filterPreparing: "Preparing",
        filterServed: "Served",
        groupByTableToggle: "Group by Table",
    },
    // For OrderCard.jsx
    orderCard: {
        timeAgoNA: "N/A",
        lastUpdate: "Updated {{time}} ago", // This is used in the old version, can be removed if not used
        timeAgo: "{{time}} ago", // NEW: A more direct way of saying it
        pickupIdentifier: "Pickup #{{pickupCode}}",
        defaultIdentifier: "Order",
        actionStartPreparing: "Start Preparing",
        actionMarkAsReady: "Mark as Ready",
        actionConfirm: "Confirm Order",
        actionMarkServed: "Mark as Served",
    },
    // For OrderItemList.jsx
    orderItemList: {
        itemQuantity: "x{{count}}", // Old, can be replaced by the badge in the new design
        moreItems: {
            one: "+{{count}} more item",
            other: "+{{count}} more items",
        }, // NEW
    },
    // For OrderStatusBadge.jsx and other components
    orderStatus: {
        PENDING_CONFIRMATION: "Pending",
        CONFIRMED: "Confirmed",
        PREPARING: "Preparing",
        READY_FOR_PICKUP: "Ready",
        SERVED: "Served",
        COMPLETED: "Completed",
        CANCELLED_BY_CUSTOMER: "Cancelled (Customer)",
        CANCELLED_BY_BUSINESS: "Cancelled (Business)",
        finalized: "Finalized",
    },
    // NEW: For OrderDetailModal.jsx
    modal: {
        title: "Order Details: {{identifier}}",
        notes: "Order Notes",
        items: "Items",
        close: "Close",
        price: "${{val}}", // Example for price formatting
    },
};