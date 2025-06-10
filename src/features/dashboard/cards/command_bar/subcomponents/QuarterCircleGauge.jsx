// C:\Users\Gilberto F\Desktop\Smore\frontend\src/features/dashboard/cards/command_bar/subcomponents/QuarterCircleGauge.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const QuarterCircleGauge = ({
    percentage = 0,
    color = '#22c55e',
    size = 80,
    strokeWidth = 10,
    animationDuration = 1,
    animationDelay = 0.2,
}) => {
    // The radius is the size of the viewbox minus half the stroke to keep it centered
    const radius = size - strokeWidth / 2;
    // We want the arc to be drawn from the bottom-right corner, so the center of our circle is off-canvas at (size, size)
    const circumference = (2 * Math.PI * radius) / 4; // Length of a quarter circle arc
    const offset = circumference - (percentage / 100) * circumference;

    const pathVariants = {
        hidden: { strokeDashoffset: circumference },
        visible: {
            strokeDashoffset: offset,
            transition: { duration: animationDuration, delay: animationDelay, ease: 'circOut' },
        },
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-0"
        >
            {/* Background Track */}
            <path
                d={`M ${strokeWidth / 2},${size} A ${radius},${radius} 0 0 1 ${size},${strokeWidth / 2}`}
                fill="none"
                stroke="currentColor"
                className="text-neutral-200 dark:text-neutral-700/50"
                strokeWidth={strokeWidth}
            />
            {/* Animated Foreground Gauge */}
            <motion.path
                d={`M ${strokeWidth / 2},${size} A ${radius},${radius} 0 0 1 ${size},${strokeWidth / 2}`}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                variants={pathVariants}
                initial="hidden"
                animate="visible"
            />
        </svg>
    );
};

QuarterCircleGauge.propTypes = {
    percentage: PropTypes.number,
    color: PropTypes.string,
    size: PropTypes.number,
    strokeWidth: PropTypes.number,
    animationDuration: PropTypes.number,
    animationDelay: PropTypes.number,
};

export default QuarterCircleGauge;