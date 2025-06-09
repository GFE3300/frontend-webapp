import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../../components/common/Icon';
import DonutChart from '../../../../components/common/DonutChart';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { useBusinessCurrency } from '../../../../hooks/useCurrency';

const RevenueCard = ({ data, isInsightMode }) => {
    const { revenue_today, revenue_engine } = data;
    const { currency } = useBusinessCurrency();

    const comparisonColor = revenue_today.comparison_percentage >= 0 ? 'text-green-500' : 'text-red-500';

    const SnapshotView = (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                <h3 className="font-semibold">Revenue Today</h3>
                <Icon name="monitoring" style={{ fontSize: '1.5rem', color: '#8B5CF6' }} />
            </div>
            <div className="flex-grow flex items-center">
                <p className="text-5xl font-bold text-purple-500 font-montserrat">
                    {formatCurrency(revenue_today.current_value, currency)}
                </p>
            </div>
            <div className="text-sm flex justify-end items-center">
                <p className={`font-semibold ${comparisonColor} flex items-center`}>
                    <Icon name={revenue_today.comparison_percentage >= 0 ? 'arrow_upward' : 'arrow_downward'} style={{ fontSize: '1rem' }} className="mr-0.5" />
                    {Math.abs(revenue_today.comparison_percentage)}%
                </p>
            </div>
        </div>
    );

    const InsightView = (
        <div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Revenue Engine</h3>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 mb-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">Avg. Spend / Guest</span>
                <span className="font-semibold text-purple-500">{formatCurrency(revenue_engine.avg_spend_per_guest, currency)}</span>
            </div>
            <div className="h-28 w-full flex items-center justify-center">
                <DonutChart
                    data={revenue_engine.category_breakdown}
                    dataKey="revenue"
                    nameKey="category_name"
                    colors={['#a78bfa', '#c4b5fd', '#ddd6fe']}
                />
            </div>
        </div>
    );

    return (
        <Link to="/dashboard/business/analytics" className="block h-full">
            <motion.div
                layout
                className="p-4 rounded-lg border bg-white dark:bg-gray-800 shadow-sm hover:border-gray-400 dark:hover:border-gray-600 transition-colors duration-300 h-full"
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isInsightMode ? 'insight' : 'snapshot'}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25 }}
                    >
                        {isInsightMode ? InsightView : SnapshotView}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </Link>
    );
};

export default RevenueCard;