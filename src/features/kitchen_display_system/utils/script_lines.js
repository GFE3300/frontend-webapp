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
        pageTitle: "Kitchen Orders",
        loadingOrders: "Loading Orders...",
        errorFetchingOrders: "Error fetching orders.",
        noOrdersTitle: "No Active Orders",
        noOrdersMessage: "New orders will appear here.",
        takeoutPickup: "Takeout / Pickup",
        tableLabel: "Table {{tableNumber}}",
        orderCount: {
            one: "({{count}} order)",
            other: "({{count}} orders)",
        },
    },
    // For KitchenHeader.jsx
    header: {
        filterAll: "All",
        filterNew: "New",
        filterPreparing: "Preparing",
        filterReady: "Ready",
        filterServed: "Served",
        filterPaid: "Paid",
        groupByTableToggle: "Group by Table",
    },
    // For OrderCard.jsx
    orderCard: {
        timeAgoNA: "N/A",
        lastUpdate: "Last update: {{timeAgo}}",
        pickupIdentifier: "Pickup #{{pickupCode}}",
        defaultIdentifier: "Order",
        actionStartPreparing: "Start Preparing",
        actionMarkAsReady: "Mark as Ready",
        actionConfirm: "Confirm",
        actionMarkServed: "Mark as Served",
    },
    // For OrderItemList.jsx
    orderItemList: {
        itemQuantity: "x{{quantity}}",
    },
    // For OrderStatusBadge.jsx and other components
    orderStatus: {
        PENDING_CONFIRMATION: "Pending Confirmation",
        CONFIRMED: "Confirmed",
        PREPARING: "Preparing",
        READY_FOR_PICKUP: "Ready for Pickup",
        SERVED: "Served",
        COMPLETED: "Completed",
        CANCELLED_BY_CUSTOMER: "Canceled by Customer",
        CANCELLED_BY_BUSINESS: "Canceled by Business",
        finalized: "Finalized",
    },
};