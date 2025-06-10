import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../../components/common/Icon';
import { formatDuration } from '../../../../utils/formatCurrency';
import AnimatedNumber from '../../../../components/animated_number/animated-number';
import OrderStatusDistributionBar from './subcomponents/OrderStatusDistributionBar';
import InsightRow from './subcomponents/InsightRow';
import { scriptLines_dashboard as sl } from '../../utils/script_lines.js'; // I18N
import { t, interpolate } from '../../../../i18n'; // I18N Helper

// --- Animation Variants ---
const cardTransition = { duration: 0.4, ease: [0.4, 0, 0.2, 1] };

const flipperVariants = {
    initial: { rotateY: -90, opacity: 0, scale: 0.9 },
    animate: { rotateY: 0, opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { rotateY: 90, opacity: 0, scale: 0.9, transition: { duration: 0.3, ease: "easeIn" } },
};
// --- End Animation Variants ---

const SnapshotView = ({ data, insightData, isHovered }) => {
    const { count = 0, needs_confirmation_count = 0 } = data || {};
    const hasConfirmationAlert = needs_confirmation_count > 0;

    return (
        <motion.div
            key="snapshot"
            variants={flipperVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col h-full justify-between"
        >
            <div className="flex-grow flex items-center justify-start">
                <div className="text-6xl font-bold text-gray-800 dark:text-white font-montserrat">
                    <AnimatedNumber value={count} />
                </div>
            </div>
            <div className="h-10 border-t border-neutral-200 dark:border-neutral-700 flex items-center">
                <AnimatePresence mode="wait">
                    {isHovered ? (
                        <motion.div
                            key="dist-bar"
                            className="w-full h-full flex items-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <OrderStatusDistributionBar insightData={insightData} />
                        </motion.div>
                    ) : (
                        hasConfirmationAlert ? (
                            <motion.div
                                key="alert-pill"
                                className="flex items-center text-sm font-semibold rounded-full px-2 py-0.5 text-amber-600 bg-amber-100 dark:text-amber-300 dark:bg-amber-500/20"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Icon name="notification_important" className="w-4 h-4 mr-1" style={{ fontSize: '1rem' }} />
                                <span>{t(sl.liveOrdersCard.toConfirm, { count: needs_confirmation_count, defaultValue: '{{count}} to Confirm' })}</span>
                            </motion.div>
                        ) : (
                            <motion.p
                                key="all-confirmed-text"
                                className="text-sm text-neutral-500 dark:text-neutral-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {sl.liveOrdersCard.allConfirmed || 'All orders confirmed.'}
                            </motion.p>
                        )
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const InsightView = ({ data }) => {
    const {
        pending_confirmation = 0,
        confirmed = 0,
        preparing = 0,
        served = 0,
        avg_confirmation_time_seconds = 0
    } = data || {};

    const funnelData = [
        { key: 'pending', label: sl.liveOrdersCard.funnelLabelPending || 'Pending', count: pending_confirmation, metric: formatDuration(avg_confirmation_time_seconds), icon: 'hourglass_top', color: 'text-amber-500' },
        { key: 'confirmed', label: sl.liveOrdersCard.funnelLabelConfirmed || 'Confirmed', count: confirmed, metric: interpolate(sl.liveOrdersCard.funnelMetricTime || '~{{time}}', { time: '5 min' }), icon: 'check_circle', color: 'text-blue-500' },
        { key: 'preparing', label: sl.liveOrdersCard.funnelLabelPreparing || 'Preparing', count: preparing, metric: interpolate(sl.liveOrdersCard.funnelMetricTime || '~{{time}}', { time: '8 min' }), icon: 'soup_kitchen', color: 'text-purple-500' },
        { key: 'served', label: sl.liveOrdersCard.funnelLabelServed || 'Served', count: served, metric: interpolate(sl.liveOrdersCard.funnelMetricTime || '~{{time}}', { time: '25 min' }), icon: 'room_service', color: 'text-green-500' },
    ];

    const maxCount = Math.max(1, ...funnelData.map(d => d.count));

    return (
        <motion.div
            key="insight"
            variants={flipperVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col h-full justify-center space-y-2"
        >
            {funnelData.map((item, index) => (
                <InsightRow
                    key={item.key}
                    label={item.label}
                    iconName={item.icon}
                    count={item.count}
                    metricValue={item.metric}
                    maxValue={maxCount}
                    colorClass={item.color}
                    delay={index * 0.05}
                />
            ))}
        </motion.div>
    );
};


const LiveOrdersCard = ({ data, insightData }) => {
    const [isInsightMode, setInsightMode] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { needs_attention_count = 0, needs_confirmation_count = 0 } = data || {};
    const hasManagerAttention = needs_attention_count > 0;
    const hasConfirmationAlert = needs_confirmation_count > 0;

    return (
        <motion.div
            layout
            onClick={() => setInsightMode(!isInsightMode)}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="rounded-3xl bg-gradient-to-br from-white to-amber-50 dark:from-neutral-800 dark:to-amber-900/20 shadow-lg h-48 w-full cursor-pointer flex flex-col p-4 relative overflow-hidden"
            whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            transition={cardTransition}
        >
            {hasManagerAttention && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-red-500/15 to-transparent pointer-events-none z-0"
                    animate={{ opacity: [0, 0.6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                />
            )}
            {hasConfirmationAlert && !isHovered && (
                <div className="absolute top-0 right-0 bottom-0 left-0 ring-2 ring-amber-500/80 rounded-3xl animate-pulse pointer-events-none z-0" />
            )}

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex w-full justify-between items-start text-neutral-500 dark:text-neutral-300 mb-2">
                    <h3 className="font-medium text-lg font-montserrat">
                        {isInsightMode ? (sl.liveOrdersCard.titleInsight || 'Order Funnel') : (sl.liveOrdersCard.title || 'Live Orders')}
                    </h3>
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-700 shrink-0">
                        <Icon name="receipt_long" className="w-4 h-4 text-amber-500" style={{ fontSize: '1rem' }} variations={{ fill: 1, weight: 600, grade: 0, opsz: 48 }} />
                    </div>
                </div>

                <div className="flex-grow flex flex-col" style={{ perspective: '1000px' }}>
                    <AnimatePresence mode="wait" initial={false}>
                        {isInsightMode ? (
                            <InsightView data={insightData} />
                        ) : (
                            <SnapshotView data={data} insightData={insightData} isHovered={isHovered} />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default LiveOrdersCard;