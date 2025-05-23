import React from 'react';
import DashboardLayout from '../features/dashboard/DashboardLayout';
import StatCard from '../features/dashboard/StatCard';
import Icon from '../components/common/Icon';
import { useAuth } from '../contexts/AuthContext';
import ProductsTable from '../features/products_table/ProductsTable';

const BusinessDashboardPage = () => {
    const { user } = useAuth();

    // Placeholder data
    const stats = [
        { title: "Today's Orders", value: "12", iconName: "shopping_cart", trend: "+5%", trendDirection: "up", iconColorClass: "text-blue-500" },
        { title: "Pending Deliveries", value: "3", iconName: "local_shipping", iconColorClass: "text-yellow-500" },
        { title: "Total Revenue (Month)", value: "$1,250", iconName: "payments", trend: "+12%", trendDirection: "up", iconColorClass: "text-green-500" },
        { title: "Low Stock Items", value: "7", iconName: "warning", trend: "Action needed", trendDirection: "down", iconColorClass: "text-red-500" },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h1 className="text-3xl font-semibold text-neutral-800 dark:text-neutral-100 font-montserrat">
                        Welcome back, {user?.firstName || 'Manager'}!
                    </h1>
                    <button className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2 text-sm font-medium">
                        <Icon name="add_circle" className="w-5 h-5" />
                        Create New Order
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map(stat => (
                        <StatCard
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            iconName={stat.iconName}
                            iconColorClass={stat.iconColorClass}
                            trend={stat.trend}
                            trendDirection={stat.trendDirection}
                        />
                    ))}
                </div>

                {/* Placeholder for Recent Activity / Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-2 bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-4">Recent Activity</h2>
                        <ul className="space-y-3">
                            {['Order #1023 confirmed', 'New "Croissant" added', 'Inventory updated for "Flour"', 'Customer review received'].map((activity, i) => (
                                <li key={i} className="text-sm text-neutral-600 dark:text-neutral-300 flex items-center">
                                    <Icon name="history" className="w-4 h-4 mr-2 text-neutral-400 dark:text-neutral-500" /> {activity}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-4">Quick Links</h2>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-rose-600 dark:text-rose-400 hover:underline text-sm">Manage Products</a></li>
                            <li><a href="#" className="text-rose-600 dark:text-rose-400 hover:underline text-sm">View Reports</a></li>
                            <li><a href="#" className="text-rose-600 dark:text-rose-400 hover:underline text-sm">Customer Support</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Placeholder for Products Table */}
            <ProductsTable />
        </DashboardLayout>
    );
};

export default BusinessDashboardPage;