import React from 'react';
import PropTypes from 'prop-types';

import { scriptLines_ProductsTable as scriptLines } from '../../utils/script_lines.js';

const SalesSparkline = ({ data }) => {
    if (!data || data.length < 2) {
        return <div className="h-8 w-full text-xs text-neutral-400 dark:text-neutral-500 flex items-center justify-center italic">{scriptLines.salesSparkline.noData}</div>;
    }

    // This is a very rudimentary SVG sparkline. A library would be much better.
    const width = 80;
    const height = 32;
    const maxVal = Math.max(...data, 0);
    const minVal = Math.min(...data);
    const range = maxVal - minVal;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (range === 0 ? height / 2 : ((d - minVal) / range) * (height - 4)) - 2;
        return `${x},${y}`;
    }).join(' ');

    const tooltipText = scriptLines.salesSparkline.tooltip.replace('{data}', data.join(', '));

    return (
        <div className="w-full h-8" title={tooltipText}>
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full">
                <polyline
                    points={points}
                    fill="none"
                    stroke="currentColor"
                    className="text-rose-500 dark:text-rose-400"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
};

SalesSparkline.propTypes = {
    data: PropTypes.arrayOf(PropTypes.number),
};

SalesSparkline.defaultProps = {
    data: [],
};

export default SalesSparkline;