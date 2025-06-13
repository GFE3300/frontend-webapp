import React from 'react';

const SkeletonRow = () => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 dark:border-neutral-700/40">
        <div className="space-y-2">
            <div className="h-4 w-48 rounded bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="h-3 w-32 rounded bg-neutral-200 dark:bg-neutral-700"></div>
        </div>
        <div className="flex items-center gap-2">
            <div className="h-8 w-20 rounded-md bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="h-8 w-20 rounded-md bg-neutral-200 dark:bg-neutral-700"></div>
        </div>
    </div>
);

const PendingInvitationsCardSkeleton = () => (
    <div className="bg-gradient-to-br from-white/10 to-white/0 dark:bg-neutral-800/50 backdrop-blur-xl border border-white/20 dark:border-neutral-700 shadow-lg rounded-4xl font-montserrat animate-pulse">
        <header className="p-6 md:p-8 border-b border-white/10 dark:border-neutral-700">
            <div className="h-6 w-1/2 bg-neutral-300 dark:bg-neutral-600 rounded-md"></div>
        </header>
        <div className="p-6 md:p-8">
            <SkeletonRow />
            <SkeletonRow />
        </div>
    </div>
);

export default PendingInvitationsCardSkeleton;