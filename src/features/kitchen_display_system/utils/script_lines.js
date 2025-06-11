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
        pageTitle: i18n.t('kitchen_display_system.kitchenDisplaySystem.page.pageTitle'),
        loadingOrders: i18n.t('kitchen_display_system.kitchenDisplaySystem.page.loadingOrders'),
        errorFetchingOrders: i18n.t('kitchen_display_system.kitchenDisplaySystem.page.errorFetchingOrders'),
        noOrdersTitle: i18n.t('kitchen_display_system.kitchenDisplaySystem.page.noOrdersTitle'),
        noOrdersMessage: i18n.t('kitchen_display_system.kitchenDisplaySystem.page.noOrdersMessage'),
        takeoutPickup: i18n.t('kitchen_display_system.kitchenDisplaySystem.page.takeoutPickup'),
        tableLabel: i18n.t('dashboard.dashboard.occupancyCard.tableLabel'),
        orderCount: i18n.t('kitchen_display_system.kitchenDisplaySystem.page.orderCount'),
    },
    // For KitchenHeader.jsx
    header: {
        filterAll: i18n.t('menu_view.menu_view.categoryFilterBar.allCategoryName'),
        filterPending: i18n.t('dashboard.dashboard.liveOrdersCard.funnelLabelPending'),
        filterConfirmed: i18n.t('live_orders_view.liveOrders.orderStatus.CONFIRMED'),
        filterPreparing: i18n.t('live_orders_view.liveOrders.orderStatus.PREPARING'),
        filterServed: i18n.t('live_orders_view.liveOrders.status.SERVED'),
        groupByTableToggle: i18n.t('kitchen_display_system.kitchenDisplaySystem.header.groupByTableToggle'),
    },
    // For OrderCard.jsx
    orderCard: {
        timeAgoNA: i18n.t('add_product_modal.recipeComponentRow.estimatedCostNA'),
        lastUpdate: i18n.t('kitchen_display_system.kitchenDisplaySystem.orderCard.lastUpdate'), // This is used in the old version, can be removed if not used
        timeAgo: i18n.t('live_orders_view.liveOrders.orderCard.timeAgo'), // NEW: A more direct way of saying it
        pickupIdentifier: i18n.t('kitchen_display_system.kitchenDisplaySystem.orderCard.pickupIdentifier'),
        defaultIdentifier: i18n.t('kitchen_display_system.kitchenDisplaySystem.orderCard.defaultIdentifier'),
        actionStartPreparing: i18n.t('kitchen_display_system.kitchenDisplaySystem.orderCard.actionStartPreparing'),
        actionMarkAsReady: i18n.t('kitchen_display_system.kitchenDisplaySystem.orderCard.actionMarkAsReady'),
        actionConfirm: i18n.t('kitchen_display_system.kitchenDisplaySystem.orderCard.actionConfirm'),
        actionMarkServed: i18n.t('live_orders_view.liveOrders.actions.markServed'),
    },
    // For OrderItemList.jsx
    orderItemList: {
        itemQuantity: i18n.t('kitchen_display_system.kitchenDisplaySystem.orderItemList.itemQuantity'), // Old, can be replaced by the badge in the new design
        moreItems: i18n.t('kitchen_display_system.kitchenDisplaySystem.orderItemList.moreItems'), // NEW
    },
    // For OrderStatusBadge.jsx and other components
    orderStatus: {
        PENDING_CONFIRMATION: i18n.t('dashboard.dashboard.liveOrdersCard.funnelLabelPending'),
        CONFIRMED: i18n.t('live_orders_view.liveOrders.orderStatus.CONFIRMED'),
        PREPARING: i18n.t('live_orders_view.liveOrders.orderStatus.PREPARING'),
        READY_FOR_PICKUP: i18n.t('kitchen_display_system.kitchenDisplaySystem.header.filterReady'),
        SERVED: i18n.t('live_orders_view.liveOrders.status.SERVED'),
        COMPLETED: i18n.t('live_orders_view.liveOrders.orderStatus.COMPLETED'),
        CANCELLED_BY_CUSTOMER: i18n.t('kitchen_display_system.kitchenDisplaySystem.orderStatus.CANCELLED_BY_CUSTOMER'),
        CANCELLED_BY_BUSINESS: i18n.t('kitchen_display_system.kitchenDisplaySystem.orderStatus.CANCELLED_BY_BUSINESS'),
        finalized: i18n.t('kitchen_display_system.kitchenDisplaySystem.orderStatus.finalized'),
    },
    // NEW: For OrderDetailModal.jsx
    modal: {
        title: i18n.t('kitchen_display_system.kitchenDisplaySystem.modal.title'),
        notes: i18n.t('menu_view.menu_view.orderSummaryPanel.orderNotesLabel'),
        items: i18n.t('venue_management.items'),
        close: i18n.t('venue_management.close'),
        price: i18n.t('kitchen_display_system.kitchenDisplaySystem.modal.price'), // Example for price formatting
    },
};