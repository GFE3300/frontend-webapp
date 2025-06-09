import {
    eachDayOfInterval, eachWeekOfInterval,
    startOfWeek, endOfWeek, startOfMonth, endOfMonth,
    startOfDay, startOfHour, addHours, addDays, subDays
} from 'date-fns';

/**
 * Represents a temporal data structure with hierarchical relationships and metric calculations.
 * Core building block for time-based analytics in the application.
 * 
 * @class TimePeriod
 * 
 * @property {string} type - Temporal granularity (hour/day/week/month)
 * @property {Date} timestamp - Anchor point for period calculations
 * @property {Object} config - Business rules for metrics calculation
 * @property {TimePeriod[]} children - Child periods in hierarchy
 * @property {Object} metrics - Calculated business metrics
 */
class TimePeriod {
    /**
     * Creates a time period instance and builds its hierarchy
     * @param {string} type - Temporal granularity (hour/day/week/month)
     * @param {Date} timestamp - Base timestamp for period
     * @param {Object} dataAccessor - Data retrieval interface
     * @param {Object} config - Calculation parameters
     */
    constructor(type, timestamp, dataAccessor, config = {}) {
        // Validate core dependencies
        if (!dataAccessor?.get) {
            throw new Error('Data accessor must implement get() method');
        }

        // Initialize immutable properties
        this.type = type.toLowerCase();
        this.timestamp = new Date(timestamp);
        this.dataAccessor = dataAccessor;
        this.parent = null;

        // Configure with defaults + overrides
        this.config = {
            baselineDays: 28,
            capacityBuffer: 1.2,
            workingHours: [9, 17],
            ...config
        };

        // Initialize mutable state
        this.children = [];
        this.metrics = null;

        // Validate and build
        this.validateType();
        this.buildHierarchy();
    }

    // ---------------------------
    // Core Type Validation
    // ---------------------------

    /** Validates period type against allowed values */
    validateType() {
        const validTypes = ['hour', 'day', 'week', 'month'];
        if (!validTypes.includes(this.type)) {
            throw new Error(`Invalid period type: ${this.type}`);
        }
    }

    // ---------------------------
    // Hierarchy Construction
    // ---------------------------

    /**
     * Builds temporal hierarchy and calculates metrics
     * @throws {Error} On invalid configuration or data failure
     */
    buildHierarchy() {
        try {
            console.debug(`Building ${this.type} hierarchy for`, this.timestamp);

            // Configuration for different period types
            const intervalMap = {
                month: {
                    start: startOfMonth(this.timestamp),
                    end: endOfMonth(this.timestamp),
                    childType: 'week',
                    iterator: eachWeekOfInterval
                },
                week: {
                    start: startOfWeek(this.timestamp),
                    end: endOfWeek(this.timestamp),
                    childType: 'day',
                    iterator: eachDayOfInterval
                },
                day: {
                    start: startOfDay(this.timestamp),
                    end: addDays(startOfDay(this.timestamp), 1),
                    childType: 'hour',
                    iterator: (interval) =>
                        Array.from({ length: 24 }, (_, i) =>
                            addHours(interval.start, i)
                        ),
                },
                hour: {
                    start: startOfHour(this.timestamp),
                    end: addHours(startOfHour(this.timestamp), 1),
                    childType: null, // Terminal node
                    iterator: () => []
                }
            };

            // Validate configuration exists
            const intervalConfig = intervalMap[this.type];
            if (!intervalConfig) {
                throw new Error(`Unsupported period type: ${this.type}`);
            }

            // Destructure validated config
            const { start, end, childType, iterator } = intervalConfig;

            // Recursively create child periods
            this.children = iterator({ start, end }).map(date =>
                new TimePeriod(childType, date, this.dataAccessor)
            );

            // Finalize with metric calculations
            this.calculateMetrics();
        } catch (error) {
            console.error('Hierarchy construction failed:', {
                type: this.type,
                timestamp: this.timestamp,
                error: error.message
            });
            throw error;
        }
    }

    // ---------------------------
    // Data Loading & Metrics
    // ---------------------------

    /** Calculates business metrics with fallback handling */
    calculateMetrics() {
        const rawData = this.dataAccessor.get(this.timestamp) || this.generateFallback();

        const childRevenues = this.children.map(child => child.metrics.revenue);
        const peakRevenue = Math.max(...childRevenues, 0);
        
        this.metrics = {
            timestamp: this.timestamp,
            revenue: rawData?.revenue ?? 0,
            customers: rawData?.customers ?? 0,
            conversions: rawData?.conversions ?? 0,
            baseline: this.calculateBaseline(),
            capacity: (rawData?.revenue ?? 0) * this.config.capacityBuffer,
            peak: peakRevenue,
            average: childRevenues.reduce((sum, val) => sum + val, 0) / childRevenues.length,
        };
    }

    /** Generates zero-value fallback data for missing entries */
    generateFallback() {
        return {
            revenue: 0,
            customers: 0,
            conversions: 0,
            timestamp: this.timestamp
        };
    }

    // ---------------------------
    // Business Logic
    // ---------------------------

    /** Calculates baseline metric from historical data */
    calculateBaseline() {
        const baselineStart = subDays(this.timestamp, this.config.baselineDays);
        const baselineData = this.dataAccessor.get(baselineStart);
        return baselineData?.revenue ?? 0;
    }

    /** Provides comparison metrics for business analysis */
    get comparisons() {
        return {
            previousPeriod: this.calculateComparison('previous'),
            yearly: this.calculateComparison('yearly')
        };
    }
}

export default TimePeriod;