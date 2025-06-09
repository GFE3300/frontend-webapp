import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../../components/common/Icon';
import LineChart from '../../../../components/common/LineChart';

const GuestsCard = ({ data, isInsightMode }) => {
    const { guests_today, guest_flow } = data;

    const comparisonColor = guests_today.comparison_percentage >= 0 ? 'text-green-500' : 'text-red-500';

    const chartData = guest_flow.today_hourly_counts.map((value, index) => ({
        name: `${index}:00`,
        Today: value,
        Compare: guest_flow.comparison_hourly_counts[index] || 0,
    }));

    const chartConfig = [
        { dataKey: 'Today', stroke: '#F43F5E', strokeWidth: 2 },
        { dataKey: 'Compare', stroke: '#9ca3af', strokeWidth: 1.5, strokeDasharray: "3 3" },
    ];

    const SnapshotView = (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                <h3 className="font-semibold">Guests Today</h3>
                <Icon name="groups" style={{ fontSize: '1.5rem', color: '#F43F5E' }} />
            </div>
            <div className="flex-grow flex items-center">
                <p className="text-5xl font-bold text-rose-500 font-montserrat">{guests_today.current_value}</p>
            </div>
            <div className="text-sm flex justify-end items-center">
                <p className={`font-semibold ${comparisonColor} flex items-center`}>
                    <Icon name={guests_today.comparison_percentage >= 0 ? 'arrow_upward' : 'arrow_downward'} style={{ fontSize: '1rem' }} className="mr-0.5" />
                    {Math.abs(guests_today.comparison_percentage)}%
                </p>
            </div>
        </div>
    );

    const InsightView = (
        <div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Guest Flow</h3>
            <div className="h-28 w-full -ml-4">
                <LineChart data={chartData} config={chartConfig} showGrid={false} />
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-gray-400">Peak Hour</span>
                <span className="font-semibold text-gray-800 dark:text-white">{guest_flow.peak_hour}</span>
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

export default GuestsCard;