import React from 'react';

const PlaceholderCard = () => (
    <div className="p-4 rounded-xl border bg-white dark:bg-gray-800 shadow-sm animate-pulse h-40">
        <div className="flex justify-between items-center mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
    </div>
);

const CommandBarSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
                <PlaceholderCard key={index} />
            ))}
        </div>
    );
};

export default CommandBarSkeleton;