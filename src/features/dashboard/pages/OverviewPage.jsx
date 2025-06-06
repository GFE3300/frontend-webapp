// FILE: src/features/dashboard/pages/OverviewPage.jsx
// MODIFIED: Implementing Overview Page with StatCards and placeholders.
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import StatCard from '../../../components/common/StatCard'; // Path to the newly created StatCard
import Spinner from '../../../components/common/Spinner'; // Assuming Spinner component exists
import Icon from '../../../components/common/Icon'; // Assuming Icon component exists

// Mock data fetching function - replace with actual API call later
const fetchOverviewStats = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Mock data - In a real scenario, this would come from an API
    return {
        todaySales: "$1,234.56",
        newOrdersToday: "15",
        lowStockItems: "3",
        openOrders: "8",
        // Placeholder for chart data
        salesTrendData: [/* ... */],
        // Placeholder for recent orders & top products
        recentOrders: [/* ... */],
        topSellingProducts: [/* ... */],
    };
};

const OverviewPage = () => {
    const { data, isLoading, error, isError } = useQuery({
        queryKey: ['overviewStats'], // Unique key for this query
        queryFn: fetchOverviewStats,
        // initialData: { // Optional: Provide initial data to avoid loading state on first render if mock is acceptable
        //     todaySales: "$0.00",
        //     newOrdersToday: "0",
        //     lowStockItems: "0",
        //     openOrders: "0",
        // }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full p-6">
                <Spinner size="lg" />
                <p className="ml-2 text-neutral-600 dark:text-neutral-300">Loading overview...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-6 text-center">
                <Icon name="error_outline" className="mx-auto text-red-500 dark:text-red-400 h-12 w-12 mb-3" />
                <p className="text-red-700 dark:text-red-300 font-semibold mb-1">Error loading overview data.</p>
                <p className="text-sm text-red-600 dark:text-red-400">
                    {error?.message || "An unexpected error occurred. Please try again later."}
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <header>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard Overview</h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Welcome back! Here's a quick look at your business today.
                </p>
            </header>

            {/* Key Metrics Section */}
            <section aria-labelledby="key-metrics-title">
                <h2 id="key-metrics-title" className="sr-only">Key Metrics</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Today's Sales" value={data?.todaySales || "$0.00"} iconName="payments" iconColorClass="text-green-500 dark:text-green-400" />
                    <StatCard title="New Orders Today" value={data?.newOrdersToday || "0"} iconName="shopping_cart_checkout" iconColorClass="text-sky-500 dark:text-sky-400" />
                    <StatCard title="Open Orders" value={data?.openOrders || "0"} iconName="pending_actions" iconColorClass="text-amber-500 dark:text-amber-400" />
                    <StatCard title="Low Stock Items" value={data?.lowStockItems || "0"} iconName="inventory_2" iconColorClass="text-red-500 dark:text-red-400" />
                </div>
            </section>

            {/* Widgets Section - Placeholders */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Recent Orders</h3>
                    <div className="text-center py-10 text-neutral-500 dark:text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-md">
                        <Icon name="receipt_long" className="mx-auto h-10 w-10 mb-2" />
                        [Recent Orders Widget Placeholder]
                        <p className="text-xs mt-1">List of most recent orders will appear here.</p>
                    </div>
                </div>
                <div className="lg:col-span-1 bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Top Selling Products</h3>
                    <div className="text-center py-10 text-neutral-500 dark:text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-md">
                        <Icon name="trending_up" className="mx-auto h-10 w-10 mb-2" />
                        [Top Selling Products Widget Placeholder]
                        <p className="text-xs mt-1">A list or chart of top products will show here.</p>
                    </div>
                </div>
            </section>

            {/* Charts Section - Placeholder */}
            <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Sales Trends</h3>
                <div className="text-center py-16 text-neutral-500 dark:text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-md">
                    <Icon name="show_chart" className="mx-auto h-12 w-12 mb-2" />
                    [Sales Trends Chart Placeholder]
                    <p className="text-xs mt-1">A line or bar chart illustrating sales over time.</p>
                </div>
            </section>
        </div>
    );
};

export default OverviewPage;