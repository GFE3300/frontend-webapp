import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon';
import { motion } from 'framer-motion';

const ProductsTableHeader = ({ columns, onSort, currentSort }) => {
    return (
        <thead className="bg-neutral-50 dark:bg-neutral-700 sticky top-0 z-10">
            <tr>
                {columns.map((col) => (
                    <motion.th
                        key={col.id}
                        layout // Animate layout changes when columns are reordered/hidden
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        scope="col"
                        className={`px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-300 uppercase tracking-wider whitespace-nowrap ${col.sticky ? `sticky ${col.sticky === 'left' ? 'left-0' : 'right-0'} bg-neutral-50 dark:bg-neutral-700 z-20 shadow-sm` : ''}`}
                        style={{ width: col.size ? `${col.size}px` : 'auto', minWidth: col.size ? `${col.size}px`: '100px' }}
                    >
                        <div className="flex items-center">
                            {col.header}
                            {col.isSortable && (
                                <button
                                    onClick={() => onSort(col.id)}
                                    className="ml-1 p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                    title={`Sort by ${col.header}`}
                                >
                                    <Icon
                                        name={currentSort.id === col.id ? (currentSort.desc ? "arrow_downward" : "arrow_upward") : "unfold_more"}
                                        className="w-3.5 h-3.5"
                                    />
                                </button>
                            )}
                        </div>
                    </motion.th>
                ))}
            </tr>
        </thead>
    );
};

ProductsTableHeader.propTypes = {
    columns: PropTypes.array.isRequired,
    onSort: PropTypes.func.isRequired,
    currentSort: PropTypes.object.isRequired,
};

export default ProductsTableHeader;