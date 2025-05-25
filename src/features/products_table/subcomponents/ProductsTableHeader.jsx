// frontend/src/features/products_table/subcomponents/ProductsTableHeader.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon';
import { motion } from 'framer-motion';

const ProductsTableHeader = ({
    columns,
    onSort,
    currentSort,
    onColumnResizeStart, // New prop to initiate resizing
}) => {
    return (
        <thead className="bg-neutral-50 dark:bg-neutral-700 sticky top-0 z-10">
            <tr>
                {columns.map((col, index) => { // Added index for checking last column for resizer
                    const isActiveSortColumn = currentSort.id === col.id;
                    const headerText = typeof col.header === 'string' ? col.header : col.id;

                    // Determine the width to apply, prioritizing currentWidth from resizing state
                    const columnStyleWidth = col.currentWidth ? `${col.currentWidth}px` : (col.size ? `${col.size}px` : 'auto');
                    const columnStyleMinWidth = col.minWidth ? `${col.minWidth}px` : (col.size ? `${col.size}px` : '100px');


                    return (
                        <motion.th
                            key={col.id}
                            layout // Keep layout animation
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            scope="col"
                            className={`
                                relative group // Position relative for the resizer handle font-montserrat
                                px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap
                                transition-colors duration-150 ease-in-out
                                ${col.isSortable ? 'cursor-pointer' : 'cursor-default'}
                                ${isActiveSortColumn
                                    ? 'bg-sky-100 dark:bg-sky-700 text-sky-700 dark:text-sky-100'
                                    : `text-neutral-500 dark:text-neutral-300 ${col.isSortable ? 'hover:bg-neutral-100 dark:hover:bg-neutral-600' : ''}`
                                }
                                ${col.sticky
                                    ? `sticky ${col.sticky === 'left' ? 'left-0 border-r border-neutral-200 dark:border-neutral-600' : 'right-0 border-l border-neutral-0 dark:border-neutral-600'} 
                                       ${isActiveSortColumn ? 'bg-sky-100 dark:bg-sky-700' : 'bg-neutral-50 dark:bg-neutral-700'} z-20 shadow-sm`
                                    : ''
                                }
                            `}
                            style={{
                                width: columnStyleWidth,
                                minWidth: columnStyleMinWidth,
                            }}
                            onClick={col.isSortable ? () => onSort(col.id) : undefined}
                            title={col.isSortable ? `Sort by ${headerText}${isActiveSortColumn ? (currentSort.desc ? ' (Descending)' : ' (Ascending)') : ''}` : headerText}
                            aria-sort={col.isSortable ? (isActiveSortColumn ? (currentSort.desc ? 'descending' : 'ascending') : 'none') : undefined}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className="flex-grow truncate pr-1">{col.header}</span> {/* Added truncate and pr-1 */}
                                {col.isSortable && (
                                    <span className="ml-1.5 flex-shrink-0">
                                        <Icon
                                            name={isActiveSortColumn ? (currentSort.desc ? "arrow_downward" : "arrow_upward") : "unfold_more"}
                                            className={`
                                                w-4 h-4 transition-opacity duration-150
                                                ${isActiveSortColumn
                                                    ? 'opacity-100 text-sky-600 dark:text-sky-300'
                                                    : 'opacity-30 group-hover:opacity-100 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-500 dark:group-hover:text-neutral-400'
                                                }
                                            `}
                                        />
                                    </span>
                                )}
                            </div>

                            {/* Resizer Handle: Add if column is resizable (and not the very last visible column typically) */}
                            {col.isResizable !== false && (
                                <div
                                    onMouseDown={(e) => {
                                        e.preventDefault(); // Prevent text selection during drag
                                        e.stopPropagation(); // Prevent sort from triggering
                                        if (onColumnResizeStart) {
                                            onColumnResizeStart(col.id, e.clientX); // Pass columnId and initial mouseX
                                        }
                                    }}
                                    className="absolute top-0 right-[-2px] w-1.5 h-full cursor-col-resize group-hover:bg-sky-300/30 dark:group-hover:bg-sky-600/30 active:bg-sky-400/50 dark:active:bg-sky-500/50 z-30 transition-colors"
                                    title={`Resize ${headerText} column`}
                                />
                            )}
                        </motion.th>
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
        isResizable: PropTypes.bool,    // New: From tableConfig
        size: PropTypes.number,         // Initial/default size from tableConfig
        currentWidth: PropTypes.number, // New: Current width from state
        minWidth: PropTypes.number,     // New: Minimum width from tableConfig
        sticky: PropTypes.oneOf(['left', 'right']),
    })).isRequired,
    onSort: PropTypes.func.isRequired,
    currentSort: PropTypes.shape({
        id: PropTypes.string,
        desc: PropTypes.bool,
    }).isRequired,
    onColumnResizeStart: PropTypes.func, // New: Handler from ProductsTable
};

export default ProductsTableHeader;