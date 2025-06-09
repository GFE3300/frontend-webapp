// src/features/dashboard/cards/at_a_glance/RevenueInsight.jsx

import React from 'react';
import DonutChart from '../../../../components/common/DonutChart';
import { useAuth } from '../../../../contexts/AuthContext';
import { formatCurrency } from '../../../../utils/formatCurrency';

const RevenueInsight = ({ data }) => {
    const { avg_spend_per_guest = "0.00", category_breakdown = [] } = data || {};
    const { user } = useAuth();

    const chartData = category_breakdown.map((item, index) => ({
        value: parseFloat(item.revenue),
        color: ['#8B5CF6', '#A78BFA', '#C4B5FD'][index % 3], // Purple palette
        label: item.category_name,
    }));

    return (
        <div className="flex h-full p-4">
            <div className="w-1/2 flex items-center justify-center">
                <DonutChart data={chartData} size={110} strokeWidth={12} />
            </div>
            <div className="w-1/2 flex flex-col justify-between pl-3 border-l border-neutral-200 dark:border-neutral-700">
                <div>
                    <h4 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Top Categories</h4>
                    <ul className="mt-1 space-y-0.5">
                        {chartData.map(item => (
                            <li key={item.label} className="flex items-center text-xs">
                                <span style={{ backgroundColor: item.color }} className="w-2 h-2 rounded-full mr-2"></span>
                                <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate">{item.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="text-center">
                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Avg. Spend / Guest</p>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(parseFloat(avg_spend_per_guest), user?.activeBusinessCurrency)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RevenueInsight;