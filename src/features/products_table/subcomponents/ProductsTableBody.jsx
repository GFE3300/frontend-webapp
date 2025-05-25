// src/features/products_table/subcomponents/ProductsTableBody.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import ProductsTableRow from './ProductsTableRow';
import SkeletonTableRow from './SkeletonTableRow'; // Import the new skeleton component
import Icon from '../../../components/common/Icon';
import Button from '../../../components/common/Button'; // Assuming a generic Button component

const ProductsTableBody = ({
    products,
    columns,
    isLoading,
    error,
    onUpdateProductField,
    updatingStatusProductId,
    colSpan, // Still useful for full-width messages in error/empty states
    onCellSave,
    onRetry,
    onAddProductClick,
    onClearFiltersClick,
    hasActiveFilters, // Boolean to indicate if filters are applied
    numSkeletonRows = 3, // How many skeleton rows to display
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
                            <Icon name="error" className="w-12 h-12 mb-4" style={{ fontSize: '2.5rem' }}/>
                            <h3 className="text-lg font-semibold mb-1">Oops! Something went wrong.</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 max-w-md">
                                {error?.message || "We couldn't load the products at this moment. Please try again."}
                            </p>
                            {onRetry && (
                                <Button onClick={onRetry} variant="outline" color="secondary">
                                    <Icon name="refresh" className="w-5 h-5 mr-2" style={{ fontSize: '1.25rem' }} />
                                    Try Again
                                </Button>
                            )}
                        </div>
                    </td>
                </tr>
            </tbody>
        );
    }

    if (!products || products.length === 0 ) {
        return (
            <tbody>
                <tr>
                    <td colSpan={colSpan} className="text-center p-10 font-montserrat">
                        <div className="flex flex-col items-center justify-center">
                            <Icon
                                name={hasActiveFilters ? "filter_alt_off" : "inventory_2"} // More contextual icons
                                className="w-16 h-16 text-neutral-400 dark:text-neutral-500 mb-4"
                                style={{ fontSize: '2.5rem' }}
                            />
                            <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                                {hasActiveFilters ? "No Products Match Filters" : "No Products Yet"}
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm">
                                {hasActiveFilters
                                    ? "Try adjusting or clearing your filters to see more products."
                                    : "Get started by adding your first product to the inventory."}
                            </p>
                            <div className="flex space-x-3">
                                {hasActiveFilters && onClearFiltersClick && (
                                    <Button onClick={onClearFiltersClick} variant="outline" color="secondary">
                                        <Icon name="clear_all" className="w-4 h-4 mr-2" />
                                        Clear Filters
                                    </Button>
                                )}
                                {onAddProductClick && (
                                     <Button onClick={onAddProductClick} variant="solid" color="primary">
                                        <Icon name="add_circle" className="w-4 h-4 mr-2" />
                                        Add Product
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
                        onCellSave={onCellSave} // Pass down the save handler for editable cells
                        // Potentially pass down other interaction handlers if row needs them directly
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
    // New props
    onRetry: PropTypes.func,
    onAddProductClick: PropTypes.func,
    onClearFiltersClick: PropTypes.func,
    hasActiveFilters: PropTypes.bool,
    numSkeletonRows: PropTypes.number,
};

ProductsTableBody.defaultProps = {
    numSkeletonRows: 3,
    hasActiveFilters: false,
};

export default ProductsTableBody;