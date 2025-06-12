// FILE: src/features/dashboard/pages/AnalyticsPage.jsx
// MODIFIED: Implementing Analytics Page with a placeholder.
import React from 'react';
import Icon from '../../../components/common/Icon'; // Assuming Icon component exists
import RevenueCard from '../../data_cards/revenue_card';
import HeatmapCard from '../../data_cards/heatmap';
import { scriptLines_dashboard as sl } from '../utils/script_lines';

const AnalyticsPage = () => {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <header>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">{sl.analyticsPage.title || 'Analytics & Reports'}</h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {sl.analyticsPage.subtitle || 'Gain insights into your business performance.'}
                </p>
            </header>

            <section className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                <h2 className="sr-only">Analytics Interface</h2>
                <div className="text-center py-20 text-neutral-500 dark:text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-md">
                    <Icon name="analytics" className="mx-auto h-16 w-16 mb-4 text-primary-500 dark:text-primary-400" />
                    <p className="text-xl font-semibold mb-2">{sl.analyticsPage.placeholderTitle || '[Advanced Analytics and Reporting Interface Placeholder]'}</p>
                    <p className="text-sm">
                        {sl.analyticsPage.placeholderBody || 'This section will include various charts, data export options, and detailed reports on sales, products, and customer behavior.'}
                    </p>
                    <p className="text-xs mt-3">
                        {sl.analyticsPage.placeholderFooter || '(Further development required)'}
                    </p>
                </div>
                <RevenueCard />
                <HeatmapCard />
            </section>
        </div>
    );
};

export default AnalyticsPage;