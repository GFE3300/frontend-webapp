import {
    startOfHour, addHours,
} from 'date-fns';
import TimePeriod from './TimePeriod';
import apiService from '../../../../services/api';

/**
 * Central data repository for metric storage and retrieval.
 * Handles data caching, API fetching, and period management.
 *
 * @class MetricStore
 *
 * @property {Map} raw - Primary metric data storage (ISO date → metrics)
 * @property {Map} cache - TimePeriod instance cache (keyObject → TimePeriod)
 */
class MetricStore {
    /**
     * Initializes data stores.
     */
    constructor() {
        // Primary data storage using ISO date strings as keys
        this.raw = new Map();

        // Cache for TimePeriod instances to prevent redundant calculations
        this.cache = new Map();
    }

    // ---------------------------
    // Public Interface
    // ---------------------------

    /**
     * Loads and stores metric data for a specific date range by fetching from the API.
     * @param {Date} start - Start of range (inclusive)
     * @param {Date} end - End of range (inclusive)
     * @returns {Promise<boolean>} Success status
     */
    async loadRange(start, end) {
        try {
            const response = await apiService.get('analytics/timeseries/', {
                params: {
                    start: start.toISOString(),
                    end: end.toISOString(),
                    granularity: 'hour'
                }
            });

            const analyticsData = response.data;

            analyticsData.forEach(entry => {
                const timestampKey = entry.timestamp;

                const metricData = {
                    revenue: parseFloat(entry.total_revenue) || 0,
                    customers: entry.total_customers || 0,
                    conversions: entry.order_count || 0,
                    timestamp: new Date(entry.timestamp),
                };

                this.raw.set(timestampKey, metricData);
            });

            return true;
        } catch (error) {
            console.error('[MetricStore] API Call FAILED:', {
                message: error.message,
                responseData: error.response?.data,
            });
            return false;
        }
    }

    /**
     * Retrieves or creates a TimePeriod with caching
     * @param {string} type - Period granularity (hour/day/week/month)
     * @param {Date} timestamp - Base timestamp for period
     * @returns {TimePeriod} Requested time period instance
     */
    getPeriod(type, timestamp) {
        const keyObject = this._createCacheKey(type, timestamp);

        if (!this.cache.has(keyObject)) {
            this.cache.set(keyObject, this._createTimePeriod(type, timestamp));
        }

        return this.cache.get(keyObject);
    }

    // ---------------------------
    // Data Management
    // ---------------------------

    /**
     * Generates fallback data for missing entries
     * @param {Date} date - Target date for fallback
     * @returns {Object} Zero-value metric structure
     */
    generateFallbackData(date) {
        return {
            revenue: 0,
            customers: 0,
            conversions: 0,
            timestamp: date
        };
    }

    // ---------------------------
    // Private Utilities
    // ---------------------------

    /**
     * Creates a cache key object for period storage
     * @private
     */
    _createCacheKey(type, timestamp) {
        return {
            type,
            isoDate: timestamp.toISOString(), // String-based key component
            timestamp: new Date(timestamp) // Non-mutable date reference
        };
    }

    /**
     * Instantiates a new TimePeriod with data accessor
     * @private
     */
    _createTimePeriod(type, timestamp) {
        return new TimePeriod(type, timestamp, {
            get: (targetDate) => {
                const isoDate = targetDate.toISOString();
                return this.raw.get(isoDate) || this.generateFallbackData(targetDate);
            }
        });
    }
}

export default MetricStore;