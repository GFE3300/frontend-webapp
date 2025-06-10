import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Icon from '../../../../../components/common/Icon';

const InsightRow = ({ label, iconName, count, metricValue, maxValue, colorClass, delay }) => {
    // Calculate the width of the bar as a percentage of the maximum value.
    // Ensure total is at least 1 to avoid division by zero.
    const widthPercentage = maxValue > 0 ? (count / maxValue) * 100 : 0;

    return (
        <motion.div
            className="flex font-montserrat items-center gap-3 text-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
        >
            {/* Section 1: Icon and Label */}
            <div className={`flex items-center gap-1.5 w-24 shrink-0 font-medium ${colorClass}`}>
                <Icon name={iconName} className="text-base" />
                <span>{label}</span>
            </div>

            {/* Section 2: Animated Progress Bar */}
            <div className="flex-grow bg-neutral-200 dark:bg-neutral-700/50 rounded-full h-5 overflow-hidden">
                <motion.div
                    className={`${colorClass.replace('text-', 'bg-')} h-full rounded-full flex items-center justify-end pr-2`}
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercentage}%` }}
                    transition={{ duration: 0.5, delay: delay + 0.1, ease: 'easeOut' }}
                >
                    {/* Display count inside the bar only if it's not zero */}
                    <span className="text-white font-bold text-xs">{count > 0 ? count : ''}</span>
                </motion.div>
            </div>

            {/* Section 3: Metric (Average Time) */}
            <div className="w-16 text-right font-medium text-neutral-600 dark:text-neutral-300">
                {metricValue}
            </div>
        </motion.div>
    );
};

InsightRow.propTypes = {
    label: PropTypes.string.isRequired,
    iconName: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    metricValue: PropTypes.string.isRequired,
    maxValue: PropTypes.number.isRequired,
    colorClass: PropTypes.string.isRequired,
    delay: PropTypes.number,
};

InsightRow.defaultProps = {
    delay: 0,
};

export default InsightRow;