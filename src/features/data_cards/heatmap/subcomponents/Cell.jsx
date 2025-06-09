import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { EmptyCell, LowCell, MidCell, HighCell } from './CellTypes';

/**
 * Intensity level cell component with strict type safety and error boundaries
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {number} props.percentage - Visual intensity percentage (0-100)
 * @param {number} props.level - Precalculated intensity level (0-3)
 * @param {number} props.maxCustomers - Maximum customers for value calculation
 * @param {string[]} [props.theme] - Tailwind classes for each intensity level
 * @param {Object} [props.style] - Additional inline styles
 * 
 * @example
 * <Cell 
 *   percentage={75}
 *   level={3}
 *   maxCustomers={200}
 *   theme={['bg-gray-100', 'bg-blue-200', 'bg-blue-400', 'bg-blue-600']}
 *   style={{ width: '2rem' }}
 * />
 */
const Cell = memo(({ percentage, level, maxCustomers, theme = [], style = {} }) => {
    // Validate level boundaries
    const clampedLevel = Math.min(Math.max(Number(level), 0), 3);
    const CellComponent = [EmptyCell, LowCell, MidCell, HighCell][clampedLevel];

    // Safely calculate real customer value
    const sanitizedMax = Math.max(Number(maxCustomers), 0);
    const realValue = sanitizedMax > 0
        ? Math.floor((percentage / 100) * sanitizedMax)
        : 0;

    // Merge external styling carefully
    const mergedStyle = {
        ...(CellComponent.defaultStyle || {}),
        ...style
    };

    // Safely resolve theme classes
    const className = theme[clampedLevel]
        ? `${theme[clampedLevel]} ${CellComponent.baseClass || ''}`.trim()
        : CellComponent.baseClass;

    return (
        <CellComponent
            percentage={percentage}
            realValue={realValue}
            className={className}
            style={mergedStyle}
            role="gridcell"
            aria-label={`${realValue} customers (${percentage}% of peak)`}
        />
    );
});

Cell.propTypes = {
    percentage: PropTypes.number.isRequired,
    level: (props, propName) => {
        const value = props[propName];
        if (typeof value !== 'number' || value < 0 || value > 3) {
            return new Error('Level must be integer between 0-3');
        }
    },
    maxCustomers: PropTypes.number.isRequired,
    theme: PropTypes.arrayOf(
        PropTypes.string
    ).isRequired,
    style: PropTypes.shape({
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        // Other valid style properties
    })
};

Cell.defaultProps = {
    theme: [],
    style: {}
};

// Custom comparison for memoization
const areEqual = (prev, next) => (
    prev.percentage === next.percentage &&
    prev.level === next.level &&
    prev.maxCustomers === next.maxCustomers &&
    prev.theme?.join() === next.theme?.join() &&
    JSON.stringify(prev.style) === JSON.stringify(next.style)
);

export default memo(Cell, areEqual);