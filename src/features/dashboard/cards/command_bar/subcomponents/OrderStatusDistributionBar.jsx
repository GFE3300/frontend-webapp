import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { scriptLines_dashboard as sl } from '../../../utils/script_lines'; // I18N
import { interpolate, t } from '../../../../../i18n'; // I18N Helper

const OrderStatusDistributionBar = ({ insightData = {} }) => {
    const statusConfig = {
        pending_confirmation: { label: sl.orderStatusDistributionBar.statusPending || 'Pending', color: 'bg-amber-500' },
        confirmed: { label: sl.orderStatusDistributionBar.statusConfirmed || 'Confirmed', color: 'bg-blue-500' },
        preparing: { label: sl.orderStatusDistributionBar.statusPreparing || 'Preparing', color: 'bg-purple-500' },
        served: { label: sl.orderStatusDistributionBar.statusServed || 'Served', color: 'bg-green-500' },
    };

    const {
        pending_confirmation = 0,
        confirmed = 0,
        preparing = 0,
        served = 0,
    } = insightData;

    const statuses = [
        { key: 'pending_confirmation', value: pending_confirmation },
        { key: 'confirmed', value: confirmed },
        { key: 'preparing', value: preparing },
        { key: 'served', value: served },
    ];

    const total = statuses.reduce((acc, s) => acc + s.value, 0);

    if (total === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-xs text-neutral-400">{sl.orderStatusDistributionBar.noActiveOrders || 'No active orders'}</p>
            </div>
        );
    }

    return (
        <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700/50 rounded-full flex overflow-hidden">
            {statuses.map(({ key, value }) => {
                if (value === 0) return null;
                const percentage = (value / total) * 100;
                const config = statusConfig[key];

                return (
                    <div
                        key={key}
                        className="relative group h-full"
                        style={{ width: `${percentage}%` }}
                    >
                        <motion.div
                            className={`h-full ${config.color}`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            style={{ transformOrigin: 'left' }}
                        />
                        <div
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap"
                            role="tooltip"
                        >
                            {interpolate(sl.orderStatusDistributionBar.tooltipLabel || '{{count}} {{status}}', { count: value, status: config.label })}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-800 rotate-45" style={{ marginTop: '-4px' }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

OrderStatusDistributionBar.propTypes = {
    insightData: PropTypes.shape({
        pending_confirmation: PropTypes.number,
        confirmed: PropTypes.number,
        preparing: PropTypes.number,
        served: PropTypes.number,
    }),
};

export default OrderStatusDistributionBar;