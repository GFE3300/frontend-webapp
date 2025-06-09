import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../../components/common/Icon';
import { isValid, addDays, subDays, isWithinInterval } from 'date-fns';
import OptionItem from './OptionItem';

const dateHandler = {
    add: (date, amount, granularity = 'day') => {
        if (!isValid(date)) return new Date();
        const operations = {
            day: addDays,
            week: (d, a) => addDays(d, a * 7),
            month: (d, a) => addDays(d, a * 30), // Approximate for navigation
        };
        return operations[granularity](date, amount);
    },
    subtract: (date, amount, granularity = 'day') => {
        if (!isValid(date)) return new Date();
        const operations = {
            day: subDays,
            week: (d, a) => subDays(d, a * 7),
            month: (d, a) => subDays(d, a * 30), // Approximate for navigation
        };
        return operations[granularity](date, amount);
    }
};

const OptionBar = ({
    granularity,
    options,
    selectedOption,
    onSelect,
    initialDate = new Date(),
}) => {
    const [centerDate, setCenterDate] = useState(initialDate);
    const [visibleCount, setVisibleCount] = useState(7);
    const [itemWidth, setItemWidth] = useState(0);
    const containerRef = useRef(null);
    const directionRef = useRef(0); // To track navigation direction for animations

    const calculateLayout = useCallback(() => {
        if (!containerRef.current) return;
        const containerWidth = containerRef.current.offsetWidth;
        const calculatedCount = Math.floor(containerWidth / 80);
        // Ensure visible count is an odd number for a clear center item
        const newVisibleCount = Math.max(5, calculatedCount % 2 === 0 ? calculatedCount + 1 : calculatedCount);
        setVisibleCount(newVisibleCount);
        setItemWidth(containerWidth / newVisibleCount);
    }, []);

    useEffect(() => {
        calculateLayout();
        window.addEventListener('resize', calculateLayout);
        return () => window.removeEventListener('resize', calculateLayout);
    }, [calculateLayout]);

    const dateWindow = useMemo(() => {
        const windowRadius = Math.floor(visibleCount / 2);
        return Array.from({ length: visibleCount }, (_, i) => {
            const offset = i - windowRadius;
            return dateHandler.add(centerDate, offset, granularity);
        }).filter(isValid);
    }, [centerDate, granularity, visibleCount]);

    const handleNavigate = useCallback((direction) => {
        directionRef.current = direction;
        setCenterDate(prevCenter => {
            const jumpSize = Math.floor(visibleCount / 2) || 1;
            return direction > 0
                ? dateHandler.subtract(prevCenter, jumpSize, granularity)
                : dateHandler.add(prevCenter, jumpSize, granularity);
        });
    }, [granularity, visibleCount]);

    const handleDateSelect = useCallback((date) => {
        const selectedIndex = options.findIndex(opt =>
            isWithinInterval(date, { start: opt.start, end: opt.end })
        );
        if (selectedIndex > -1) {
            onSelect(selectedIndex);
            setCenterDate(date); // Center the view on the selected date
        }
    }, [options, onSelect]);

    const memoizedDates = useMemo(() =>
        dateWindow.map((date) => {
            const optionIndex = options.findIndex(opt =>
                isWithinInterval(date, { start: opt.start, end: opt.end })
            );
            const isSelected = optionIndex === selectedOption;

            return (
                <div
                    key={date.toISOString()}
                    className="flex-shrink-0"
                    style={{ width: itemWidth, padding: '0 4px' }}
                    role="option"
                    aria-selected={isSelected}
                >
                    <OptionItem
                        date={date}
                        granularity={granularity}
                        isSelected={isSelected}
                        onSelect={() => handleDateSelect(date)}
                    />
                </div>
            );
        }), [dateWindow, granularity, handleDateSelect, itemWidth, options, selectedOption]);

    // --- REFINED: Animation is now declarative and state is much simpler ---
    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
        }),
    };

    return (
        <div className="relative w-full flex items-center" role="listbox" style={{ height: 85 }}>
            <motion.button
                onClick={() => handleNavigate(1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-purple-500/80 dark:bg-purple-600/80 hover:bg-purple-600 dark:hover:bg-purple-700 rounded-full shadow-md"
                aria-label="Scroll previous dates"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Icon name="chevron_left" className="w-6 h-6 text-white" />
            </motion.button>

            <div ref={containerRef} className="overflow-x-hidden h-full w-full">
                <AnimatePresence initial={false} custom={directionRef.current}>
                    <motion.div
                        key={centerDate.toISOString()} // Change key to trigger animation
                        custom={directionRef.current}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: 'spring', stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                        }}
                        className="flex absolute inset-0"
                        style={{ width: '100%' }}
                    >
                        {memoizedDates}
                    </motion.div>
                </AnimatePresence>
            </div>

            <motion.button
                onClick={() => handleNavigate(-1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-purple-500/80 dark:bg-purple-600/80 hover:bg-purple-600 dark:hover:bg-purple-700 rounded-full shadow-md"
                aria-label="Scroll next dates"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Icon name="chevron_right" className="w-6 h-6 text-white" />
            </motion.button>
        </div>
    );
};

OptionBar.propTypes = {
    granularity: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
        start: PropTypes.instanceOf(Date).isRequired,
        end: PropTypes.instanceOf(Date).isRequired,
        label: PropTypes.string.isRequired
    })).isRequired,
    selectedOption: PropTypes.number.isRequired,
    onSelect: PropTypes.func.isRequired,
    initialDate: PropTypes.instanceOf(Date),
};

export default React.memo(OptionBar);