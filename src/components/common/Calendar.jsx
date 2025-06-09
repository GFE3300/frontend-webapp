import { useState, useEffect } from 'react';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isWithinInterval,
    compareAsc,
} from 'date-fns';
import Icon from './Icon';

const Calendar = ({
    mode = 'week',
    onChange,
    initialSelectedStart,
    initialSelectedEnd
}) => {
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialSelectedStart || new Date()));
    const [selection, setSelection] = useState({
        start: initialSelectedStart || null,
        end: initialSelectedEnd || null
    });
    const selectionMode = mode;
    const [ripples, setRipples] = useState([]);
    const [hoverEnd, setHoverEnd] = useState(null);

    useEffect(() => {
        setSelection({
            start: initialSelectedStart || null,
            end: mode === 'week'
                ? initialSelectedStart ? endOfWeek(initialSelectedStart, { weekStartsOn: 0 }) : null
                : initialSelectedEnd || null
        });
    }, [initialSelectedStart, initialSelectedEnd, mode]);
    
    useEffect(() => {
        if (initialSelectedStart && !isSameMonth(currentMonth, initialSelectedStart)) {
            setCurrentMonth(startOfMonth(initialSelectedStart));
        }
    }, []);

    // Month fade-through-background variants
    const monthVariants = {
        initial: { opacity: 0, filter: 'grayscale(100%)' },
        animate: { opacity: 1, filter: 'grayscale(0%)', transition: { duration: 0.5 } },
        exit: { opacity: 0, filter: 'grayscale(100%)', transition: { duration: 0.5 } }
    };

    // Days padded to full weeks
    const daysInMonth = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 }),
        end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
    });

    const handleDateClick = (date) => {
        const dateKey = date.toISOString();
        // Trigger ripples for each cell
        let rippleDates = [];
        if (selectionMode === 'week') {
            const wStart = startOfWeek(date, { weekStartsOn: 0 });
            const wEnd = endOfWeek(date, { weekStartsOn: 0 });
            eachDayOfInterval({ start: wStart, end: wEnd }).forEach(d => rippleDates.push(d.toISOString()));
        } else {
            rippleDates = [dateKey];
        }
        setRipples(prev => [...prev, ...rippleDates]);
        // Clear ripples after animation
        setTimeout(() => {
            setRipples(prev => prev.filter(key => !rippleDates.includes(key)));
        }, 600);

        // Update selection
        if (selectionMode === 'week') {
            const weekStart = startOfWeek(date, { weekStartsOn: 0 });
            const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
            const newSel = { start: weekStart, end: weekEnd };
            setSelection(newSel);
            onChange?.(newSel);
        } else {
            if (!selection.start || (selection.start && selection.end)) {
                setSelection({ start: date, end: null });
            } else {
                const [a, b] = [selection.start, date].sort((x, y) => compareAsc(x, y));
                const newSel = { start: a, end: b };
                setSelection(newSel);
                onChange?.(newSel);
            }
        }
    };

    // Group days into weeks
    const rows = [];
    for (let i = 0; i < daysInMonth.length; i += 7) rows.push(daysInMonth.slice(i, i + 7));

    return (
        <div className="max-w-md px-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <button
                    className="p-2 w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                    <Icon name="chevron_left" />
                </button>
                <h2 className="text-xl font-medium">{format(currentMonth, 'MMMM yyyy')}</h2>
                <button
                    className="p-2 w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                    <Icon name="chevron_right" />
                </button>
            </div>
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-neutral-500 p-1">{d}</div>
                ))}
            </div>

            {/* Animated Month Grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMonth.toISOString()}
                    variants={monthVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    {/* Date Grid */}
                    {rows.map((weekDates, rowIdx) => (
                        <div key={rowIdx} className={`grid grid-cols-7 gap-0 mb-1 relative ${selectionMode === 'week' ? 'group' : ''}`}>
                            {weekDates.map(date => {
                                const key = date.toISOString();
                                const inCurrent = isSameMonth(date, currentMonth);
                                const isSelected = selection.start && (
                                    selectionMode === 'week'
                                        ? isWithinInterval(date, { start: selection.start, end: selection.end })
                                        : (isSameDay(date, selection.start) || (selection.end && isWithinInterval(date, { start: selection.start, end: selection.end })))
                                );
                                // Hover-range gradient
                                const isHoveringRange = selectionMode === 'range' && selection.start && !selection.end && hoverEnd &&
                                    isWithinInterval(date, { start: selection.start, end: hoverEnd < selection.start ? selection.start : hoverEnd });

                                return (
                                    <div
                                        key={key}
                                        className='
                                            flex items-center justify-center 
                                            relative w-full h-6'
                                        onClick={() => handleDateClick(date)}
                                        onMouseEnter={() => selectionMode === 'range' && selection.start && !selection.end && setHoverEnd(date)}
                                        onMouseLeave={() => setHoverEnd(null)}
                                    >
                                        <motion.button
                                            className={
                                                `relative rounded-full h-6 w-6 focus:outline-none` +
                                                `${inCurrent ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-600'} ` +
                                                `${isHoveringRange ? 'bg-rose-300' : isSelected ? 'bg-rose-500 text-white' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'} ` +
                                                `${selectionMode === 'week' && !isSelected ? 'group-hover:bg-rose-300 dark:group-hover:bg-rose-300' : ''} ` +
                                                `${!inCurrent ? 'opacity-60 filter grayscale ' : ''}
                                                font-montserrat font-regular text-xs`
                                            }
                                            whileHover={{ scale: 1.2, boxShadow: '0 8px 15px rgba(0,0,0,0.1)' }}
                                            whileFocus={{ scale: 1.05, boxShadow: '0 8px 15px rgba(0,0,0,0.15)' }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {ripples.includes(key) && (
                                                <motion.span
                                                    className="absolute inset-0 rounded-full bg-rose-300 opacity-50"
                                                    initial={{ scale: 0, opacity: 1 }}
                                                    animate={{ scale: 1.5, opacity: 0 }}
                                                    transition={{ duration: 0.6 }}
                                                />
                                            )}
                                            <span className="relative z-10">{format(date, 'd')}</span>
                                        </motion.button>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </motion.div>
            </AnimatePresence>

            {/* Selection Display */}
            <AnimatePresence>
                {(selection.start || selection.end) && (
                    <motion.div
                        key="selection-display"
                        layout
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
                        exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
                        className="flex items-center gap-2 mt-4 px-4 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
                    >
                        {/* Icon swirls in */}
                        <motion.div
                            className='flex items-center justify-center'
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } }}
                            exit={{ opacity: 0, rotate: -90, transition: { duration: 0.2 } }}
                        >
                            <Icon name="calendar_month" style={{ fontSize: '18px' }} variations={{ fill: 1, weight: 400, grade: 0, opsz: 24 }} />
                        </motion.div>

                        {/* Text slides and fades in */}
                        <motion.div
                            key="selection-text"
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1, transition: { delay: 0.1, type: 'spring', stiffness: 200, damping: 20 } }}
                            exit={{ x: -10, opacity: 0, transition: { duration: 0.2 } }}
                            className="text-xs font-semibold font-montserrat relative"
                        >
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={`${selection.start?.toISOString() || ''}-${selection.end?.toISOString() || ''}`}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
                                    exit={{ opacity: 0, y: -5, transition: { duration: 0.2 } }}
                                    className="block"
                                >
                                    {selectionMode === 'week'
                                        ? `${format(selection.start, 'MMM dd')} - ${format(selection.end, 'MMM dd')}`
                                        : `${selection.start && format(selection.start, 'MMM dd')}${selection.end ? ` - ${format(selection.end, 'MMM dd')}` : ''}`
                                    }
                                </motion.span>
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Calendar;
