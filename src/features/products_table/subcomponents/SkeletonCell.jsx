// src/features/products_table/subcomponents/SkeletonCell.jsx
import React from 'react';
import PropTypes from 'prop-types';

const SkeletonCell = ({ columnConfig }) => {
    const { id, size, skeletonType } = columnConfig; // Extract skeletonType if provided

    let cellContent;
    const baseClasses = "bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse";

    // Determine skeleton shape based on column ID or a specific skeletonType
    // This can be expanded with more specific types
    switch (skeletonType || id) {
        case 'image': // Corresponds to COLUMN_KEYS.IMAGE
            cellContent = (
                <div className={`${baseClasses} w-10 h-10 rounded-md`}></div>
            );
            break;
        case 'actions': // Corresponds to COLUMN_KEYS.ACTIONS
            cellContent = (
                <div className="flex space-x-2 items-center">
                    <div className={`${baseClasses} w-6 h-6 rounded-full`}></div>
                    <div className={`${baseClasses} w-6 h-6 rounded-full`}></div>
                </div>
            );
            break;
        case 'status': // Corresponds to COLUMN_KEYS.STATUS (for a toggle)
            cellContent = (
                <div className={`${baseClasses} w-10 h-5 rounded-full`}></div>
            );
            break;
        case 'price':
        case 'cost':
        case 'sku':
            // Shorter placeholder for potentially shorter content
            cellContent = (
                <div className={`${baseClasses} h-4 w-3/4`}></div>
            );
            break;
        case 'name':
            // Potentially two lines for name + subtitle
            cellContent = (
                <div className="space-y-1.5">
                    <div className={`${baseClasses} h-4 w-full`}></div>
                    <div className={`${baseClasses} h-3 w-5/6`}></div>
                </div>
            );
            break;
        case 'tags':
            cellContent = (
                <div className="flex space-x-1">
                    <div className={`${baseClasses} h-4 w-10 rounded-sm`}></div>
                    <div className={`${baseClasses} h-4 w-12 rounded-sm`}></div>
                </div>
            );
            break;
        default: // Generic text placeholder
            cellContent = (
                <div className={`${baseClasses} h-4 w-11/12`}></div>
            );
            break;
    }

    return (
        <td
            className="px-4 py-3 whitespace-nowrap align-middle" // Ensure vertical alignment
            style={{
                width: size ? `${size}px` : 'auto',
                minWidth: size ? `${size}px` : '100px'
            }}
        >
            {cellContent}
        </td>
    );
};

SkeletonCell.propTypes = {
    columnConfig: PropTypes.shape({
        id: PropTypes.string.isRequired,
        size: PropTypes.number,
        skeletonType: PropTypes.string, // Optional: 'image', 'actions', 'status', 'name', etc.
    }).isRequired,
};

export default SkeletonCell;