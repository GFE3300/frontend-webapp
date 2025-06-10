import React from 'react';

const AtAGlanceCard = () => {
    // This component is obsolete and has been replaced by the new "Command Bar" cards
    // in the OverviewPage.jsx. It can be safely removed or kept as an archive.
    return (
        <div className="bg-neutral-100 dark:bg-neutral-900/50 rounded-2xl shadow-lg p-4 sm:p-6 space-y-4 min-h-[500px]">
            <header className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                    Mission Control
                </h2>
            </header>
            <div className="text-center text-neutral-500 dark:text-neutral-400 py-16">
                (This component has been deprecated and replaced by the new Command Bar.)
            </div>
        </div>
    );
};

export default AtAGlanceCard;