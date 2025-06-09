import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../../components/common/Icon';
import { formatDuration } from '../../../../utils/formatCurrency';
import { useLiveOrdersSummary } from '../../hooks/useOverviewData';

const cardTransition = { duration: 0.4, ease: [0.4, 0, 0.2, 1] };

// Funnel bar subcomponent for the insight view
const FunnelBar = ({ label, value, maxValue, colorClass, delay }) => {
    const widthPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="w-20 text-right font-medium text-neutral-600 dark:text-neutral-400">{label}</span>
            <div className="flex-1 bg-neutral-200 dark:bg-neutral-700/50 rounded-full h-4 overflow-hidden">
                <motion.div
                    className={`${colorClass} h-full rounded-full flex items-center justify-end pr-2`}
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercentage}%` }}
                    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
                >
                    <span className="text-white font-bold text-xs">{value > 0 ? value : ''}</span>
                </motion.div>
            </div>
        </div>
    );
};

const LiveOrdersCard = () => {
    const [isInsightMode, setInsightMode] = useState(false);
    const data = useLiveOrdersSummary(); // This hook uses suspense

    const {
        active_orders_count = 0,
        needs_confirmation_count = 0,
        manager_attention_count = 0,
        funnel = {},
        avg_confirmation_time_seconds = 0
    } = data || {};

    const totalFunnelOrders = Object.values(funnel).reduce((sum, val) => sum + (val || 0), 0);
    const hasConfirmationAlert = needs_confirmation_count > 0;
    const hasManagerAttention = manager_attention_count > 0;

    const SnapshotView = (
        <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start text-gray-500 dark:text-gray-400">
                <h3 className="font-semibold text-lg">Live Orders</h3>
                <Icon name="receipt_long" className="text-2xl text-amber-500" />
            </div>
            <div className="flex-grow flex items-center justify-center">
                <p className="text-7xl font-bold text-gray-800 dark:text-white font-montserrat">{active_orders_count}</p>
            </div>
            <div className="text-sm font-semibold text-center h-5">
                {hasConfirmationAlert && (
                    <motion.p
                        className="text-amber-600 dark:text-amber-400"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        {needs_confirmation_count} to Confirm
                    </motion.p>
                )}
            </div>
        </div>
    );

    const InsightView = (
        <div className="flex flex-col h-full justify-between">
            <div>
                <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-3">Order Funnel</h3>
                <div className="space-y-1.5">
                    <FunnelBar label="Pending" value={funnel.pending_confirmation || 0} maxValue={totalFunnelOrders} colorClass="bg-amber-500" delay={0} />
                    <FunnelBar label="Confirmed" value={funnel.confirmed || 0} maxValue={totalFunnelOrders} colorClass="bg-blue-500" delay={0.1} />
                    <FunnelBar label="Preparing" value={funnel.preparing || 0} maxValue={totalFunnelOrders} colorClass="bg-purple-500" delay={0.2} />
                    <FunnelBar label="Served" value={funnel.served || 0} maxValue={totalFunnelOrders} colorClass="bg-green-500" delay={0.3} />
                </div>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-gray-400">Avg. Confirmation</span>
                <span className="font-semibold text-gray-800 dark:text-white">{formatDuration(avg_confirmation_time_seconds)}</span>
            </div>
        </div>
    );

    return (
        <Link to="/dashboard/business/orders" className="block h-full">
            <motion.div
                layout
                onClick={() => setInsightMode(!isInsightMode)}
                className="p-4 rounded-xl border bg-white dark:bg-gray-800 shadow-lg hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 h-full relative overflow-hidden cursor-pointer"
                transition={cardTransition}
                whileHover={{ y: -5 }}
            >
                {hasManagerAttention && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-red-500/15 to-transparent"
                        animate={{ opacity: [0, 0.6, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        style={{ '--pulse-duration': '3s' }}
                    />
                )}
                {hasConfirmationAlert && (
                    <div className="absolute top-0 right-0 bottom-0 left-0 ring-2 ring-amber-500/80 rounded-xl animate-pulse" />
                )}
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={isInsightMode ? 'insight' : 'snapshot'}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25 }}
                        className="relative z-10 h-full"
                    >
                        {isInsightMode ? InsightView : SnapshotView}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </Link>
    );
};

export default LiveOrdersCard;