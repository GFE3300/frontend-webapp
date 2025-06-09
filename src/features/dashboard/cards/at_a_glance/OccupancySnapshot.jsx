// src/features/dashboard/cards/at_a_glance/OccupancySnapshot.jsx

import React, { useMemo } from 'react';
import RadialProgressBar from '../../../../components/common/RadialProgressBar';

const OccupancySnapshot = ({ data }) => {
    const { active_tables = 0, total_tables = 0 } = data || {};

    const occupancyPercentage = useMemo(() => {
        return total_tables > 0 ? Math.round((active_tables / total_tables) * 100) : 0;
    }, [active_tables, total_tables]);

    const occupancyColor = useMemo(() => {
        if (occupancyPercentage >= 85) return '#ef4444'; // red-500
        if (occupancyPercentage >= 60) return '#f59e0b'; // amber-500
        return '#22c55e'; // green-500
    }, [occupancyPercentage]);

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            <div className="relative">
                <RadialProgressBar
                    progress={occupancyPercentage}
                    size={110}
                    strokeWidth={11}
                    color={occupancyColor}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
                        {active_tables}
                    </span>
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 -mt-1">
                        / {total_tables} Tables
                    </span>
                </div>
            </div>
            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mt-2">
                Venue Occupancy
            </span>
        </div>
    );
};

export default OccupancySnapshot;