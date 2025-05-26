import React from 'react';
import PropTypes from 'prop-types';
import ProductsTableCell from './ProductsTableCell';
import { motion } from 'framer-motion';

const ProductsTableRow = ({ product, columns, onUpdateProductField, onCellSave, updatingStatusProductId }) => {
    return (
        <motion.tr
            layout // Animate if row order changes
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
        >
            {columns.map((col) => (
                <ProductsTableCell
                    key={`${product.id}-${col.id}`}
                    product={product}
                    column={col}
                    onSave={onCellSave}
                    onUpdateProductField={onUpdateProductField}
                    updatingStatusProductId={updatingStatusProductId}
                />
            ))}
        </motion.tr>
    );
};

ProductsTableRow.propTypes = {
    product: PropTypes.object.isRequired,
    columns: PropTypes.array.isRequired,
    onUpdateProductField: PropTypes.func.isRequired,
    updatingStatusProductId: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
};

export default ProductsTableRow;