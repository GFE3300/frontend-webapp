import React, { memo } from 'react';
import PropTypes from 'prop-types';
import TableRow from './TableRow';
import { AnimatePresence, motion } from 'framer-motion';

const TableBody = memo(({ products, selectedProductIds, onSelectProduct, visibleColumns, onUpdateProduct }) => {
    if (products.length === 0) {
        return (
            <tbody>
                <tr>
                    <td colSpan={Object.keys(visibleColumns).filter(k => visibleColumns[k]).length || 1} className="text-center py-10 text-neutral-500 dark:text-neutral-400">
                        No products found. Try adjusting your search or filters.
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
            <AnimatePresence initial={false}>
                {products.map((product) => (
                    <TableRow
                        key={product.id}
                        product={product}
                        isSelected={selectedProductIds.has(product.id)}
                        onSelect={onSelectProduct}
                        visibleColumns={visibleColumns}
                        onUpdateProduct={onUpdateProduct}
                    />
                ))}
            </AnimatePresence>
        </tbody>
    );
});

TableBody.propTypes = {
    products: PropTypes.array.isRequired,
    selectedProductIds: PropTypes.instanceOf(Set).isRequired,
    onSelectProduct: PropTypes.func.isRequired,
    visibleColumns: PropTypes.object.isRequired,
    onUpdateProduct: PropTypes.func.isRequired,
};

export default TableBody;