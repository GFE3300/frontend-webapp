/**
 * @auto-managed
 *
 * This file is managed by the I18N script. Any manual changes to this file will be
 * overwritten during the next synchronization. To add or modify text, please
 * update the original string in this file and then run the 'sync' command.
 *
 * @last-synced 2025-06-08 16:10:15 UTC
 */

import i18n from '../../../i18n';

// This file will be processed by the i18n sync script.
// It should only contain the object with the text strings.

export const scriptLines_liveOrders = {
    // --- Page-level Text ---
    pageTitle: i18n.t('live_orders_view.liveOrders.pageTitle'), // "Live Orders View"
    pageSubtitle: i18n.t('live_orders_view.liveOrders.pageSubtitle'), // "A real-time overview of your venue's table activity."
    loadingText: i18n.t('live_orders_view.liveOrders.loadingText'), // "Loading live view..."
    errorTitle: i18n.t('live_orders_view.liveOrders.errorTitle'), // "Could not load live view"
    errorBody: i18n.t('live_orders_view.liveOrders.errorBody'), // "There was an issue fetching the live order data. Please try again later."
    layoutErrorTitle: i18n.t('live_orders_view.liveOrders.layoutErrorTitle'), // "Could not load venue layout"
    layoutErrorBody: i18n.t('live_orders_view.liveOrders.layoutErrorBody'), // "There was a problem fetching the static venue design."
    noLayoutConfiguredTitle: i18n.t('live_orders_view.liveOrders.noLayoutConfiguredTitle'), // "No venue layout has been configured."
    noLayoutConfiguredBody: i18n.t('live_orders_view.liveOrders.noLayoutConfiguredBody'), // "An administrator can create one in the Venue Designer."
    status: {
        IDLE: i18n.t('live_orders_view.liveOrders.status.IDLE'), // "Idle"
        NEW_ORDER: i18n.t('live_orders_view.liveOrders.status.NEW_ORDER'), // "New Order"
        WAITING: i18n.t('live_orders_view.liveOrders.status.WAITING'), // "Waiting"
        SERVED: i18n.t('live_orders_view.liveOrders.status.SERVED'), // "Served"
        NEEDS_PAYMENT: i18n.t('live_orders_view.liveOrders.status.NEEDS_PAYMENT'), // "Needs Payment"
        NEEDS_ATTENTION: i18n.t('live_orders_view.liveOrders.status.NEEDS_ATTENTION'), // "Needs Attention"
    },

    // --- Table Orders Modal ---
    modal: {
        title: i18n.t('live_orders_view.liveOrders.modal.title'), // "Details for Table {{tableNumber}}"
        noOrdersFound: i18n.t('live_orders_view.liveOrders.modal.noOrdersFound'), // "No active orders for this table."
        closeButton: i18n.t('venue_management.close'), // "Close"
    },

    // --- Live Order Card ---
    orderCard: {
        idLabel: i18n.t('live_orders_view.liveOrders.orderCard.idLabel'), // "Order #"
        statusLabel: i18n.t('live_orders_view.liveOrders.orderCard.statusLabel'), // "Status:"
        totalLabel: i18n.t('menu_view.menu_view.productDetailModal.totalLabel'), // "Total:"
        timeAgo: i18n.t('live_orders_view.liveOrders.orderCard.timeAgo'), // "{{time}} ago"
        expandTooltip: i18n.t('live_orders_view.liveOrders.orderCard.expandTooltip'), // "Show Details"
        collapseTooltip: i18n.t('live_orders_view.liveOrders.orderCard.collapseTooltip'), // "Hide Details"
        itemsHeader: i18n.t('venue_management.items'), // "Items"
        notesHeader: i18n.t('live_orders_view.liveOrders.orderCard.notesHeader'), // "Notes"
        noActions: i18n.t('live_orders_view.liveOrders.orderCard.noActions') // "No actions available."
    },

    // Individual Order Statuses (from backend model: orders.models.OrderStatus)
    orderStatus: {
        PENDING_CONFIRMATION: i18n.t('live_orders_view.liveOrders.orderStatus.PENDING_CONFIRMATION'), // "Pending Confirmation"
        CONFIRMED: i18n.t('live_orders_view.liveOrders.orderStatus.CONFIRMED'), // "Confirmed"
        PREPARING: i18n.t('live_orders_view.liveOrders.orderStatus.PREPARING'), // "Preparing"
        READY_FOR_PICKUP: i18n.t('live_orders_view.liveOrders.orderStatus.READY_FOR_PICKUP'), // "Ready for Pickup"
        SERVED: i18n.t('live_orders_view.liveOrders.status.SERVED'), // "Served"
        COMPLETED: i18n.t('live_orders_view.liveOrders.orderStatus.COMPLETED'), // "Completed"
        CANCELLED_BY_CUSTOMER: i18n.t('live_orders_view.liveOrders.orderStatus.CANCELLED_BY_CUSTOMER'), // "Canceled by Customer"
        CANCELLED_BY_BUSINESS: i18n.t('live_orders_view.liveOrders.orderStatus.CANCELLED_BY_BUSINESS'), // "Canceled by Business"
    },

    // Action Buttons
    actions: {
        confirm: i18n.t('venue_management.confirm'), // "Confirm"
        cancel: i18n.t('live_orders_view.liveOrders.actions.cancel'), // "Cancel Order"
        markServed: i18n.t('live_orders_view.liveOrders.actions.markServed'), // "Mark as Served"
        markPaid: i18n.t('live_orders_view.liveOrders.actions.markPaid'), // "Mark as Paid"
    },

    // Commander's View Header Stats
    stats: {
        activeTables: i18n.t('live_orders_view.liveOrders.stats.activeTables'), // "Active Tables"
        totalGuests: i18n.t('live_orders_view.liveOrders.stats.totalGuests'), // "Total Guests"
        pendingOrders: i18n.t('live_orders_view.liveOrders.stats.pendingOrders'), // "Pending Orders"
        totalSales: i18n.t('live_orders_view.liveOrders.stats.totalSales'), // "Live Sales"
    },

    tableLabel: i18n.t('live_orders_view.liveOrders.tableLabel'), // "Table {{tableNumber}}"

    guestsSummary: i18n.t('live_orders_view.liveOrders.guestsSummary'), // "{{count}} guest"
    
    ordersSummary: i18n.t('live_orders_view.liveOrders.ordersSummary'), // "{{count}} orders"
};