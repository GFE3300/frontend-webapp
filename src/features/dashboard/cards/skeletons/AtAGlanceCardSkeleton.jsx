import React from 'react';

const MetricSkeleton = () => (
    <div className="flex-1 p-4 bg-white dark:bg-neutral-800 rounded-xl shadow-sm animate-pulse">
        <div className="flex items-start">
            <div className="p-3 bg-neutral-200 dark:bg-neutral-700/80 rounded-lg">
                <div className="h-6 w-6 bg-neutral-300 dark:bg-neutral-600 rounded"></div>
            </div>
            <div className="ml-4 flex-1">
                <div className="h-4 w-3/4 bg-neutral-300 dark:bg-neutral-600 rounded-md"></div>
                <div className="h-8 w-2/4 bg-neutral-200 dark:bg-neutral-700 rounded-md mt-2"></div>
                <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded-md mt-1.5"></div>
            </div>
        </div>
    </div>
);

const AtAGlanceCardSkeleton = () => {
    return (
        <div className="bg-white dark:bg-neutral-800/50 rounded-xl shadow-lg p-4 sm:p-6 space-y-4">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <div className="h-6 w-1/3 bg-neutral-300 dark:bg-neutral-600 rounded-md"></div>
                <div className="h-8 w-24 bg-neutral-300 dark:bg-neutral-600 rounded-full"></div>
            </div>
            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricSkeleton />
                <MetricSkeleton />
                <MetricSkeleton />
                <MetricSkeleton />
            </div>
        </div>
    );
};

export default AtAGlanceCardSkeleton;