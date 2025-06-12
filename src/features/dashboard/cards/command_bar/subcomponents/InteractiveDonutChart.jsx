import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '../../../../../hooks/useCurrency'; // Import the new currency hook
import AnimatedNumber from '../../../../../components/animated_number/animated-number';
import { scriptLines_dashboard as sl } from '../../../utils/script_lines'; // I18N

// Helper function to calculate the (x, y) coordinates on a circle
function getCoordinatesForPercent(percent) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
}

// Helper function to describe an SVG arc path
function describeArc(x, y, radius, startAngle, endAngle) {
    const start = getCoordinatesForPercent(startAngle);
    const end = getCoordinatesForPercent(endAngle);
    const largeArcFlag = endAngle - startAngle <= 0.5 ? '0' : '1';

    const pathData = [
        `M ${start[0] * radius + x} ${start[1] * radius + y}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end[0] * radius + x} ${end[1] * radius + y}`,
    ].join(' ');

    return pathData;
}

const InteractiveDonutChart = ({ data, size = 120, strokeWidth = 15 }) => {
    const [hoveredSegment, setHoveredSegment] = useState(null);
    const { currencySymbol } = useCurrency(); // Use the hook to get the currency symbol

    const total = useMemo(() => data.reduce((acc, item) => acc + item.value, 0), [data]);

    let cumulativePercent = 0;
    const segments = data.map(item => {
        const percent = total > 0 ? item.value / total : 0;
        const startAngle = cumulativePercent;
        cumulativePercent += percent;
        const endAngle = cumulativePercent;

        return {
            ...item,
            path: describeArc(size / 2, size / 2, (size - strokeWidth) / 2, startAngle, endAngle),
            percent,
            startAngle,
            endAngle,
        };
    });

    const displayedData = hoveredSegment || { value: total, label: sl.interactiveDonutChart.totalLabel || 'Total' };

    return (
        <div className="flex items-center gap-4 font-montserrat">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                    {segments.map((segment, index) => (
                        <motion.path
                            key={segment.label}
                            d={segment.path}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                            className="transition-opacity duration-200"
                            style={{
                                opacity: hoveredSegment && hoveredSegment.label !== segment.label ? 0.3 : 1,
                            }}
                            onMouseEnter={() => setHoveredSegment(segment)}
                            onMouseLeave={() => setHoveredSegment(null)}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.7, delay: index * 0.1, ease: 'easeOut' }}
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={displayedData.label}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.15 }}
                            className="text-center"
                        >
                            <div className="text-xl font-bold text-neutral-800 dark:text-white flex items-center">
                                <span className="text-lg mr-0.5">{currencySymbol}</span>
                                <AnimatedNumber value={displayedData.value} />
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium truncate max-w-[80px]">
                                {displayedData.label}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            <div className="flex flex-col gap-1.5">
                {segments.map(segment => (
                    <div
                        key={segment.label}
                        className="flex items-center text-xs cursor-pointer transition-opacity duration-200"
                        onMouseEnter={() => setHoveredSegment(segment)}
                        onMouseLeave={() => setHoveredSegment(null)}
                        style={{ opacity: hoveredSegment && hoveredSegment.label !== segment.label ? 0.5 : 1 }}
                    >
                        <span style={{ backgroundColor: segment.color }} className="w-2.5 h-2.5 rounded-full mr-2 shrink-0"></span>
                        <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate">{segment.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

InteractiveDonutChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.number.isRequired,
        label: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
    })).isRequired,
    size: PropTypes.number,
    strokeWidth: PropTypes.number,
};

export default InteractiveDonutChart;