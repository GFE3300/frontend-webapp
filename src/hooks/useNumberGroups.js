// ===========================================================================
// Imports & Constants
// ===========================================================================
import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

// Threshold for minimum viable data points
const MIN_DATA_POINTS = 4;
// Precision for percentage calculations
const PERCENTAGE_PRECISION = 2;

// ===========================================================================
// Custom Hook Definition
// ===========================================================================
/**
 * Custom hook for calculating quartile-based percentage ranges from numerical data
 * 
 * @param {number[]} numbers - Array of numerical values to analyze
 * @returns {{
 *   groups: number[][],
 *   percentageRanges: string[],
 *   error?: string
 * }} Grouped data with percentage ranges and optional error
 */
const useNumberGroups = (numbers) => {
    // ===========================================================================
    // State Management
    // ===========================================================================
    const [groupedData, setGroupedData] = useState({
        groups: null,
        percentageRanges: null,
        error: null
    });

    // ===========================================================================
    // Memoized Data Processing
    // ===========================================================================
    const processedData = useMemo(() => {
        if (!numbers || numbers.length < MIN_DATA_POINTS) {
            return {
                error: `Minimum ${MIN_DATA_POINTS} data points required`
            };
        }

        try {
            // Create a safe copy and sort
            const sorted = [...numbers].sort((a, b) => a - b);

            // Calculate quartile indices
            const n = sorted.length;
            const groupSize = Math.floor(n / 4);
            const remainder = n % 4;

            // Calculate indices with remainder distribution
            const indices = Array.from({ length: 5 }, (_, i) => {
                const base = i * groupSize;
                return base + Math.min(i, remainder);
            });

            // Create quartile groups
            const groups = indices.slice(0, 4).map((start, i) =>
                sorted.slice(start, indices[i + 1])
            );

            // Calculate value ranges
            const minVal = sorted[0];
            const maxVal = sorted[n - 1];
            const range = maxVal - minVal;

            // Handle edge case: all values identical
            if (range === 0) {
                return {
                    groups,
                    percentageRanges: Array(4).fill('0-100%'),
                    error: 'All values are identical'
                };
            }

            // Calculate percentage ranges
            const percentageRanges = groups.map(group => {
                const groupMin = group[0] || minVal;
                const groupMax = group[group.length - 1] || maxVal;

                const start = ((groupMin - minVal) / range * 100)
                    .toFixed(PERCENTAGE_PRECISION);
                const end = ((groupMax - minVal) / range * 100)
                    .toFixed(PERCENTAGE_PRECISION);

                return `${start}% - ${end}%`;
            });

            return { groups, percentageRanges };

        } catch (error) {
            console.error('Data processing error:', error);
            return {
                error: 'Failed to process data'
            };
        }
    }, [numbers]);

    // ===========================================================================
    // Effect for State Synchronization
    // ===========================================================================
    useEffect(() => {
        setGroupedData(prev => ({
            ...prev,
            ...processedData,
            // Preserve previous data during errors
            ...(processedData.error ? {} : {
                groups: processedData.groups,
                percentageRanges: processedData.percentageRanges
            })
        }));
    }, [processedData]);

    return groupedData;
};

// ===========================================================================
// Prop Types & Validation
// ===========================================================================
useNumberGroups.propTypes = {
    numbers: PropTypes.arrayOf(PropTypes.number)
};

export default useNumberGroups;