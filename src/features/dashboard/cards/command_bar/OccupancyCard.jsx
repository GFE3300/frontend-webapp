import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../../components/common/Icon';
import RadialProgressBar from '../../../../components/common/RadialProgressBar';
import { formatDuration } from '../../../../utils/formatCurrency';

const OccupancyCard = ({ data, isInsightMode }) => {
    const { occupancy, venue_hotspots } = data;
    const percentage = occupancy.total_tables > 0 ? (occupancy.active_tables / occupancy.total_tables) * 100 : 0;

    let color = '#22c55e'; // Green
    if (percentage >= 85) color = '#ef4444'; // Red
    else if (percentage >= 60) color = '#f59e0b'; // Amber

    const SnapshotView = (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                <h3 className="font-semibold">Live Occupancy</h3>
                <Icon name="table_bar" style={{ fontSize: '1.5rem' }} />
            </div>
            <div className="flex-grow flex items-center justify-center">
                <RadialProgressBar percentage={percentage} color={color} sqSize={100} strokeWidth={10}>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-gray-800 dark:text-white font-montserrat">{occupancy.active_tables}</span>
                        <span className="text-sm text-gray-400">/ {occupancy.total_tables}</span>
                    </div>
                </RadialProgressBar>
            </div>
        </div>
    );

    const InsightView = (
        <div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Venue Hotspots</h3>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 mb-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">Avg. Occupancy</span>
                <span className="font-semibold text-gray-800 dark:text-white">{formatDuration(venue_hotspots.avg_occupancy_duration_minutes * 60)}</span>
            </div>
            <div className="text-sm space-y-1.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Busiest Tables</p>
                {venue_hotspots.table_activity.length > 0 ? venue_hotspots.table_activity.map(table => (
                    <div key={table.table_number} className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Table {table.table_number}</span>
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700">{table.order_count} orders</span>
                    </div>
                )) : <p className="text-xs text-gray-400 italic">No table activity yet today.</p>}
            </div>
        </div>
    );

    return (
        <Link to="/dashboard/business/venue" className="block h-full">
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

export default OccupancyCard;