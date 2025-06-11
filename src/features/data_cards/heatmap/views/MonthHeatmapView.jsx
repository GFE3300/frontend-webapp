import React, { useMemo, useRef, useEffect } from 'react';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { useWeeklyClientBlocks } from '../hooks/useWeeklyClientBlocks';
import { useResponsiveSize } from '../../../../hooks/useResponsiveSize';
import useNumberGroups from '../../../../hooks/useNumberGroups';
import MonthHeatmapGrid from '../subcomponents/MonthHeatmapGrid';
import GridContainer from '../subcomponents/GridContainer';

const HEATMAP_THEME = ['bg-rose-400/20', 'bg-rose-400/60', 'bg-rose-400/80', 'bg-rose-400'];

export default function MonthHeatmapView({
    settings,
    setColorRanges,
    setIndexLabels
}) {
    const containerRef = useRef(null);
    const size = useResponsiveSize(containerRef);

    const { status, blocks } = useWeeklyClientBlocks(settings);

    // --- REFINED: Directly derive heatmap data, max value, and week starts from blocks ---
    const { heatmapData, maxValue, weekStarts } = useMemo(() => {
        if (!blocks || blocks.length === 0) {
            return { heatmapData: [], maxValue: 0, weekStarts: [] };
        }
        // The data is already structured by week, with daily client counts.
        const data = blocks.map(block => block.dailyClients || []);
        const max = Math.max(0, ...data.flat());
        const starts = blocks.map(block => block.weekStart);

        return { heatmapData: data, maxValue: max, weekStarts: starts };
    }, [blocks]);

    // --- REFINED: Dependency array is now cleaner ---
    const normalizedData = useMemo(() => {
        if (maxValue === 0) return heatmapData.map(week => week.map(() => 0));
        return heatmapData.map(week =>
            week.map(value => (value / maxValue) * 100)
        );
    }, [heatmapData, maxValue]);

    const flatData = useMemo(() => normalizedData.flat(), [normalizedData]);
    const { groups: percentageRanges } = useNumberGroups(flatData);

    useEffect(() => {
        if (percentageRanges && maxValue > 0) {
            const newIndexLabels = percentageRanges.map(([min]) => `< ${Math.round(min * (maxValue / 100))}`);
            setIndexLabels(newIndexLabels);
        } else {
            setIndexLabels([]);
        }
    }, [percentageRanges, maxValue, setIndexLabels]);

    useEffect(() => {
        setColorRanges(HEATMAP_THEME);
    }, [setColorRanges]);

    const findGroupIndex = useMemo(() => {
        if (!percentageRanges || percentageRanges.length === 0) {
            return () => 0; // Return a function that always returns 0 if no ranges.
        }
        // This function now correctly finds which group a value belongs to.
        return (value) => {
            const index = percentageRanges.findIndex(([maxVal]) => value <= maxVal);
            if (index === -1) {
                // Should not happen if data is normalized correctly, but as a fallback:
                return percentageRanges.length - 1;
            }
            return index;
        };
    }, [percentageRanges]);

    if (status === 'loading') {
        return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    if (status === 'success' && (!heatmapData || heatmapData.length === 0 || weekStarts.length === 0)) {
        return <div className="flex items-center justify-center h-full text-sm text-gray-500">No activity data for this period.</div>;
    }

    return (
        <GridContainer ref={containerRef} size={size}>
            <MonthHeatmapGrid
                weekStarts={weekStarts}
                heatmapData={normalizedData}
                maxValue={maxValue}
                findGroupIndex={findGroupIndex}
                theme={HEATMAP_THEME}
                size={size}
                timeRange={settings.timeRange}
            />
        </GridContainer>
    );
}