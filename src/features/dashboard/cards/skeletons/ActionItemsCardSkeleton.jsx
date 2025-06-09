import React from 'react';

const SkeletonItem = () => (
    <div className="flex items-center p-3 -mx-3">
        <div className="flex-shrink-0 h-6 w-6 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
        <div className="ml-4 h-4 flex-grow bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
    </div>
);

const ActionItemsCardSkeleton = () => {
    return (
        <div className="h-full bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 animate-pulse flex flex-col">
            {/* Skeleton for the "Mission Briefing" title */}
            <div className="h-6 w-2/3 bg-neutral-300 dark:bg-neutral-600 rounded-md mb-4"></div>

            {/* Skeleton for the list of action items */}
            <div className="flex-grow space-y-3">
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
            </div>
        </div>
    );
};

export default ActionItemsCardSkeleton;