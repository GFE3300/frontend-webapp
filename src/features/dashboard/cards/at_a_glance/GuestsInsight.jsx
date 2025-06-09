// src/features/dashboard/cards/at_a_glance/GuestsInsight.jsx

import React from 'react';
import LineChart from '../../../../components/common/LineChart';
import Icon from '../../../../components/common/Icon';

const GuestsInsight = ({ data }) => {
    const {
        peak_hour = "N/A",
        today_hourly_counts = [],
        comparison_hourly_counts = [],
    } = data || {};

    return (
        <div className="flex flex-col h-full p-4 justify-between">
            <div>
                <h4 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Guest Flow</h4>
                <div className="mt-2 -mx-2">
                    <LineChart
                        data={today_hourly_counts}
                        comparisonData={comparison_hourly_counts}
                        width={170} // Adjusted for padding
                        height={60}
                    />
                </div>
            </div>
            <div className="flex items-center justify-between text-center border-t border-neutral-200 dark:border-neutral-700 pt-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Today</span>
                </div>
                <div className="flex flex-col items-center">
                    <Icon name="timer" className="text-base text-neutral-500" />
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 -mt-0.5">Peak Hour</span>
                    <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{peak_hour}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full border-2 border-dashed border-neutral-400" />
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Prev.</span>
                </div>
            </div>
        </div>
    );
};

export default GuestsInsight;