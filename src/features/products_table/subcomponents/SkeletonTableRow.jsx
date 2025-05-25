// src/features/products_table/subcomponents/SkeletonTableRow.jsx
import React from 'react';
import PropTypes from 'prop-types';
import SkeletonCell from './SkeletonCell'; // Import the enhanced SkeletonCell

const SkeletonTableRow = ({ columns }) => {
    return (
        <tr className="border-b border-neutral-200 dark:border-neutral-700 transition-opacity duration-300 ease-in-out">
            {columns.map((colConfig) => (
                // Pass the entire column configuration object to SkeletonCell
                <SkeletonCell key={`skeleton-cell-${colConfig.id}`} columnConfig={colConfig} />
            ))}
        </tr>
    );
};

SkeletonTableRow.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            size: PropTypes.number, // Column width for better skeleton matching
            skeletonType: PropTypes.string, // Optional hint for SkeletonCell
            // Potentially other fields from your column config if needed by SkeletonCell indirectly
        })
    ).isRequired,
};

export default SkeletonTableRow;