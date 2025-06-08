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
    pageTitle: i18n.t('live_orders_view.liveOrders.pageTitle'),
    pageSubtitle: i18n.t('live_orders_view.liveOrders.pageSubtitle'),
    loadingText: i18n.t('live_orders_view.liveOrders.loadingText'),
    errorTitle: i18n.t('live_orders_view.liveOrders.errorTitle'),
    errorBody: i18n.t('live_orders_view.liveOrders.errorBody'),
    layoutErrorTitle: i18n.t('live_orders_view.liveOrders.layoutErrorTitle'),
    layoutErrorBody: i18n.t('live_orders_view.liveOrders.layoutErrorBody'),
    noLayoutConfiguredTitle: i18n.t('live_orders_view.liveOrders.noLayoutConfiguredTitle'),
    noLayoutConfiguredBody: i18n.t('live_orders_view.liveOrders.noLayoutConfiguredBody'),

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
        IDLE: i18n.t('live_orders_view.liveOrders.status.IDLE'),
        NEW_ORDER: i18n.t('live_orders_view.liveOrders.status.NEW_ORDER'),
        WAITING: i18n.t('live_orders_view.liveOrders.status.WAITING'),
        SERVED: i18n.t('live_orders_view.liveOrders.status.SERVED'),
        NEEDS_PAYMENT: i18n.t('live_orders_view.liveOrders.status.NEEDS_PAYMENT'),
        NEEDS_ATTENTION: i18n.t('live_orders_view.liveOrders.status.NEEDS_ATTENTION'),
    },

    // --- Table Orders Modal ---
    modal: {
        title: i18n.t('live_orders_view.liveOrders.modal.title'),
        noOrdersFound: i18n.t('live_orders_view.liveOrders.modal.noOrdersFound'),
        closeButton: i18n.t('venue_management.close'),
    },

    // --- Live Order Card ---
    orderCard: {
        idLabel: i18n.t('live_orders_view.liveOrders.orderCard.idLabel'),
        statusLabel: i18n.t('live_orders_view.liveOrders.orderCard.statusLabel'),
        totalLabel: i18n.t('menu_view.menu_view.productDetailModal.totalLabel'),
        timeAgo: i18n.t('live_orders_view.liveOrders.orderCard.timeAgo'),
        expandTooltip: i18n.t('live_orders_view.liveOrders.orderCard.expandTooltip'),
        collapseTooltip: i18n.t('live_orders_view.liveOrders.orderCard.collapseTooltip'),
        itemsHeader: i18n.t('venue_management.items'),
        notesHeader: i18n.t('live_orders_view.liveOrders.orderCard.notesHeader'),
        noActions: i18n.t('live_orders_view.liveOrders.orderCard.noActions')
    },

    // Individual Order Statuses (from backend model: orders.models.OrderStatus)
    orderStatus: {
        PENDING_CONFIRMATION: i18n.t('live_orders_view.liveOrders.orderStatus.PENDING_CONFIRMATION'),
        CONFIRMED: i18n.t('live_orders_view.liveOrders.orderStatus.CONFIRMED'),
        PREPARING: i18n.t('live_orders_view.liveOrders.orderStatus.PREPARING'),
        READY_FOR_PICKUP: i18n.t('live_orders_view.liveOrders.orderStatus.READY_FOR_PICKUP'),
        SERVED: i18n.t('live_orders_view.liveOrders.status.SERVED'),
        COMPLETED: i18n.t('live_orders_view.liveOrders.orderStatus.COMPLETED'),
        CANCELLED_BY_CUSTOMER: i18n.t('live_orders_view.liveOrders.orderStatus.CANCELLED_BY_CUSTOMER'),
        CANCELLED_BY_BUSINESS: i18n.t('live_orders_view.liveOrders.orderStatus.CANCELLED_BY_BUSINESS'),
    },

    // Action Buttons
    actions: {
        confirm: i18n.t('venue_management.confirm'),
        cancel: i18n.t('live_orders_view.liveOrders.actions.cancel'),
        markServed: i18n.t('live_orders_view.liveOrders.actions.markServed'),
        markPaid: i18n.t('live_orders_view.liveOrders.actions.markPaid'),
    },

    // Commander's View Header Stats
    stats: {
        activeTables: i18n.t('live_orders_view.liveOrders.stats.activeTables'),
        totalGuests: i18n.t('live_orders_view.liveOrders.stats.totalGuests'),
        pendingOrders: i18n.t('live_orders_view.liveOrders.stats.pendingOrders'),
        totalSales: i18n.t('live_orders_view.liveOrders.stats.totalSales'),
    },
};