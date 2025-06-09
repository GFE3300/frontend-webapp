import { useState, useEffect, useRef, useCallback } from 'react';
import { subDays, addDays, isEqual } from 'date-fns';
import { useMetricStore } from '../../shared/context/MetricProvider';

/** 
 * Status states for data loading lifecycle
 * @enum {string}
 */
const LOAD_STATUS = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error'
};

/**
 * Custom hook for managing time-bound metric data loading and state
 * @param {Date} start - Start date of target range
 * @param {Date} end - End date of target range
 * @returns {Object} Hook state containing:
 *   - status: Current load status
 *   - period: Loaded TimePeriod instance
 *   - error: Error details if applicable
 *   - retry: Function to reset and reload data
 */
export const useCombinedData = (start, end, granularity) => {
    const metricStore = useMetricStore();
    const [state, setState] = useState({
        status: LOAD_STATUS.IDLE,
        period: null,
        error: null
    });

    // Reference for tracking date changes
    const prevDates = useRef({ start: null, end: null });

    /**
     * Validates date parameters and checks for equality
     * @private
     */
    const datesChanged = useCallback(() => {
        const sameStart = isEqual(start, prevDates.current.start);
        const sameEnd = isEqual(end, prevDates.current.end);
        return !sameStart || !sameEnd;
    }, [start, end]);

    /**
     * Handles data loading with buffer period and state management
     * @private
     */
    const loadData = useCallback(async (currentStart, currentEnd) => {
        try {
            setState(prev => ({ ...prev, status: LOAD_STATUS.LOADING }));

            // Load extended range for caching
            const bufferStart = subDays(currentStart, 7);
            const bufferEnd = addDays(currentEnd, 7);

            const loadSuccess = await metricStore.loadRange(bufferStart, bufferEnd);
            if (!loadSuccess) {
                throw new Error('Failed to load metric data from store');
            }

            // Validate period structure
            const period = metricStore.getPeriod(granularity, currentStart);
            if (!period?.metrics) {
                throw new Error('Malformed period data structure received');
            }

            setState({
                status: LOAD_STATUS.SUCCESS,
                period,
                error: null
            });

        } catch (error) {
            console.error('Metric data load failure:', {
                range: { start: currentStart, end: currentEnd },
                error: error.message
            });

            setState({
                status: LOAD_STATUS.ERROR,
                period: null,
                error: error.message
            });
        }
    }, [metricStore, granularity]);

    // Effect for triggering data loads on date changes
    useEffect(() => {
        if (!(start instanceof Date) || !(end instanceof Date)) {
            console.warn('Invalid date parameters provided', { start, end });
            return;
        }

        if (!datesChanged()) return;

        // Update reference and trigger load
        prevDates.current = { start, end };
        loadData(start, end);
    }, [start, end, loadData, datesChanged]);

    return {
        ...state,
        retry: () => setState({
            ...state,
            status: LOAD_STATUS.IDLE,
            error: null
        })
    };
};