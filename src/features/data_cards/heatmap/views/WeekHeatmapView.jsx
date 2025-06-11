import React, { useMemo, useRef, useEffect } from 'react';
import { useCustomerTimeBlocks } from '../hooks/useCustomerTimeBlocks';
import { useResponsiveSize } from '../../../../hooks/useResponsiveSize';
import useNumberGroups from '../../../../hooks/useNumberGroups';
import HeatmapGrid from '../subcomponents/HeatmapGrid';
import GridContainer from '../subcomponents/GridContainer';
import { format } from 'date-fns';
import GridSkeleton from '../skeletons/GridSkeleton'; // Import the skeleton
import Icon from '../../../../components/common/Icon'; // Import for error state

const HEATMAP_THEME = ['bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700', 'waving-lines', 'bg-[#fb718580]', 'bg-[#fb7185]'];

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

export default function WeekHeatmapView({
    settings,
    setColorRanges,
    setIndexLabels,
}) {
    const containerRef = useRef(null);
    const size = useResponsiveSize(containerRef);

    const { status, blocks, error } = useCustomerTimeBlocks(settings);

    const { rowLabels, colLabels, heatmapData, maxValue } = useMemo(() => {
        if (!blocks || blocks.length === 0) {
            return { rowLabels: [], colLabels: [], heatmapData: [], maxValue: 0 };
        }

        const blocksByDate = blocks.reduce((acc, block) => {
            const dateKey = format(block.start, 'yyyy-MM-dd');
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(block);
            return acc;
        }, {});

        const colDateKeys = Object.keys(blocksByDate).sort();
        const colLabels = colDateKeys.map(dateKey => format(new Date(dateKey), 'EEE'));

        const firstDayBlocks = blocksByDate[colDateKeys[0]] || [];
        const rowLabels = firstDayBlocks.map(block => format(block.start, 'ha'));

        const heatmapData = rowLabels.map((timeLabel, rowIndex) => {
            return colDateKeys.map(dateKey => {
                const dayBlocks = blocksByDate[dateKey] || [];
                const block = dayBlocks.find(b => format(b.start, 'ha') === timeLabel);
                return block ? block.customers : 0;
            });
        });

        const maxValue = Math.max(0, ...blocks.map(b => b.customers));

        return { rowLabels, colLabels, heatmapData, maxValue };
    }, [blocks]);

    const normalizedData = useMemo(() => {
        if (maxValue === 0) return heatmapData.map(row => row.map(() => 0));
        return heatmapData.map(row => row.map(value => (value / maxValue) * 100));
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

    if (status === 'success' && (!heatmapData || heatmapData.length === 0 || colLabels.length === 0)) {
        return <div className="flex items-center justify-center h-full text-sm text-gray-500">No activity data for this period.</div>;
    }

    return (
        <GridContainer ref={containerRef} size={size}>
            <HeatmapGrid
                size={size}
                rowLabels={rowLabels}
                colLabels={colLabels}
                data={normalizedData}
                maxValue={maxValue}
                theme={HEATMAP_THEME}
                findGroupIndex={findGroupIndex}
                ariaLabel="Weekly customer activity heatmap"
            />
        </GridContainer>
    );
}