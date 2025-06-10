// src/features/dashboard/utils/script_lines.js

/**
 * @prettier
 */
export const scriptLines_dashboard = {
    revenueCard: {
        title: "Revenue Today",
        titleInsight: "Revenue Engine",
        avgSpend: "Avg. Spend / Guest",
        vsYesterday: "vs yesterday",
        vsYesterdayValue: "vs {{value}} yesterday",
        categoryFood: "Food",
        categoryDrinks: "Drinks",
        categoryMerch: "Merchandise",
        categoryEvents: "Events",
        categoryTakeout: "Takeout",
    },
    interactiveDonutChart: {
        totalLabel: "Total",
    },
    guestsCard: {
        title: "Guests Today",
        titleInsight: "Guest Flow",
        vsYesterday: "vs yesterday",
        peakHour: "Peak Hour",
    },
    liveOrdersCard: {
        title: "Live Orders",
        titleInsight: "Order Funnel",
        toConfirm: {
            one: "{{count}} to Confirm",
            other: "{{count}} to Confirm",
        },
        allConfirmed: "All orders confirmed.",
        funnelLabelPending: "Pending",
        funnelLabelConfirmed: "Confirmed",
        funnelLabelPreparing: "Preparing",
        funnelLabelServed: "Served",
        funnelMetricTime: "~{{time}}",
    },
    orderStatusDistributionBar: {
        tooltipLabel: "{{count}} {{status}}",
        statusPending: "Pending",
        statusConfirmed: "Confirmed",
        statusPreparing: "Preparing",
        statusServed: "Served",
        noActiveOrders: "No active orders",
    },
    orderStageColumn: {
        avgTime: "Avg. Time",
    },
    occupancyCard: {
        title: "Occupancy",
        titleInsight: "Venue Hotspots",
        activeTables: "Active Tables",
        occupancyPercentage: "{{percentage}}% Occupancy",
        tableLabel: "Table #{{tableNumber}}",
        orderCount: {
            one: "{{count}} order",
            other: "{{count}} orders",
        },
        noActivity: "No table activity yet to rank hotspots.",
        avgTurnTime: "Avg. Turn Time",
    },
};