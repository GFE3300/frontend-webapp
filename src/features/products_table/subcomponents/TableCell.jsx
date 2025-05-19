import React, { memo } from 'react';
import PropTypes from 'prop-types';

const TableCell = memo(({ children, className = '', isHeader = false, colSpan, 'data-label': dataLabel }) => {
    const Tag = isHeader ? 'th' : 'td';
    const baseClasses = "px-4 py-3 whitespace-nowrap"; // Base padding and nowrap

    return (
        <Tag
            className={`${baseClasses} ${className}`}
            colSpan={colSpan}
            data-label={dataLabel} // For responsive views if headers are hidden
        >
            {children}
        </Tag>
    );
});

TableCell.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    isHeader: PropTypes.bool,
    colSpan: PropTypes.number,
    'data-label': PropTypes.string, // For accessibility in responsive views
};

export default TableCell;