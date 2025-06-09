import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { startOfDay, endOfWeek, addDays, subDays, eachDayOfInterval, startOfWeek, isValid } from 'date-fns';
import { useMetricStore } from '../../shared/context/MetricProvider';

/**
 * Custom hook for weekly client block data aggregation
 * @param {Object} params
 * @param {Date} params.startDate - Starting date for first week block
 * @param {number} params.numberOfBlocks - Number of weeks to include
 * @param {Object} params.timeRange - { startHour: number, endHour: number }
 * @param {number} params.bufferDays - Additional days to load before/after visible range
 */
export const useWeeklyClientBlocks = ({
    startDate,
    numberOfBlocks,
    timeRange = { startHour: 8, endHour: 16 },
    bufferDays = 0
}) => {

    const metricStore = useMetricStore();
    const [state, setState] = useState({
        status: 'idle',
        blocks: [],
        error: null
    });

    const configFingerprint = useRef(null);

    // Generate weekly block definitions
    const weeklyBlocks = useMemo(() => {
        // --- REFINED: Guard against invalid or null dates ---
        if (!startDate || !isValid(startDate)) return [];

        const alignedStart = startOfWeek(startDate, { weekStartsOn: 0 });
        return Array.from({ length: numberOfBlocks }, (_, weekIndex) => {
            const weekStart = addDays(alignedStart, weekIndex * 7);
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });

            return {
                weekStart,
                weekEnd,
                days: eachDayOfInterval({ start: weekStart, end: weekEnd })
            };
        });
    }, [startDate, numberOfBlocks]);

    // Data loading and processing pipeline
    const loadWeeklyData = useCallback(async () => {
        // --- REFINED: Guard against running with no defined blocks to prevent faulty API calls ---
        if (!weeklyBlocks || weeklyBlocks.length === 0) {
            setState({ status: 'success', blocks: [], error: null });
            return;
        }

        try {
            setState(prev => ({ ...prev, status: 'loading' }));

            // Calculate extended date range with buffer (now safe due to guard)
            const firstDay = weeklyBlocks[0].days[0];
            const lastDay = weeklyBlocks[weeklyBlocks.length - 1].days.slice(-1)[0];

            const loadStart = subDays(firstDay, bufferDays);
            loadStart.setUTCHours(timeRange.startHour, 0, 0, 0); // Ensure full day coverage

            const loadEnd = addDays(lastDay, bufferDays);
            loadEnd.setUTCHours(timeRange.endHour, 0, 0, 0); // End of the last day

            // Fetch data from store
            await metricStore.loadRange(loadStart, loadEnd);

            // Process weekly data
            const processedBlocks = weeklyBlocks.map(week => {
                const dailyClients = week.days.map(day => {
                    const startHour = timeRange.startHour || 0;
                    const endHour = timeRange.endHour || 23;
                    let sum = 0;

                    for (let hour = startHour; hour <= endHour; hour++) {
                        const date = new Date(day);
                        date.setUTCHours(hour, 0, 0, 0); // Use UTC to match your data format
                        const key = date.toISOString();
                        const entry = metricStore.raw.get(key);
                        sum += entry?.customers || 0;
                    }

                    return sum;
                });

                return {
                    ...week,
                    totalClients: dailyClients.reduce((sum, val) => sum + val, 0),
                    dailyClients
                };
            });

            setState({
                status: 'success',
                blocks: processedBlocks,
                error: null
            });

        } catch (error) {
            setState({
                status: 'error',
                blocks: [],
                error: error.message
            });
        }
    }, [weeklyBlocks, metricStore, bufferDays, timeRange.startHour, timeRange.endHour]);

    // Smart reload trigger based on configuration changes
    useEffect(() => {
        const newFingerprint = JSON.stringify({
            startDate: startDate?.toISOString(),
            numberOfBlocks,
            timeRange,
            bufferDays
        });

        if (newFingerprint !== configFingerprint.current) {
            configFingerprint.current = newFingerprint;
            loadWeeklyData();
        }
    }, [startDate, numberOfBlocks, timeRange, bufferDays, loadWeeklyData]);

    return {
        ...state,
        refresh: () => {
            configFingerprint.current = null;
            loadWeeklyData();
        }
    };
};