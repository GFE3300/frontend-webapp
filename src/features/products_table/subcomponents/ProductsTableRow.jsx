import React from 'react';
import PropTypes from 'prop-types';
import ProductsTableCell from './ProductsTableCell';
import { motion } from 'framer-motion';

const ProductsTableRow = ({
    product,
    columns,
    onUpdateProductField,
    updatingStatusProductId,
    isSelected,
    onToggleRow,
}) => {
    return (
        <motion.tr
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`border-b border-neutral-200 dark:border-neutral-700 transition-colors ${isSelected ? 'bg-rose-50 dark:bg-rose-500/10' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/50'}`}
        >
            {columns.map((col) => (
                <ProductsTableCell
                    key={`${product.id}-${col.id}`}
                    product={product}
                    column={col}
                    onUpdateProductField={onUpdateProductField}
                    updatingStatusProductId={updatingStatusProductId}
                    isSelected={isSelected}
                    onToggleRow={onToggleRow}
                />
            ))}
        </motion.tr>
    );
};

ProductsTableRow.propTypes = {
    product: PropTypes.object.isRequired,
    columns: PropTypes.array.isRequired,
    onUpdateProductField: PropTypes.func.isRequired,
    updatingStatusProductId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isSelected: PropTypes.bool.isRequired,
    onToggleRow: PropTypes.func.isRequired,
};

export default ProductsTableRow;