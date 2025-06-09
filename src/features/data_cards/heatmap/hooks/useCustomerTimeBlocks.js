import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    subDays, addDays, startOfDay, addHours,
    isWithinInterval, eachHourOfInterval, isValid
} from 'date-fns';
import { useMetricStore } from '../../shared/context/MetricProvider';

/**
 * Time block configuration parameters:
 * @typedef {Object} BlockConfig
 * @property {number} blockStartHour - Starting hour for first block (0-23)
 * @property {number} blockDuration - Duration of each block in hours
 * @property {number} numberOfDays - Number of days to visualize
 */

/**
 * Enhanced hook for customer heatmap data with time block segmentation
 * 
 * Key optimizations:
 * 1. Time block memoization to prevent redundant calculations
 * 2. Adaptive data loading based on visible blocks
 * 3. Smart cache invalidation using block fingerprints
 * 4. Fallback handling for partial data scenarios
 */
export const useCustomerTimeBlocks = (settings) => {
    const {
        startDay,
        blockStartHour,
        blockDuration,
        numberOfDays
    } = settings;
    const metricStore = useMetricStore();
    const [state, setState] = useState({
        status: 'idle',
        blocks: [],
        error: null
    });

    const blockFingerprint = useRef(null);

    /**
     * Generates time block definitions without data
     * Memoized to prevent recalculation on unrelated renders
     */
    const timeBlockDefinitions = useMemo(() => {
        // --- REFINED: Add guard clause for invalid dates to prevent crashes. ---
        if (!startDay || !isValid(startDay)) {
            return [];
        }

        const blocks = [];
        const dayStart = startOfDay(startDay);

        // Generate blocks for each day
        for (let day = 0; day < numberOfDays; day++) {
            const currentDay = addDays(dayStart, day);

            let blockStart = addHours(currentDay, blockStartHour);
            while (isWithinInterval(blockStart, {
                start: currentDay,
                end: addDays(currentDay, 1)
            })) {
                const blockEnd = addHours(blockStart, blockDuration);

                blocks.push({
                    start: blockStart,
                    end: blockEnd,
                    hours: eachHourOfInterval({ start: blockStart, end: blockEnd }),
                    customers: 0
                });

                blockStart = blockEnd;
            }
        }

        return blocks;
    }, [startDay, blockStartHour, blockDuration, numberOfDays]);

    /**
     * Data hydration pipeline:
     * 1. Check cache for existing data blocks
     * 2. Load missing raw data with buffer
     * 3. Aggregate customer counts per block
     * 4. Validate data completeness
     */
    const loadAndProcessData = useCallback(async () => {
        // --- REFINED: If no blocks are defined, set state to success with empty data. ---
        if (!timeBlockDefinitions || timeBlockDefinitions.length === 0) {
            setState({ status: 'success', blocks: [], error: null });
            return;
        }

        try {
            setState(prev => ({ ...prev, status: 'loading' }));

            // Calculate required data range with buffer
            const firstBlockStart = timeBlockDefinitions[0].start;
            const lastBlockEnd = timeBlockDefinitions[timeBlockDefinitions.length - 1].end;
            const loadStart = subDays(firstBlockStart, 1);
            const loadEnd = addDays(lastBlockEnd, 1);

            // Load raw metrics
            await metricStore.loadRange(loadStart, loadEnd);

            // Aggregate customers per block
            const hydratedBlocks = timeBlockDefinitions.map(block => {
                const customers = block.hours.reduce((sum, hour) => {
                    const data = metricStore.raw.get(hour.toISOString());
                    return sum + (data?.customers || 0);
                }, 0);

                return { ...block, customers };
            });

            // Validate data coverage
            const missingDataBlocks = hydratedBlocks.filter(b =>
                b.hours.some(h => !metricStore.raw.has(h.toISOString()))
            );

            if (missingDataBlocks.length > 0) {
                console.warn('Partial data for blocks:', missingDataBlocks);
            }

            setState({
                status: 'success',
                blocks: hydratedBlocks,
                error: null
            });

        } catch (error) {
            setState({
                status: 'error',
                blocks: [],
                error: error.message
            });
        }
    }, [timeBlockDefinitions, metricStore]);

    /**
     * Smart reload trigger:
     * - Detects configuration changes via fingerprinting
     *- Only reloads when essential parameters change
     */
    useEffect(() => {
        const newFingerprint = JSON.stringify({
            startDay: startDay?.toISOString() || '',
            blockStartHour,
            blockDuration,
            numberOfDays
        });

        if (newFingerprint !== blockFingerprint.current) {
            blockFingerprint.current = newFingerprint;
            loadAndProcessData();
        }
    }, [startDay, blockStartHour, blockDuration, numberOfDays, loadAndProcessData]);

    /**
     * Performance considerations:
     * - Memoized block definitions prevent expensive recalculations
     * - Batch data loading minimizes store interactions
     * - Fingerprint checking avoids unnecessary reloads
     * - Hour aggregation uses efficient reducer pattern
     */
    return {
        ...state,
        retry: () => {
            blockFingerprint.current = null;
            loadAndProcessData();
        }
    };
};