import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon';

import { scriptLines_ProductsTable as scriptLines } from '../utils/script_lines.js';

const ProductsTableHeader = ({
    columns,
    onSort,
    currentSort,
    pageProductIds,
    selectedProductIds,
    onToggleAllRows,
}) => {
    return (
        <thead className="bg-neutral-50 dark:bg-neutral-700 sticky top-0 z-10 font-montserrat text-xs">
            <tr>
                {columns.map((col) => {
                    const isActiveSortColumn = currentSort.id === col.id;
                    const headerText = typeof col.header === 'string' ? col.header : col.id;

                    // The header can be a function or a string.
                    let headerContent = col.header;
                    if (typeof col.header === 'function') {
                        headerContent = col.header({
                            pageProductIds,
                            selectedProductIds,
                            onToggleAllRows,
                        });
                    }

                    const thStyle = {
                        width: col.currentWidth ? `${col.currentWidth}px` : 'auto',
                        minWidth: col.minWidth ? `${col.minWidth}px` : (col.currentWidth ? `${col.currentWidth}px` : '100px'),
                    };

                    const getTooltip = () => {
                        if (!col.isSortable) {
                            return headerText;
                        }
                        const baseText = scriptLines.productsTableHeader.tooltips.sortBy.replace('{headerText}', headerText);
                        if (isActiveSortColumn) {
                            const direction = currentSort.desc ? scriptLines.productsTableHeader.tooltips.descending : scriptLines.productsTableHeader.tooltips.ascending;
                            return `${baseText} ${direction}`;
                        }
                        return baseText;
                    };

                    return (
                        <th
                            key={col.id}
                            scope="col"
                            className={`relative group px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors duration-150 ease-in-out ${col.isSortable ? 'cursor-pointer' : 'cursor-default'} ${isActiveSortColumn ? 'bg-sky-100 dark:bg-sky-700 text-sky-700 dark:text-sky-100' : `text-neutral-500 dark:text-neutral-300 ${col.isSortable ? 'hover:bg-neutral-100 dark:hover:bg-neutral-600' : ''}`} ${col.sticky ? `sticky ${col.sticky === 'left' ? 'left-0 border-r border-neutral-200 dark:border-neutral-600' : 'right-0 border-l border-neutral-200 dark:border-neutral-600'} ${isActiveSortColumn ? 'bg-sky-100 dark:bg-sky-700' : 'bg-neutral-50 dark:bg-neutral-700'} z-20 shadow-sm` : ''}`}
                            style={thStyle}
                            onClick={col.isSortable ? () => onSort(col.id) : undefined}
                            title={getTooltip()}
                            aria-sort={col.isSortable ? (isActiveSortColumn ? (currentSort.desc ? 'descending' : 'ascending') : 'none') : undefined}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className="flex-grow truncate pr-1">{headerContent}</span>
                                {col.isSortable && (
                                    <span className="ml-1.5 flex-shrink-0">
                                        <Icon
                                            name={isActiveSortColumn ? (currentSort.desc ? "arrow_downward" : "arrow_upward") : "unfold_more"}
                                            className={`w-4 h-4 transition-opacity duration-150 ${isActiveSortColumn ? 'opacity-100 text-sky-600 dark:text-sky-300' : 'opacity-30 group-hover:opacity-100 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-500 dark:group-hover:text-neutral-400'}`}
                                        />
                                    </span>
                                )}
                            </div>
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
};

ProductsTableHeader.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        header: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
        isSortable: PropTypes.bool,
        currentWidth: PropTypes.number,
        minWidth: PropTypes.number,
        sticky: PropTypes.oneOf(['left', 'right']),
    })).isRequired,
    onSort: PropTypes.func.isRequired,
    currentSort: PropTypes.shape({
        id: PropTypes.string,
        desc: PropTypes.bool,
    }).isRequired,
};

export default ProductsTableHeader;