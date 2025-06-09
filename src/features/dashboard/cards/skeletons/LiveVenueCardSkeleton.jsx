// FILE: src/features/dashboard/cards/LiveVenueCardSkeleton.jsx
// ACTION: CREATED

import React from 'react';

const LiveVenueCardSkeleton = () => {
    return (
        <div className="h-full bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-1/3 bg-neutral-300 dark:bg-neutral-600 rounded-md"></div>
                <div className="h-7 w-1/4 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
            </div>
            <div className="flex-grow bg-neutral-100 dark:bg-neutral-900/50 rounded-lg p-2">
                <div className="grid grid-cols-5 gap-2 h-full">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                    ))}
                    <div className="h-10 bg-neutral-300 dark:bg-neutral-600 rounded col-span-2"></div>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i + 10} className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LiveVenueCardSkeleton;