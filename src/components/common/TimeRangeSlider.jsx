import React, { useState, useCallback, useEffect, useRef } from 'react';
// eslint-disable-next-line
import { motion } from 'framer-motion';

const TimeRangeSlider = ({ initialStart = 8, initialEnd = 16, onChange }) => {
    const containerRef = useRef(null);
    const [dragging, setDragging] = useState(null);
    const [startPos, setStartPos] = useState(initialStart);
    const [endPos, setEndPos] = useState(initialEnd);
    const [containerWidth, setContainerWidth] = useState(0);

    // Get container width and handle resize
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Convert time to pixel position
    const timeToPosition = useCallback((hours) => {
        return (containerWidth / 24) * hours;
    }, [containerWidth]);

    // Convert pixel position to time
    const positionToTime = useCallback((px) => {
        const segmentWidth = containerWidth / 48; // 30-minute segments
        const snappedPosition = Math.round(px / segmentWidth) * segmentWidth;
        return Math.min(23.5, Math.max(0.5, (snappedPosition / containerWidth) * 24));
    }, [containerWidth]);

    const handleMove = useCallback((e) => {
        if (!containerRef.current || !dragging) return;

        const rect = containerRef.current.getBoundingClientRect();
        const rawX = (e.clientX || e.touches[0].clientX) - rect.left;
        const clampedX = Math.max(0, Math.min(rect.width, rawX));
        const newTime = positionToTime(clampedX);

        if (dragging === 'start') {
            if (newTime >= endPos - 0.5) return;
            setStartPos(newTime);
        } else {
            if (newTime <= startPos + 0.5) return;
            setEndPos(newTime);
        }
    }, [dragging, startPos, endPos, positionToTime]);

    const handleMouseUp = useCallback(() => {
        setDragging(null);
        onChange({ start: startPos, end: endPos });
    }, [onChange, startPos, endPos]);

    // Event listeners for drag
    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchend', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [dragging, handleMove, handleMouseUp]);

    // Generate time markers
    const renderMarkers = () => {
        return Array.from({ length: 25 }).map((_, index) => (
            <div
                key={index}
                className="absolute z-10 h-4 w-px bg-neutral-300 dark:bg-neutral-600"
                style={{ left: `${(index / 24) * 100}%` }}
            >
            </div>
        ));
    };

    // Format time display
    const formatTime = (time) => {
        const hours = Math.floor(time);
        const minutes = time % 1 === 0.5 ? '30' : '00';
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    };

    return (
        <div className="relative w-full py-8" ref={containerRef}>
            {/* Background track */}
            <div className="absolute z-20 h-2 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full top-1/2 -translate-y-1/2" />

            {/* Active range */}
            <motion.div
                className="
                absolute z-20 h-2 rounded-full top-1/2 -translate-y-1/2
                bg-gradient-to-r from-rose-400 via-pink-300 to-rose-400"
                initial={false}
                animate={{
                    left: `${(startPos / 24) * 100}%`,
                    width: `${((endPos - startPos) / 24) * 100}%`
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            />

            {/* Time markers */}
            {renderMarkers()}

            {/* Start handle */}
            <motion.div
                className="
                    absolute z-30 top-5.5 left-2 w-2 h-5 
                    bg-neutral-200 dark:bg-rose-400 rounded-full shadow-lg 
                    border border-3 border-rose-500 dark:border-neutral-800
                    cursor-grab active:cursor-grabbing"
                style={{ x: timeToPosition(startPos) - 12 }}
                initial={false}
                animate={{ x: timeToPosition(startPos) - 12 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onMouseDown={() => setDragging('start')}
                onTouchStart={() => setDragging('start')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <div className="absolute select-none -top-5 left-1/2 -translate-x-1/2 text-xs font-semibold font-montserrat text-rose-500 dark:text-rose-400">
                    {formatTime(startPos)}
                </div>
            </motion.div>

            {/* End handle */}
            <motion.div
                className="
                    absolute z-30 top-5.5 left-2 w-2 h-5 
                    bg-neutral-200 dark:bg-rose-400 rounded-full shadow-lg 
                    border border-3 border-rose-500 dark:border-neutral-800
                    cursor-grab active:cursor-grabbing"
                style={{ x: timeToPosition(endPos) - 12 }}
                initial={false}
                animate={{ x: timeToPosition(endPos) - 12 }}
                transition={{ duration: 0.3 }}
                onMouseDown={() => setDragging('end')}
                onTouchStart={() => setDragging('end')}
                whileHover={{ scale: 1.1 }}
            >
                <div
                    className="
                    absolute select-none z-10 -top-5 left-1/2 -translate-x-1/2 text-xs font-semibold font-montserrat text-rose-500 dark:text-rose-400"
                >
                    {formatTime(endPos)}
                </div>
            </motion.div>
        </div>
    );
};

export default TimeRangeSlider;