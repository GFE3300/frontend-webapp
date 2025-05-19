import React, { memo, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

// This is a VERY basic SVG sparkline. For real use, a library is recommended.
const SparklineChart = memo(({ data = [], width = 80, height = 24, strokeColor = "#fb7185" /* rose-500 */ }) => {
    const [tooltipData, setTooltipData] = useState(null); // { x, y, value, index }
    const svgRef = useRef(null);

    if (!data || data.length < 2) {
        return <div style={{ width, height }} className="flex items-center justify-center text-xs text-neutral-400">No data</div>;
    }

    const yMax = Math.max(...data, 0);
    const yMin = Math.min(...data, 0); // Could be 0 if all positive
    const yRange = yMax - yMin || 1; // Avoid division by zero

    const points = data
        .map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((d - yMin) / yRange) * height;
            return `${x},${y}`;
        })
        .join(' ');

    const handleMouseMove = (event) => {
        if (!svgRef.current) return;
        const svgRect = svgRef.current.getBoundingClientRect();
        const x = event.clientX - svgRect.left;

        const index = Math.round((x / width) * (data.length - 1));
        if (index >= 0 && index < data.length) {
            const value = data[index];
            const pointX = (index / (data.length - 1)) * width;
            const pointY = height - ((value - yMin) / yRange) * height;
            setTooltipData({ x: pointX, y: pointY, value, index, clientX: event.clientX, clientY: event.clientY });
        }
    };

    const handleMouseLeave = () => {
        setTooltipData(null);
    };

    return (
        <div className="relative" style={{ width, height }}>
            <svg
                ref={svgRef}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="overflow-visible"
            >
                <polyline
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />
                {/* Optional: fill area under line */}
                {/* <polyline
                    fill={`${strokeColor}1A`} // transparent fill
                    points={`0,${height} ${points} ${width},${height}`}
                /> */}
                {tooltipData && (
                    <circle cx={tooltipData.x} cy={tooltipData.y} r="2.5" fill={strokeColor} />
                )}
            </svg>
            <AnimatePresence>
                {tooltipData && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.1 }}
                        className="absolute z-10 p-1.5 bg-neutral-800 text-white text-xs rounded shadow-lg pointer-events-none whitespace-nowrap"
                        style={{
                            left: tooltipData.clientX - svgRef.current?.getBoundingClientRect().left + 10, // Position relative to cursor
                            top: tooltipData.clientY - svgRef.current?.getBoundingClientRect().top - 30,
                        }}
                    >
                        Day {tooltipData.index + 1}: {tooltipData.value} sales
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

SparklineChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.number).isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    strokeColor: PropTypes.string,
};

export default SparklineChart;