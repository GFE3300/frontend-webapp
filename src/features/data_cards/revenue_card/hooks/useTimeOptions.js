import {
    startOfDay, endOfDay,
    endOfWeek,
    endOfMonth,
    subDays, subWeeks, subMonths,
    format, 
    isSameMonth,
    isSameWeek,
    isSameDay
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useMemo, useState } from 'react';

/** 
 * Configuration for number of options to show per temporal mode
 * @constant {Object} OPTION_COUNTS
 */
const OPTION_COUNTS = {
    day: 365,
    week: 52, 
    month: 12   
};

/**
 * Custom hook for generating time selection options based on temporal mode
 * @param {'day'|'week'|'month'} mode - Current temporal granularity
 * @param {Date} [referenceDate=new Date()] - Base date for option calculations
 * @returns {Object} Hook interface containing:
 *   - options: Array of time option objects { label, start, end }
 *   - selectedOption: Current selected option index
 *   - setSelectedOption: Function to update selected index
 */
export const useTimeOptions = (mode, referenceDate = new Date()) => {
    const [selectedOption, setSelectedOption] = useState(0);

    /**
     * Generates time options based on current mode and reference date
     * @returns {Array<Object>} Sorted time options with labels and date ranges
     */
    const options = useMemo(() => {
        const count = OPTION_COUNTS[mode];
        const baseDate = startOfDay(toZonedTime(referenceDate, 'UTC'));

        return Array.from({ length: count * 2 + 1 }, (_, index) => {
            const offset = index - count; // Creates window [-count, +count]

            // Calculate period boundaries
            const { start, end } = calculatePeriodBounds(mode, baseDate, offset);

            return {
                label: generateOptionLabel(mode, start, end),
                start,
                end,
                isCurrent: isCurrentPeriod(mode, start, baseDate)
            };
        }).reverse(); // Return options in chronological order

    }, [mode, referenceDate]);

    return {
        options,
        selectedOption,
        setSelectedOption
    };
};

/**
 * Calculates start/end dates for a temporal period
 * @param {string} mode - Temporal granularity
 * @param {Date} baseDate - Reference date for calculations
 * @param {number} offset - Number of periods to offset from base
 * @returns {Object} Contains start and end Dates for the period
 */
function calculatePeriodBounds(mode, baseDate, offset) {
    // Common configuration for period calculations
    const periodConfig = {
        day: {
            startFn: date => subDays(date, offset),
            endFn: endOfDay
        },
        week: {
            startFn: date => subWeeks(date, offset),
            endFn: date => endOfWeek(date, { weekStartsOn: 1 })
        },
        month: {
            startFn: date => subMonths(date, offset),
            endFn: endOfMonth
        }
    };

    const { startFn, endFn } = periodConfig[mode];
    const start = startFn(baseDate);
    return {
        start,
        end: endFn(start)
    };
}

/**
 * Generates human-readable label for time options
 * @param {string} mode - Temporal granularity
 * @param {Date} start - Period start date
 * @param {Date} end - Period end date
 * @returns {string} Formatted label string
 */
function generateOptionLabel(mode, start, end) {
    const formatMap = {
        day: d => format(d, 'EEE, MMM d'),
        week: () => {
            const formatStart = isSameMonth(start, end)
                ? format(start, 'MMM d')
                : format(start, 'MMM d, yyyy');
            return `${formatStart} - ${format(end, 'MMM d')}`;
        },
        month: d => format(d, 'MMMM yyyy')
    };

    return mode === 'week'
        ? `${formatMap.week(start)} – ${format(end, 'd')}`
        : formatMap[mode](start);
}

/**
 * Determines if a period contains the current date
 * @param {string} mode - Temporal granularity
 * @param {Date} periodStart - Period start date
 * @param {Date} currentDate - Date to check against
 * @returns {boolean} True if period contains current date
 */
function isCurrentPeriod(mode, periodStart, currentDate) {
    const checkers = {
        day: (s, d) => isSameDay(s, d),
        week: (s, d) => isSameWeek(s, d, { weekStartsOn: 1 }),
        month: (s, d) => isSameMonth(s, d)
    };
    return checkers[mode](periodStart, currentDate);
}