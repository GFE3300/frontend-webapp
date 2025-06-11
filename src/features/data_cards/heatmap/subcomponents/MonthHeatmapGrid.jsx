import React, { useMemo, useState, useRef } from 'react';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { addDays, format, isValid } from 'date-fns';
import PropTypes from 'prop-types';
import ClientTooltip from './ClientTooltip';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FOOTER_HEIGHT = 24;

// Diagonal wave entrance variants
const DIAGONAL_BASE_DELAY = 0.1;

const cellVariants = {
    hidden: { opacity: 0, scale: 0 },
    show: ({ weekIndex, dayIndex }) => ({
        opacity: 1,
        scale: 1,
        transition: {
            // delay grows with weekIndex + dayIndex → perfect diagonal sweep
            delay: (weekIndex + dayIndex) * DIAGONAL_BASE_DELAY,
            duration: 0.2
        }
    })
};

const MonthHeatmapGrid = ({ weekStarts, heatmapData, maxValue, findGroupIndex, theme, size, timeRange }) => {
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, date: null, value: 0 });
    const rafId = useRef(null);

    const weekStartDates = weekStarts;
    const weeksCount = Math.min(weekStartDates.length, heatmapData.length);

    const updateTooltipPosition = (e, dateObj, value) => {
        if (rafId.current != null) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => {
            const { clientX, clientY } = e;
            const TOOLTIP_WIDTH = 160, TOOLTIP_HEIGHT = 90, PADDING = 10;
            let x = clientX + PADDING, y = clientY + 24;
            let transformX = 0, transformY = 0;
            if (x + TOOLTIP_WIDTH > window.innerWidth) transformX = -TOOLTIP_WIDTH + PADDING;
            if (y + TOOLTIP_HEIGHT > window.innerHeight) transformY = -TOOLTIP_HEIGHT;
            setTooltip({
                visible: true,
                x,
                y,
                date: dateObj,
                value: Math.round(value),
                style: { transform: `translate(${transformX}px, ${transformY}px)` },
                size: { width: TOOLTIP_WIDTH, height: TOOLTIP_HEIGHT }
            });
        });
    };

    return (
        <div className="overflow-auto">
            <motion.div
                className="grid gap-1"
                style={{
                    gridTemplateColumns: `repeat(${weeksCount}, auto)`,
                    gridTemplateRows: `repeat(7, auto)`,
                }}
                initial="hidden"
                animate="show"
            >
                {daysOfWeek.map((_, dayIndex) =>
                    [...Array(weeksCount)].map((_, weekIndex) => {
                        const week = heatmapData[weekIndex] || [];
                        const value = week[dayIndex] ?? 0;
                        const colorIndex = findGroupIndex(value);
                        const bgClass = theme?.[colorIndex] || theme?.[0] || 'bg-gray-200';
                        // --- REFINED: Ensure weekStartDates[weekIndex] is a valid date before using ---
                        const dateObj = isValid(weekStartDates[weekIndex])
                            ? addDays(weekStartDates[weekIndex], dayIndex)
                            : new Date();

                        return (
                            <motion.div
                                key={`${weekIndex}-${dayIndex}`}
                                custom={{ weekIndex, dayIndex }}
                                variants={cellVariants}
                                className={clsx(
                                    'w-full h-5 rounded',
                                    bgClass,
                                    'shadow-sm hover:shadow-lg hover:scale-105 transition duration-200 ease-in-out',
                                    'cursor-pointer'
                                )}
                                style={{ width: (size?.width - 64) / weeksCount, height: (size?.height - FOOTER_HEIGHT - 12) / 7 }}
                                onMouseMove={e => updateTooltipPosition(e, dateObj, value)}
                                onMouseEnter={() => setTooltip(prev => ({ ...prev, date: dateObj, value: Math.round(value), visible: true }))}
                                onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                                aria-label={`${format(dateObj, 'EEE, MMM d, yyyy')}: ${value} clients`}
                            />
                        );
                    })
                )}
            </motion.div>

            <AnimatePresence>
                {tooltip.visible && (
                    <ClientTooltip tooltip={tooltip} maxValue={maxValue} timeRange={timeRange} />
                )}
            </AnimatePresence>

            <div className="flex mt-3 text-xs text-gray-500 justify-between font-montserrat" style={{ width: size?.width, height: FOOTER_HEIGHT }}>
                {/* --- REFINED: Check for valid dates before formatting --- */}
                <span>{weekStartDates[0] && isValid(weekStartDates[0]) ? format(weekStartDates[0], 'MMM d, yyyy') : ''}</span>
                <span>{weekStartDates[weeksCount - 1] && isValid(weekStartDates[weeksCount - 1]) ? format(addDays(weekStartDates[weeksCount - 1], 6), 'MMM d, yyyy') : ''}</span>
            </div>
        </div>
    );
};

MonthHeatmapGrid.propTypes = {
    weekStarts: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
    heatmapData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number.isRequired).isRequired).isRequired,
    maxValue: PropTypes.number.isRequired,
    findGroupIndex: PropTypes.func.isRequired,
    theme: PropTypes.arrayOf(PropTypes.string).isRequired,
    size: PropTypes.shape({ width: PropTypes.number, height: PropTypes.number }),
    timeRange: PropTypes.object
};

export default MonthHeatmapGrid;