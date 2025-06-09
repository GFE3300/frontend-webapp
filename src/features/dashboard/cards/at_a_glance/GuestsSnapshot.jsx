import React from 'react';
import Icon from '../../../../components/common/Icon';

const GuestsSnapshot = ({ data }) => {
    const { current_value = 0, comparison_percentage = 0, comparison_label = "" } = data || {};

    const isPositive = comparison_percentage >= 0;
    const colorClass = isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    const iconName = isPositive ? 'arrow_upward' : 'arrow_downward';

    return (
        <div className="flex flex-col justify-between h-full p-4">
            <div>
                <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Guests Today</p>
                <p className="text-5xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                    {current_value}
                </p>
            </div>
            <div className="flex items-center self-end">
                {comparison_percentage !== null && (
                    <div className={`flex items-center font-semibold text-sm ${colorClass}`}>
                        <Icon name={iconName} className="h-4 w-4" />
                        <span className="ml-0.5">{Math.abs(comparison_percentage)}%</span>
                        <span className="ml-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-normal">{comparison_label}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuestsSnapshot;