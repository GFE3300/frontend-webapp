import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import AnimatedNumber from '../../../../../components/animated_number/animated-number';
import { scriptLines_dashboard as sl } from '../../../utils/script_lines'; // I18N

const OrderStageColumn = ({
    label,
    count,
    metricValue,
    colorClass,
    delay = 0,
}) => {
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay,
                when: "beforeChildren",
                staggerChildren: 0.08,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center text-center flex-1 h-full py-1 space-y-1"
        >
            {/* Main Count */}
            <motion.div
                variants={itemVariants}
                className="text-3xl font-bold text-neutral-800 dark:text-white"
            >
                <AnimatedNumber value={count} />
            </motion.div>

            {/* Stage Label */}
            <motion.p
                variants={itemVariants}
                className={`text-xs font-semibold ${colorClass}`} // Use color on the label for context
            >
                {label}
            </motion.p>

            {/* Compact Metric */}
            <motion.div
                variants={itemVariants}
                className="text-2xs text-neutral-500 dark:text-neutral-400"
            >
                <span className="font-medium">{metricValue}</span>
                <span> {sl.orderStageColumn.avgTime || 'Avg. Time'}</span>
            </motion.div>
        </motion.div>
    );
};

OrderStageColumn.propTypes = {
    label: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    metricValue: PropTypes.string.isRequired,
    colorClass: PropTypes.string.isRequired,
    delay: PropTypes.number,
};

export default OrderStageColumn;