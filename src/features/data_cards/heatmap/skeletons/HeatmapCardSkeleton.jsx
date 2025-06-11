// src/features/data_cards/heatmap/skeletons/HeatmapCardSkeleton.jsx
import React from 'react';

const HeatmapCardSkeleton = () => {
    return (
        <div className="relative flex flex-col items-center justify-center w-full h-full animate-pulse">
            {/* Title Bar Skeleton */}
            <div className="flex w-full justify-between items-center gap-4 mb-1 px-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 p-2 rounded-xl bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="h-6 w-40 rounded-lg bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-neutral-200 dark:bg-neutral-700"></div>
            </div>

            <div className="relative py-8 px-6 w-full bg-white dark:bg-neutral-800 shadow-xl rounded-4xl">
                {/* Heatmap Header Skeleton */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-3 md:space-y-0">
                    {/* Legend Skeleton */}
                    <div className="flex items-center gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
                                <div className="h-3 w-12 rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
                            </div>
                        ))}
                    </div>
                    {/* View Toggle Skeleton */}
                    <div className="h-8 w-24 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                </div>

                {/* Heatmap Grid Skeleton */}
                <div className="flex flex-col items-center justify-center w-full space-y-1">
                    {/* Row headers + Grid */}
                    <div className="flex w-full gap-2">
                        <div className="w-12 space-y-1">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-8 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            ))}
                        </div>
                        <div className="flex-grow grid grid-cols-7 gap-1">
                            {Array.from({ length: 28 }).map((_, i) => (
                                <div key={i} className="h-8 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            ))}
                        </div>
                    </div>
                    {/* Column footers */}
                    <div className="flex w-full gap-2 pl-[56px]">
                        <div className="flex-grow grid grid-cols-7 gap-1">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div key={i} className="h-4 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeatmapCardSkeleton;