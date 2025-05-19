// src/components/dashboard/StatCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../components/common/Icon';

const StatCard = ({ title, value, iconName, iconColorClass = 'text-rose-500', trend, trendDirection }) => {
    return (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase">{title}</p>
                    <p className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-full bg-opacity-10 ${iconColorClass.replace('text-', 'bg-')} ${iconColorClass}`}>
                    <Icon name={iconName} className="h-6 w-6" />
                </div>
            </div>
            {trend && (
                <div className={`mt-3 flex items-center text-xs ${trendDirection === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    <Icon name={trendDirection === 'up' ? 'arrow_upward' : 'arrow_downward'} className="w-4 h-4 mr-1" />
                    <span>{trend}</span>
                    <span className="ml-1 text-neutral-500 dark:text-neutral-400">vs last period</span>
                </div>
            )}
        </div>
    );
};

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    iconName: PropTypes.string.isRequired,
    iconColorClass: PropTypes.string,
    trend: PropTypes.string,
    trendDirection: PropTypes.oneOf(['up', 'down']),
};

export default StatCard;