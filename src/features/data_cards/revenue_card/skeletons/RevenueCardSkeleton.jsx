import React from 'react';

const RevenueCardSkeleton = () => {
    return (
        <div className="flex flex-col justify-between items-end w-full h-full p-4 animate-pulse">
            {/* Title Bar Skeleton */}
            <div className="flex w-full justify-start items-center gap-3 mb-2">
                <div className="h-10 w-10 p-2 rounded-xl bg-neutral-300 dark:bg-neutral-700"></div>
                <div className="h-6 w-32 rounded-lg bg-neutral-300 dark:bg-neutral-700"></div>
            </div>

            {/* Time Selector Skeleton */}
            <div className="w-full flex flex-col space-y-2 mb-2">
                <div className="flex items-center justify-center">
                    <div className="grid grid-cols-7 gap-2 w-full max-w-lg h-[85px]">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center justify-center p-2 rounded-2xl bg-neutral-300 dark:bg-neutral-700 space-y-2">
                                <div className="h-4 w-6 rounded-md bg-neutral-400 dark:bg-neutral-600"></div>
                                <div className="h-3 w-8 rounded-md bg-neutral-400 dark:bg-neutral-600"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Graph Container Skeleton */}
            <div className="relative w-full flex-grow rounded-b-4xl bg-neutral-300 dark:bg-neutral-700">
                {/* Mock graph bars to hint at the content */}
                <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-around px-2">
                    <div className="w-4 h-1/3 bg-neutral-400 dark:bg-neutral-600 rounded-t-sm"></div>
                    <div className="w-4 h-2/3 bg-neutral-400 dark:bg-neutral-600 rounded-t-sm"></div>
                    <div className="w-4 h-1/2 bg-neutral-400 dark:bg-neutral-600 rounded-t-sm"></div>
                    <div className="w-4 h-3/4 bg-neutral-400 dark:bg-neutral-600 rounded-t-sm"></div>
                    <div className="w-4 h-2/5 bg-neutral-400 dark:bg-neutral-600 rounded-t-sm"></div>
                    <div className="w-4 h-3/5 bg-neutral-400 dark:bg-neutral-600 rounded-t-sm"></div>
                    <div className="w-4 h-1/2 bg-neutral-400 dark:bg-neutral-600 rounded-t-sm"></div>
                </div>
            </div>
        </div>
    );
};

export default RevenueCardSkeleton;