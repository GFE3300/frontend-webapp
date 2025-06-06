// FILE: src/components/common/StatCard.jsx
// This is a new file.
import React from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon'; // Assuming Icon component is available

const StatCard = ({ title, value, iconName, iconColorClass = 'text-primary-500 dark:text-primary-400' }) => {
    return (
        <div className="bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider truncate">{title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100 mt-1">{value}</p>
                </div>
                {iconName && (
                    <div className={`flex-shrink-0 ml-3 p-2 sm:p-3 rounded-full bg-opacity-10 ${iconColorClass.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')} `}>
                        <Icon name={iconName} className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColorClass}`} />
                    </div>
                )}
            </div>
            {/* Optional: Add a change indicator or link here later */}
            {/* <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                <span>+5% from last week</span> 
            </div> */}
        </div>
    );
};

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    iconName: PropTypes.string,
    iconColorClass: PropTypes.string,
};

export default StatCard;