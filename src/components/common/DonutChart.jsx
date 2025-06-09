// src/components/common/DonutChart.jsx

import React from 'react';
import { motion } from 'framer-motion';

const DonutChart = ({ data, size = 100, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let accumulatedLength = 0;

    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    if (totalValue === 0) {
        return (
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="var(--color-neutral-200, #E5E7EB)"
                    strokeWidth={strokeWidth}
                />
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dy=".3em"
                    className="text-xs font-semibold fill-current text-neutral-400"
                >
                    No Data
                </text>
            </svg>
        );
    }

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background Circle */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="var(--color-neutral-200, #E5E7EB)"
                strokeWidth={strokeWidth}
                className="dark:stroke-neutral-700"
            />
            {/* Data Segments */}
            {data.map((item, index) => {
                const percentage = item.value / totalValue;
                const segmentLength = circumference * percentage;
                const segment = (
                    <motion.circle
                        key={index}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference}
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        style={{ strokeDashoffset: circumference - accumulatedLength }}
                        animate={{
                            strokeDashoffset: circumference - accumulatedLength - segmentLength,
                        }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: 'easeInOut',
                        }}
                    />
                );
                accumulatedLength += segmentLength;
                return segment;
            })}
        </svg>
    );
};

export default DonutChart;