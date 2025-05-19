import React, { memo } from 'react';
import PropTypes from 'prop-types';
import TableCell from './TableCell';
// import Icon from '../common/Icon'; // If using sort icons

const TableHeader = memo(({ columns, onSelectAll, isAllSelected, visibleColumns /*, onSort, sortConfig */ }) => {
    // `onSort` and `sortConfig` would be needed for sortable headers

    return (
        <thead className="bg-neutral-50 dark:bg-neutral-700/50 sticky top-0 z-20"> {/* Sticky header */}
            <tr>
                {/* Fixed Selection Column Header */}
                {visibleColumns.selection && (
                    <TableCell isHeader={true} className="sticky left-0 bg-neutral-50 dark:bg-neutral-700/50 z-30 w-16 min-w-[4rem]">
                        <div className="flex items-center justify-center">
                            {/* Drag handle placeholder for header, or align with row drag */}
                            <span className="w-5 h-5 mr-2 opacity-0" aria-hidden="true"> {/* Placeholder for alignment */}
                                {/* <Icon name="drag_indicator" className="w-5 h-5" /> */}
                            </span>
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-rose-600 border-neutral-300 dark:border-neutral-500 rounded focus:ring-rose-500 dark:bg-neutral-600 dark:checked:bg-rose-500"
                                checked={isAllSelected}
                                onChange={(e) => onSelectAll(e.target.checked)}
                                aria-label="Select all products"
                            />
                        </div>
                    </TableCell>
                )}

                {columns.filter(col => visibleColumns[col.key]).map((col) => (
                    <TableCell
                        isHeader={true}
                        key={col.key}
                        className="text-left text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider"
                    >
                        {/* Basic sortable header example - expand this for full functionality */}
                        {/* <button onClick={() => onSort && onSort(col.key)} className="flex items-center group"> */}
                        {col.label}
                        {/* {sortConfig && sortConfig.key === col.key && (
                                <Icon name={sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'} className="w-4 h-4 ml-1" />
                            )}
                            {!sortConfig || sortConfig.key !== col.key && (
                                <Icon name="unfold_more" className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />
                            )} */}
                        {/* </button> */}
                    </TableCell>
                ))}
            </tr>
        </thead>
    );
});

TableHeader.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    })).isRequired,
    onSelectAll: PropTypes.func.isRequired,
    isAllSelected: PropTypes.bool.isRequired,
    visibleColumns: PropTypes.object.isRequired,
    // onSort: PropTypes.func,
    // sortConfig: PropTypes.object,
};

export default TableHeader;