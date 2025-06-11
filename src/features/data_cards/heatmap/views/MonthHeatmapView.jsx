import React, { useMemo, useRef, useEffect } from 'react';
import { useWeeklyClientBlocks } from '../hooks/useWeeklyClientBlocks';
import { useResponsiveSize } from '../../../../hooks/useResponsiveSize';
import useNumberGroups from '../../../../hooks/useNumberGroups';
import MonthHeatmapGrid from '../subcomponents/MonthHeatmapGrid';
import GridContainer from '../subcomponents/GridContainer';
import GridSkeleton from '../skeletons/GridSkeleton'; // Import the skeleton
import Icon from '../../../../components/common/Icon'; // Import for error state

const HEATMAP_THEME = ['bg-rose-400/20', 'bg-rose-400/60', 'bg-rose-400/80', 'bg-rose-400'];

/**
 * Renders an error state.
 * @param {object} props - Component props.
 * @param {string} props.message - The error message to display.
 */
const ErrorState = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-red-500">
        <Icon name="error_outline" className="h-10 w-10 mb-2" />
        <p className="font-semibold">Could not load heatmap data</p>
        <p className="text-xs">{message}</p>
    </div>
);

export default function MonthHeatmapView({
    settings,
    setColorRanges,
    setIndexLabels
}) {
    const containerRef = useRef(null);
    const size = useResponsiveSize(containerRef);

    const { status, blocks, error } = useWeeklyClientBlocks(settings);

    const { heatmapData, maxValue, weekStarts } = useMemo(() => {
        if (!blocks || blocks.length === 0) {
            return { heatmapData: [], maxValue: 0, weekStarts: [] };
        }
        const data = blocks.map(block => block.dailyClients || []);
        const max = Math.max(0, ...data.flat());
        const starts = blocks.map(block => block.weekStart);

        return { heatmapData: data, maxValue: max, weekStarts: starts };
    }, [blocks]);

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
            return () => 0;
        }
        return (value) => {
            const index = percentageRanges.findIndex(([maxVal]) => value <= maxVal);
            if (index === -1) {
                return percentageRanges.length - 1;
            }
            return index;
        };
    }, [percentageRanges]);

    // Conditional rendering based on the data fetching status
    if (status === 'loading' || status === 'idle') {
        return <GridSkeleton />;
    }

    if (status === 'error') {
        return <ErrorState message={error} />;
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