import { useCallback, useState, useMemo } from 'react';
import {
    startOfDay, endOfDay,
    startOfWeek, endOfWeek,
    startOfMonth, endOfMonth
} from 'date-fns';
import RevenueTooltip from '../subcomponents/RevenueTooltip';
import CustomerTooltip from '../subcomponents/CustomerTooltip';
import { format } from 'date-fns';
import { WORDS, MONTHS, DAYS } from '../language_script/script_lines';

const useDualTooltipSystem = ({ period, containerSize, temporalMode }) => {
    const [hoverData, setHoverData] = useState(null);

    // Memoized metric collection from period hierarchy
    const { hourlyMetrics, aggregates } = useMemo(() => {
        const children = period?.children || [];
        return {
            hourlyMetrics: children.map(child => child.metrics),
            aggregates: period?.metrics || {}
        };
    }, [period]);

    // Memoized temporal period boundaries
    const { start: periodStart, end: periodEnd } = useMemo(() => {
        if (!period?.timestamp || !temporalMode) return {};

        const periodMap = {
            day: {
                start: startOfDay(period.timestamp),
                end: endOfDay(period.timestamp)
            },
            week: {
                start: startOfWeek(period.timestamp, { weekStartsOn: 1 }),
                end: endOfWeek(period.timestamp, { weekStartsOn: 1 })
            },
            month: {
                start: startOfMonth(period.timestamp),
                end: endOfMonth(period.timestamp)
            }
        };

        return periodMap[temporalMode] || {};
    }, [period, temporalMode]);

    // ===========================================================================
    // Formatting Utilities
    // ===========================================================================
    const formatCurrency = value => `$${value.toFixed(2)}`;

    const formatTimestamp = (date, mode) => {
        const formatters = {
            hour: 'HH:mm',
            day: 'MMM dd',
            week: 'MMM dd',
            month: 'MMM yyyy'
        };
        return format(date, formatters[mode] || 'MMM dd');
    };

    const getTitle = useCallback((timestamp) => {
        // Format based on data point granularity (child type)
        const childTypeMap = {
            day: 'hour',
            week: 'day',
            month: 'week'
        };
        const childType = childTypeMap[temporalMode];
        const formatMap = {
            hour: () => format(timestamp, 'HH:mm'),
            day: () => `${DAYS[format(timestamp, 'EEE')]}, ${MONTHS[format(timestamp, 'MMM')]} ${format(timestamp, 'dd')}`,
            week: () => `${MONTHS[format(timestamp, 'MMM')]} ${format(timestamp, 'yyyy')}`
        };

        return formatMap[childType]?.();
    }, [temporalMode]);

    // ===========================================================================
    // Data Index Resolution
    // ===========================================================================
    const resolveDataIndex = useCallback((xPosition) => {
        if (!containerSize?.width || !hourlyMetrics.length) return -1;

        const maxIndex = hourlyMetrics.length - 1;
        const clampedX = Math.max(0, Math.min(xPosition, containerSize.width));
        return Math.round((clampedX / containerSize.width) * maxIndex);
    }, [containerSize?.width, hourlyMetrics?.length]);

    // ===========================================================================
    // Tooltip Content Generation
    // ===========================================================================
    const generateRevenueTooltip = useCallback((index) => {
        const current = hourlyMetrics[index];
        const previous = hourlyMetrics[index - 1];

        if (!current) return null;

        const percentChange = previous ?
            ((current.revenue - previous.revenue) / previous.revenue * 100).toFixed(1) :
            'N/A';

        return (
            <RevenueTooltip
                title={getTitle(current.timestamp)}
                data={formatCurrency(current.revenue)}
                percentChange={parseFloat(percentChange)} // Convert to number
                time={{
                    period: temporalMode === 'month'
                        ? MONTHS[format(periodStart, 'MMM')]
                        : `${MONTHS[format(periodStart, 'MMM')]} ${format(periodStart, 'dd')}`,
                    range: temporalMode === 'month'
                        ? MONTHS[format(periodStart, 'MMM')]
                        : `${MONTHS[format(periodStart, 'MMM')]} ${format(periodStart, 'dd')} - ${MONTHS[format(periodEnd, 'MMM')]} ${format(periodEnd, 'dd')}`,
                }}
                comparisons={[
                    {
                        label: WORDS['Peak'],
                        value: formatCurrency(aggregates.peak)
                    },
                    {
                        label: WORDS['Average'],
                        value: formatCurrency(aggregates.average)
                    },
                    {
                        label: 'Baseline',
                        value: formatCurrency(aggregates.baseline)
                    }
                ]}
            />
        );
    }, [hourlyMetrics, temporalMode, aggregates, periodStart, periodEnd, getTitle]);

    const generateCustomerTooltip = useCallback((index) => {
        const current = hourlyMetrics[index];
        return current ? (
            <CustomerTooltip
                timestamp={formatTimestamp(current.timestamp, temporalMode)}
                customers={current.customers}
                conversions={current.conversions}
                compact
            />
        ) : null;
    }, [hourlyMetrics, temporalMode]);

    // ===========================================================================
    // Main Tooltip Generator
    // ===========================================================================
    const generateTooltipContent = useCallback((xPosition, isCustomerGraph) => {
        const index = resolveDataIndex(xPosition);

        if (index < 0 || index >= hourlyMetrics.length) return null;

        return isCustomerGraph ?
            generateCustomerTooltip(index) :
            generateRevenueTooltip(index);
    }, [resolveDataIndex, generateCustomerTooltip, generateRevenueTooltip, hourlyMetrics]);

    return {
        hoverState: hoverData,
        updateHoverState: setHoverData,
        generateTooltipContent
    };
};

export default useDualTooltipSystem;