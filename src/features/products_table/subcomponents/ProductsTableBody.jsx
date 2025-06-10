import React from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import ProductsTableRow from './ProductsTableRow';
import SkeletonTableRow from './SkeletonTableRow';
import Icon from '../../../components/common/Icon';
import Button from '../../../components/common/Button';

import { scriptLines_ProductsTable as scriptLines } from '../utils/script_lines.js';

const ProductsTableBody = ({
    products,
    columns,
    isLoading,
    error,
    onUpdateProductField,
    updatingStatusProductId,
    colSpan,
    onCellSave,
    onRetry,
    onAddProductClick,
    onClearFiltersClick,
    hasActiveFilters,
    selectedProductIds,
    onToggleRow,
    numSkeletonRows = 3,
}) => {
    if (isLoading) {
        return (
            <tbody>
                {Array.from({ length: numSkeletonRows }).map((_, index) => (
                    <SkeletonTableRow key={`skeleton-row-${index}`} columns={columns} />
                ))}
            </tbody>
        );
    }

    if (error) {
        return (
            <tbody>
                <tr>
                    <td colSpan={colSpan} className="text-center p-10 font-montserrat">
                        <div className="flex flex-col items-center justify-center text-red-500 dark:text-red-400">
                            <Icon name="error" className="w-12 h-12 mb-4" style={{ fontSize: '2.5rem' }} />
                            {/* MODIFICATION: Use centralized script lines */}
                            <h3 className="text-lg font-semibold mb-1">{scriptLines.productsTableBody.error.title}</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 max-w-md">
                                {error?.message || scriptLines.productsTableBody.error.message}
                            </p>
                            {onRetry && (
                                <Button onClick={onRetry} variant="outline" color="secondary">
                                    <Icon name="refresh" className="w-5 h-5 mr-2" style={{ fontSize: '1.25rem' }} />
                                    {scriptLines.productsTableBody.error.retryButton}
                                </Button>
                            )}
                        </div>
                    </td>
                </tr>
            </tbody>
        );
    }

    if (!products || products.length === 0) {
        return (
            <tbody>
                <tr>
                    <td colSpan={colSpan} className="text-center p-10 font-montserrat">
                        <div className="flex flex-col items-center justify-center">
                            <Icon
                                name={hasActiveFilters ? "filter_alt_off" : "inventory_2"}
                                className="w-16 h-16 text-neutral-400 dark:text-neutral-500 mb-4"
                                style={{ fontSize: '2.5rem' }}
                            />
                            {/* MODIFICATION: Use centralized script lines */}
                            <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                                {hasActiveFilters ? scriptLines.productsTableBody.empty.filteredTitle : scriptLines.productsTableBody.empty.noProductsTitle}
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm">
                                {hasActiveFilters ? scriptLines.productsTableBody.empty.filteredMessage : scriptLines.productsTableBody.empty.noProductsMessage}
                            </p>
                            <div className="flex space-x-3">
                                {hasActiveFilters && onClearFiltersClick && (
                                    <Button onClick={onClearFiltersClick} variant="outline" color="secondary">
                                        <Icon name="clear_all" className="w-4 h-4 mr-2" />
                                        {scriptLines.productsTableBody.empty.clearFiltersButton}
                                    </Button>
                                )}
                                {onAddProductClick && (
                                    <Button onClick={onAddProductClick} variant="solid" color="primary">
                                        <Icon name="add_circle" className="w-4 h-4 mr-2" />
                                        {scriptLines.productsTableBody.empty.addProductButton}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <motion.tbody
            className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700"
        >
            <AnimatePresence initial={false}>
                {products.map((product) => (
                    <ProductsTableRow
                        key={product.id}
                        product={product}
                        columns={columns}
                        updatingStatusProductId={updatingStatusProductId}
                        onUpdateProductField={onUpdateProductField}
                        isSelected={selectedProductIds.has(product.id)}
                        onToggleRow={onToggleRow}
                    />
                ))}
            </AnimatePresence>
        </motion.tbody>
    );
};

ProductsTableBody.propTypes = {
    products: PropTypes.array,
    columns: PropTypes.array.isRequired,
    isLoading: PropTypes.bool,
    updatingStatusProductId: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
    error: PropTypes.object,
    onUpdateProductField: PropTypes.func.isRequired,
    colSpan: PropTypes.number.isRequired,
    onCellSave: PropTypes.func,
    onRetry: PropTypes.func,
    onAddProductClick: PropTypes.func,
    onClearFiltersClick: PropTypes.func,
    hasActiveFilters: PropTypes.bool,
    numSkeletonRows: PropTypes.number,
    selectedProductIds: PropTypes.instanceOf(Set).isRequired,
    onToggleRow: PropTypes.func.isRequired,
};

ProductsTableBody.defaultProps = {
    numSkeletonRows: 3,
    hasActiveFilters: false,
};

export default ProductsTableBody;