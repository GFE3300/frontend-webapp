// src/features/dashboard/cards/at_a_glance/OccupancyInsight.jsx

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../../components/common/Icon';
import { formatDuration } from '../../../../utils/formatCurrency';

const OccupancyInsight = ({ data }) => {
    const { avg_occupancy_duration_minutes = 0, table_activity = [] } = data || {};

    const maxActivity = useMemo(() => {
        return Math.max(1, ...table_activity.map(t => t.order_count));
    }, [table_activity]);

    return (
        <div className="flex h-full p-4 space-x-4">
            <div className="w-1/2 flex flex-col justify-between">
                <div>
                    <h4 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Hotspots</h4>
                    <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                        {table_activity.slice(0, 6).map((table, index) => (
                            <motion.div
                                key={table.table_number}
                                className="relative aspect-square rounded-md bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center"
                                title={`Table ${table.table_number}: ${table.order_count} orders`}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-rose-500 rounded-md"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: table.order_count / maxActivity }}
                                    transition={{ duration: 0.5 }}
                                />
                                <span className="relative text-sm font-bold text-rose-800 dark:text-rose-200">{table.table_number}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
                <div className="text-center">
                    <Icon name="history" className="text-lg text-neutral-500" />
                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Avg. Duration</p>
                    <p className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
                        {formatDuration(avg_occupancy_duration_minutes * 60)}
                    </p>
                </div>
            </div>
            <div className="w-1/2 flex flex-col justify-center border-l border-neutral-200 dark:border-neutral-700 pl-3">
                <h4 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Top Tables</h4>
                <ul className="space-y-1">
                    {table_activity.slice(0, 4).map(table => (
                        <li key={table.table_number} className="flex justify-between items-baseline text-sm">
                            <span className="font-bold text-neutral-800 dark:text-neutral-200">Table {table.table_number}</span>
                            <span className="font-semibold text-neutral-600 dark:text-neutral-400">{table.order_count} orders</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default OccupancyInsight;