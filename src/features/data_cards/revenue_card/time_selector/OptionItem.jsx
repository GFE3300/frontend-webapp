import React from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { format, getDate } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { MONTHS, DAYS } from '../language_script/script_lines';

const OptionItem = React.memo(({
    date,
    granularity,
    isSelected,
    onSelect
}) => {
    const utcDate = toZonedTime(date, 'UTC');

    // Date formatting based on granularity
    const getLabel = () => {
        switch (granularity) {
            case 'day':
                return DAYS[format(utcDate, 'EEE')];
            case 'week':
                return `Wk ${format(utcDate, 'w')}`;
            case 'month':
                return MONTHS[format(utcDate, 'MMM')];
            default:
                return format(utcDate, 'MMM dd');
        }
    };

    return (
        <motion.button
            className={`
                flex flex-col items-center justify-center py-4 px-4 w-full rounded-2xl
                transition-colors duration-200
                ${isSelected
                    ? 'bg-purple-500 text-white dark:bg-purple-600 dark:text-white'
                    : 'bg-white hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700'}`}
            onClick={onSelect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            role="option"
            aria-selected={isSelected}
        >
            {/* Large number display */}
            <span className="text-lg font-semibold font-montserrat">
                {granularity === 'month' ? format(utcDate, 'MM') : getDate(utcDate)}
            </span>
            {/* Small label */}
            <span
                className={`
                text-xs text-neutral-600 dark:text-neutral-400
                font-medium font-montserrat ${isSelected ? 'text-white' : ''}`}
            >
                {getLabel()}
            </span>
        </motion.button>
    );
});

OptionItem.propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    granularity: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
    isSelected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default OptionItem;