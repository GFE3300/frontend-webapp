import React from 'react';
import { motion } from 'framer-motion';

const RadialProgressBar = ({ progress = 0, size = 100, strokeWidth = 10, color = 'var(--color-primary-500, #8B5CF6)' }) => {
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            {/* Background track */}
            <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="var(--color-neutral-200, #E5E7EB)"
                strokeWidth={strokeWidth}
                className="dark:stroke-neutral-700"
            />
            {/* Progress arc */}
            <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
        </svg>
    );
};

export default RadialProgressBar;