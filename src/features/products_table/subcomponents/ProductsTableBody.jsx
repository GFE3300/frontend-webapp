import React from 'react';
import PropTypes from 'prop-types';
import ProductsTableRow from './ProductsTableRow';
import Icon from '../../../components/common/Icon';
import { AnimatePresence } from 'framer-motion';


const ProductsTableBody = ({ products, columns, isLoading, error, onUpdateProductField, colSpan }) => {
    if (isLoading) {
        return (
            <tbody>
                <tr>
                    <td colSpan={colSpan} className="text-center p-10">
                        <div className="flex flex-col items-center justify-center">
                            <Icon name="hourglass_empty" className="w-10 h-10 text-rose-500 animate-spin mb-3" />
                            <p className="text-neutral-600 dark:text-neutral-400">Loading products...</p>
                        </div>
                    </td>
                </tr>
            </tbody>
        );
    }

    if (error) {
        return (
            <tbody>
                <tr>
                    <td colSpan={colSpan} className="text-center p-10 text-red-500 dark:text-red-400">
                        <div className="flex flex-col items-center justify-center">
                            <Icon name="error" className="w-10 h-10 mb-3" />
                            <p>Error loading products: {error.message}</p>
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
                    <td colSpan={colSpan} className="text-center p-10">
                        <div className="flex flex-col items-center justify-center">
                            <Icon name="search_off" className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mb-3" />
                            <p className="text-neutral-600 dark:text-neutral-400">No products found.</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-500">Try adjusting your filters or search term.</p>
                        </div>
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
            <AnimatePresence>
                {products.map((product) => (
                    <ProductsTableRow
                        key={product.id}
                        product={product}
                        columns={columns}
                        onUpdateProductField={onUpdateProductField}
                    />
                ))}
            </AnimatePresence>
        </tbody>
    );
};

ProductsTableBody.propTypes = {
    products: PropTypes.array,
    columns: PropTypes.array.isRequired,
    isLoading: PropTypes.bool,
    error: PropTypes.object,
    onUpdateProductField: PropTypes.func.isRequired,
    colSpan: PropTypes.number.isRequired,
};

export default ProductsTableBody;