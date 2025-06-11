import React from 'react';

/**
 * A generic, animated skeleton for the heatmap grid.
 * It dynamically creates a grid of placeholder cells.
 */
const GridSkeleton = () => {
    return (
        <div className="w-full h-full p-4 animate-pulse">
            <div className="flex w-full h-full gap-2">
                {/* Row Headers Skeleton */}
                <div className="w-12 space-y-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-8 rounded bg-neutral-300 dark:bg-neutral-700"></div>
                    ))}
                </div>
                {/* Grid Cells Skeleton */}
                <div className="flex-grow grid grid-cols-7 gap-1">
                    {Array.from({ length: 28 }).map((_, i) => (
                        <div key={i} className="h-8 rounded bg-neutral-300 dark:bg-neutral-700"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GridSkeleton;