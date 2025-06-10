import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Custom hook to measure the size of a container element using ResizeObserver.
 * @param {React.RefObject<HTMLElement>} ref - The ref attached to the element to measure.
 * @returns {{width: number, height: number}} - The dimensions of the element.
 */
const useContainerSize = (ref) => {
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setSize({ width, height });
            }
        });

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [ref]);

    return size;
};

const InteractiveLineChart = ({ todayData = [], yesterdayData = [], onHoverDataChange, onHoverEnd }) => {
    const containerRef = useRef(null);
    const { width, height } = useContainerSize(containerRef); // Dynamic width and height
    const [hoveredIndex, setHoveredIndex] = useState(-1);

    const peakValue = useMemo(() => {
        const allValues = [...todayData, ...yesterdayData];
        if (allValues.length === 0) return 1;
        return Math.max(1, ...allValues);
    }, [todayData, yesterdayData]);

    const getCoords = useCallback((data, index) => {
        if (data.length === 0 || index < 0 || index >= data.length || width === 0) return { x: 0, y: height };
        const x = data.length > 1 ? (index / (data.length - 1)) * width : width / 2;
        const y = height - (data[index] / peakValue) * height * 0.9;
        return { x, y };
    }, [width, height, peakValue]);

    const createPath = useCallback((data) => {
        if (data.length < 2 || width === 0) return "";
        return data
            .map((_, i) => {
                const { x, y } = getCoords(data, i);
                return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`;
            })
            .join(' ');
    }, [getCoords, width]);

    const todayPath = useMemo(() => createPath(todayData), [todayData, createPath]);
    const yesterdayPath = useMemo(() => createPath(yesterdayData), [yesterdayData, createPath]);

    const handleMouseMove = useCallback((e) => {
        if (todayData.length === 0 || width === 0) return;
        const bounds = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const index = Math.round((x / width) * (todayData.length - 1));

        if (index >= 0 && index < todayData.length && index !== hoveredIndex) {
            setHoveredIndex(index);
            if (onHoverDataChange) {
                onHoverDataChange({ today: todayData[index], yesterday: yesterdayData[index] ?? 0 });
            }
        }
    }, [width, todayData, yesterdayData, onHoverDataChange, hoveredIndex]);

    const handleMouseLeave = useCallback(() => {
        setHoveredIndex(-1);
        if (onHoverEnd) onHoverEnd();
    }, [onHoverEnd]);

    const dotCoords = (hoveredIndex !== -1 && todayData.length > 0) ? getCoords(todayData, hoveredIndex) : null;

    return (
        <div
            ref={containerRef}
            className="w-full h-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {width > 0 && height > 0 && (
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                    <path d={yesterdayPath} fill="none" stroke="var(--color-neutral-400, #9CA3AF)" strokeWidth="2" strokeDasharray="2 3" />
                    <path d={todayPath} fill="none" stroke="var(--color-purple-500, #8B5CF6)" strokeWidth="2.5" />
                    {dotCoords && (
                        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
                            <line x1={dotCoords.x} y1="0" x2={dotCoords.x} y2={height} stroke="var(--color-purple-500, #8B5CF6)" strokeWidth="1" strokeDasharray="2 2" />
                            <circle cx={dotCoords.x} cy={dotCoords.y} r="5" fill="var(--color-purple-500, #8B5CF6)" stroke="white" strokeWidth="2" />
                        </motion.g>
                    )}
                </svg>
            )}
        </div>
    );
};

InteractiveLineChart.propTypes = {
    todayData: PropTypes.arrayOf(PropTypes.number),
    yesterdayData: PropTypes.arrayOf(PropTypes.number),
    onHoverDataChange: PropTypes.func,
    onHoverEnd: PropTypes.func,
};

InteractiveLineChart.defaultProps = {
    todayData: [],
    yesterdayData: [],
    onHoverDataChange: () => { },
    onHoverEnd: () => { },
};

export default InteractiveLineChart;