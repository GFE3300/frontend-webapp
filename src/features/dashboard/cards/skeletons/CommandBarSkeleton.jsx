// src/features/dashboard/cards/skeletons/CommandBarSkeleton.jsx

import React from 'react';

const PlaceholderCard = () => (
    <div className="rounded-3xl bg-white dark:bg-neutral-800/80 shadow-lg h-48 w-full flex flex-col p-4 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex w-full justify-between items-start text-neutral-500 dark:text-neutral-300 mb-2">
            <div className="h-5 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
            <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded-xl"></div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-grow flex items-start justify-start mt-4">
            <div className="h-12 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
        </div>

        {/* Footer Skeleton */}
        <div className="h-10 border-t border-neutral-200/50 dark:border-neutral-700/50 flex items-center">
            <div className="h-6 w-1/4 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
        </div>
    </div>
);

const CommandBarSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PlaceholderCard />
            <PlaceholderCard />
            <PlaceholderCard />
            <PlaceholderCard />
        </div>
    );
};

export default CommandBarSkeleton;