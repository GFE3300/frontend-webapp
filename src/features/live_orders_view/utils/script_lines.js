// src/features/live_orders_view/utils/script_lines.js

import { t as i18n_t } from '../../../i18n';

// This file contains all user-facing static text for the Live Orders View feature.
// It is ready to be processed by the i18n sync script.

export const scriptLines_liveOrders = {
    // Page-level text
    pageTitle: "Live Orders View",
    loadingText: "Loading live view...",
    errorTitle: "Could not load live view",
    errorBody: "There was an issue fetching the live order data. Please try again later.",

    // Generic labels used in multiple components
    tableLabel: {
        one: "Table {{tableNumber}}",
        other: "Table {{tableNumber}}",
    },
    guestsSummary: {
        one: "{{count}} guest",
        other: "{{count}} guests",
    },
    ordersSummary: {
        one: "{{count}} order",
        other: "{{count}} orders",
    },

    // Modal-specific text
    modal: {
        title: "Details for Table {{tableNumber}}",
        noOrdersFound: "No active orders for this table.",
        closeButton: "Close",
    },

    // Order Card specific text
    orderCard: {
        idLabel: "Order #",
        statusLabel: "Status:",
        totalLabel: "Total:",
    },

    // Status mappings for the main table overlay
    status: {
        IDLE: "Idle",
        NEW_ORDER: "New Order",
        WAITING: "Waiting",
        SERVED: "Served",
        NEEDS_PAYMENT: "Needs Payment",
        NEEDS_ATTENTION: "Needs Attention",
    },

    // Status mappings for individual orders within the modal
    orderStatus: {
        PENDING_CONFIRMATION: "Pending Confirmation",
        CONFIRMED: "Confirmed",
        PREPARING: "Preparing",
        READY_FOR_PICKUP: "Ready",
        SERVED: "Served",
        CANCELED: "Canceled", // Assuming backend uses this spelling
        CANCELLED_BY_CUSTOMER: "Canceled by Customer",
        CANCELLED_BY_BUSINESS: "Canceled by Business",
    },

    // Action button labels
    actions: {
        confirm: "Confirm Order",
        cancel: "Cancel Order",
        markServed: "Mark as Served",
    },
};

// For convenience, we can re-export the i18n function if needed,
// though direct imports into components are also fine.
export const t = (key, options) => i18n_t(key, options);