import React from 'react';
import { motion } from 'framer-motion';

const LineChart = ({
    data,
    comparisonData,
    width = 200,
    height = 80,
    color = 'var(--color-rose-500, #F43F5E)',
    comparisonColor = 'var(--color-neutral-400, #9CA3AF)',
}) => {
    if (!data || data.length === 0) {
        return (
            <div style={{ width, height }} className="flex items-center justify-center text-xs text-neutral-400">
                No data available
            </div>
        );
    }

    const allValues = [...data, ...(comparisonData || [])];
    const maxY = Math.max(...allValues, 1); // Avoid division by zero
    const xStep = width / (data.length - 1 || 1);
    const yRatio = height / maxY;

    const generatePath = (d) => {
        return d.map((point, i) => {
            const x = i * xStep;
            const y = height - point * yRatio;
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        }).join(' ');
    };

    const mainPath = generatePath(data);
    const comparisonPath = comparisonData ? generatePath(comparisonData) : '';

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Comparison Line (Dashed) */}
            {comparisonPath && (
                <motion.path
                    d={comparisonPath}
                    fill="none"
                    stroke={comparisonColor}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                />
            )}
            {/* Main Line */}
            <motion.path
                d={mainPath}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeInOut', delay: 0.2 }}
            />
        </svg>
    );
};

export default LineChart;