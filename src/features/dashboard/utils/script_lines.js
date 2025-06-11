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

// src/features/dashboard/utils/script_lines.js

/**
 * @prettier
 */
export const scriptLines_dashboard = {
    revenueCard: {
        title: i18n.t('dashboard.dashboard.revenueCard.title'),
        titleInsight: i18n.t('dashboard.dashboard.revenueCard.titleInsight'),
        avgSpend: i18n.t('dashboard.dashboard.revenueCard.avgSpend'),
        vsYesterday: i18n.t('dashboard.dashboard.revenueCard.vsYesterday'),
        vsYesterdayValue: i18n.t('dashboard.dashboard.revenueCard.vsYesterdayValue'),
        categoryFood: i18n.t('dashboard.dashboard.revenueCard.categoryFood'),
        categoryDrinks: i18n.t('dashboard.dashboard.revenueCard.categoryDrinks'),
        categoryMerch: i18n.t('dashboard.dashboard.revenueCard.categoryMerch'),
        categoryEvents: i18n.t('dashboard.dashboard.revenueCard.categoryEvents'),
        categoryTakeout: i18n.t('dashboard.dashboard.revenueCard.categoryTakeout'),
    },
    interactiveDonutChart: {
        totalLabel: i18n.t('venue_management.total'),
    },
    guestsCard: {
        title: i18n.t('dashboard.dashboard.guestsCard.title'),
        titleInsight: i18n.t('dashboard.dashboard.guestsCard.titleInsight'),
        vsYesterday: i18n.t('dashboard.dashboard.revenueCard.vsYesterday'),
        peakHour: i18n.t('dashboard.dashboard.guestsCard.peakHour'),
    },
    liveOrdersCard: {
        title: i18n.t('dashboard.dashboard.liveOrdersCard.title'),
        titleInsight: i18n.t('dashboard.dashboard.liveOrdersCard.titleInsight'),
        toConfirm: i18n.t('dashboard.dashboard.liveOrdersCard.toConfirm'),
        allConfirmed: i18n.t('dashboard.dashboard.liveOrdersCard.allConfirmed'),
        funnelLabelPending: i18n.t('dashboard.dashboard.liveOrdersCard.funnelLabelPending'),
        funnelLabelConfirmed: i18n.t('live_orders_view.liveOrders.orderStatus.CONFIRMED'),
        funnelLabelPreparing: i18n.t('live_orders_view.liveOrders.orderStatus.PREPARING'),
        funnelLabelServed: i18n.t('live_orders_view.liveOrders.status.SERVED'),
        funnelMetricTime: i18n.t('dashboard.dashboard.liveOrdersCard.funnelMetricTime'),
    },
    orderStatusDistributionBar: {
        tooltipLabel: i18n.t('dashboard.dashboard.orderStatusDistributionBar.tooltipLabel'),
        statusPending: i18n.t('dashboard.dashboard.liveOrdersCard.funnelLabelPending'),
        statusConfirmed: i18n.t('live_orders_view.liveOrders.orderStatus.CONFIRMED'),
        statusPreparing: i18n.t('live_orders_view.liveOrders.orderStatus.PREPARING'),
        statusServed: i18n.t('live_orders_view.liveOrders.status.SERVED'),
        noActiveOrders: i18n.t('dashboard.dashboard.orderStatusDistributionBar.noActiveOrders'),
    },
    orderStageColumn: {
        avgTime: i18n.t('dashboard.dashboard.orderStageColumn.avgTime'),
    },
    occupancyCard: {
        title: i18n.t('dashboard.dashboard.occupancyCard.title'),
        titleInsight: i18n.t('dashboard.dashboard.occupancyCard.titleInsight'),
        activeTables: i18n.t('live_orders_view.liveOrders.stats.activeTables'),
        occupancyPercentage: i18n.t('dashboard.dashboard.occupancyCard.occupancyPercentage'),
        tableLabel: i18n.t('dashboard.dashboard.occupancyCard.tableLabel'),
        orderCount: i18n.t('dashboard.dashboard.occupancyCard.orderCount'),
        noActivity: i18n.t('dashboard.dashboard.occupancyCard.noActivity'),
        avgTurnTime: i18n.t('dashboard.dashboard.occupancyCard.avgTurnTime'),
    },
        dashboardGreeting: {
        goodMorning: 'Good morning',
        goodAfternoon: 'Good afternoon',
        goodEvening: 'Good evening',
        fallbackName: 'Agent',
        subtitle: 'Here is the real-time pulse of your business operations.',
        greeting: '{{greeting}}, {{firstName}}.',
    },
};