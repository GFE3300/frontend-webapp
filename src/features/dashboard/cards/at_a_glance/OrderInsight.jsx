// src/features/dashboard/cards/at_a_glance/OrderInsight.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { formatDuration } from '../../../../utils/formatCurrency';
import Icon from '../../../../components/common/Icon';

const FunnelBar = ({ label, value, maxValue, colorClass, delay }) => {
    const widthPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="w-20 text-right font-medium text-neutral-600 dark:text-neutral-400">{label}</span>
            <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-4 overflow-hidden">
                <motion.div
                    className={`${colorClass} h-full rounded-full flex items-center justify-end pr-2`}
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercentage}%` }}
                    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
                >
                    <span className="text-white font-bold">{value}</span>
                </motion.div>
            </div>
        </div>
    );
};

const OrderInsight = ({ data }) => {
    const {
        pending_confirmation = 0,
        confirmed = 0,
        preparing = 0,
        served = 0,
        avg_confirmation_time_seconds = 0,
    } = data || {};

    const funnelData = [
        { label: 'Pending', value: pending_confirmation, color: 'bg-amber-500' },
        { label: 'Confirmed', value: confirmed, color: 'bg-blue-500' },
        { label: 'Preparing', value: preparing, color: 'bg-purple-500' },
        { label: 'Served', value: served, color: 'bg-green-500' },
    ];

    const totalInFunnel = funnelData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="flex flex-col h-full p-4 space-y-3">
            <h3 className="font-bold text-center text-neutral-700 dark:text-neutral-200">Order Funnel</h3>
            <div className="flex-grow space-y-1.5">
                {funnelData.map((item, index) => (
                    <FunnelBar
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        maxValue={totalInFunnel}
                        colorClass={item.color}
                        delay={index * 0.1}
                    />
                ))}
            </div>
            <div className="flex items-center justify-center gap-2 text-center border-t border-neutral-200 dark:border-neutral-700 pt-2">
                <Icon name="timer" className="text-lg text-neutral-500" />
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Avg. Confirmation:
                </span>
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    {formatDuration(avg_confirmation_time_seconds)}
                </span>
            </div>
        </div>
    );
};

export default OrderInsight;