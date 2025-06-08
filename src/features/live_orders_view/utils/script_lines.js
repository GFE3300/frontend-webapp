import { t as i18n_t } from '../../../i18n'; // Assuming i18n setup exists

export const scriptLines_liveOrders = {
    // --- Page-level Text ---
    pageTitle: "Live Orders View",
    pageSubtitle: "A real-time overview of your venue's table activity.",
    loadingText: "Loading live view...",
    errorTitle: "Could not load live view",
    errorBody: "There was an issue fetching the live order data. Please try again later.",
    layoutErrorTitle: "Could not load venue layout",
    layoutErrorBody: "There was a problem fetching the static venue design.",
    noLayoutConfiguredTitle: "No venue layout has been configured.",
    noLayoutConfiguredBody: "An administrator can create one in the Venue Designer.",

    // --- Table Status Overlay (Aggregate Status from backend) ---
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
    status: {
        IDLE: "Idle",
        NEW_ORDER: "New Order",
        WAITING: "Waiting",
        SERVED: "Served",
        NEEDS_PAYMENT: "Needs Payment",
        NEEDS_ATTENTION: "Needs Attention",
    },

    // --- Table Orders Modal ---
    modal: {
        title: "Details for Table {{tableNumber}}",
        noOrdersFound: "No active orders for this table.",
        closeButton: "Close",
    },

    // --- Live Order Card ---
    orderCard: {
        idLabel: "Order #",
        statusLabel: "Status:",
        totalLabel: "Total:",
        timeAgo: "{{time}} ago",
        expandTooltip: "Show Details",
        collapseTooltip: "Hide Details",
        itemsHeader: "Items",
        notesHeader: "Notes",
        noActions: "No actions available."
    },

    // Individual Order Statuses (from backend model: orders.models.OrderStatus)
    orderStatus: {
        PENDING_CONFIRMATION: "Pending Confirmation",
        CONFIRMED: "Confirmed",
        PREPARING: "Preparing",
        READY_FOR_PICKUP: "Ready for Pickup",
        SERVED: "Served",
        COMPLETED: "Completed",
        CANCELLED_BY_CUSTOMER: "Canceled by Customer",
        CANCELLED_BY_BUSINESS: "Canceled by Business",
    },

    // Action Buttons
    actions: {
        confirm: "Confirm",
        cancel: "Cancel Order",
        markServed: "Mark as Served",
        markPaid: "Mark as Paid", // The new button for the SERVED state
    },

    // Commander's View Header Stats
    stats: {
        activeTables: "Active Tables",
        totalGuests: "Total Guests",
        pendingOrders: "Pending Orders",
        totalSales: "Live Sales",
    },
};

/**
 * A pre-configured convenience function for handling pluralization and interpolation.
 * Components can import and use this `t` function directly.
 * Example: `t(scriptLines_liveOrders.guestsSummary, { count: 5 })`
 * The i18n sync script is smart enough to leave this helper function intact.
 * @param {string | object} key - The translation key or a pluralization object.
 * @param {object} [options] - Interpolation or pluralization options.
 * @returns {string} The translated and interpolated string.
 */
export const t = (key, options) => {
    // If the key is a string (e.g., 'liveOrders.pageTitle'), pass it directly to i18next.
    if (typeof key === 'string') {
        return i18n_t(key, options);
    }

    // If the key is an object (for pluralization), create a temporary key and pass it.
    // This is the standard i18next pattern. We find the "real" key path.
    // Note: The sync script will create the keys `liveOrders.guestsSummary_one`, etc.
    // We just need to find the base key path. This logic is a placeholder until sync runs.
    if (typeof key === 'object' && key !== null) {
        // This dev-time logic helps before the first `sync` command is run.
        const pluralKey = options?.count === 1 ? 'one' : 'other';
        let template = key[pluralKey] || key['other'] || '';
        if (options) {
            Object.keys(options).forEach(variable => {
                template = template.replace(`{{${variable}}}`, options[variable]);
            });
        }
        return template;
    }

    return String(key); // Fallback
};