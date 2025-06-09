import React, { useMemo, useState, useRef } from 'react';
import { calculateEnrichedVectors, calculateDualVectors } from '../shared/utils/graphCalculations';
import DataVisualization from './subcomponents/DataVisualization';
import GraphContainer from './subcomponents/GraphContainer';
import { useResponsiveGraph } from './hooks/useResponsiveGraph';
import useDualTooltipSystem from './hooks/useDualTooltipSystem';
import { useCombinedData } from './hooks/useCombinedData';
import { useTimeOptions } from './hooks/useTimeOptions';
import TimeSelector from './time_selector/TimeSelector';
import { MetricProvider } from '../shared/context/MetricProvider';
import TitleBar from './subcomponents/TitleBar';

/**
 * Interactive revenue analytics dashboard component
 * @component
 * @returns {JSX.Element} Revenue visualization interface with time controls
 */
const InteractiveRevenuePage = () => {
    // ===========================================================================
    // Time Selection & Mode State
    // ===========================================================================
    const [mode, setMode] = useState('day');
    const { options, selectedOption, setSelectedOption } = useTimeOptions(mode);
    const { start, end } = options[selectedOption] || {};

    // ===========================================================================
    // Data Loading & State
    // ===========================================================================
    const { status, period } = useCombinedData(start, end, mode);
    const metrics = period?.metrics || {};

    // ===========================================================================
    // Visualization Setup
    // ===========================================================================
    const containerRef = useRef(null);
    const size = useResponsiveGraph(containerRef);

    // ===========================================================================
    // Data Transformations
    // ===========================================================================
    const hourlyData = useMemo(() => {
        if (!period?.children) return [];
        return period.children.map(child => child.metrics);
    }, [period]);

    const enrichedRevenueVectors = useMemo(() => {
        if (status !== 'success' || !hourlyData.length || !size.width) return [];

        const revenueValues = hourlyData.map(h => h.revenue);
        const peak = Math.max(...revenueValues);

        return calculateEnrichedVectors(revenueValues, size, peak);
    }, [status, hourlyData, size]);

    const enrichedCustomerVectors = useMemo(() => {
        if (status !== 'success' || !hourlyData.length || !size.width) return [];

        const customerValues = hourlyData.map(h => h.customers);
        const peak = Math.max(...customerValues);

        return calculateDualVectors(customerValues, size, peak);
    }, [status, hourlyData, size]);

    // ===========================================================================
    // Tooltip System
    // ===========================================================================
    const { generateTooltipContent } = useDualTooltipSystem({
        period,
        containerSize: size,
        temporalMode: mode
    });

    return (
        <div
            className="
                flex flex-col justify-between items-end
                w-full max-w-6xl rounded-b-4xl h-90
                bg-gradient-to-t from-fuchsia-200 from-10% to-neutral-0 to-70%
                dark:bg-gradient-to-t dark:from-fuchsia-700 dark:from-10% dark:to-neutral-0 dark:to-50%"
            style={{ height: size.height + 134 }}
        >
            <TitleBar />
            <TimeSelector
                mode={mode}
                setMode={setMode}
                options={options}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                referenceDate={new Date()}
            />
            <GraphContainer size={size} ref={containerRef}>
                <DataVisualization
                    size={size}
                    hourlyRevenue={hourlyData.map(h => h.revenue)}
                    hourlyCustomers={hourlyData.map(h => h.customers)}
                    enrichedRevenueVectors={enrichedRevenueVectors}
                    enrichedCustomerVectors={enrichedCustomerVectors}
                    generateTooltipContent={generateTooltipContent}
                    startDate={start}
                    endDate={end}
                    baseline={metrics.baseline}
                    capacity={metrics.capacity}
                />
            </GraphContainer>
        </div>
    );
};

export default function RevenueCard() {
    return (
        <MetricProvider>
            <InteractiveRevenuePage />
        </MetricProvider>
    );
}