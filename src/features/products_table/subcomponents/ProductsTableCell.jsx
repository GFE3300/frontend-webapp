// frontend/src/features/products_table/subcomponents/ProductsTableCell.jsx
import React from 'react';
import PropTypes from 'prop-types';
import EditableCell from './EditableCell';
import { motion } from 'framer-motion';

const ProductsTableCell = ({ product, column, onUpdateProductField }) => {
    let cellContent;

    if (column.cellType === 'editableCurrency' || column.cellType === 'editableText') {
        const initialValue = column.accessorKey ? product[column.accessorKey] : (column.accessorFn ? column.accessorFn(product) : '');
        cellContent = (
            <EditableCell
                initialValue={initialValue === null || initialValue === undefined ? '' : initialValue} // Pass empty string for null/undefined
                onSave={onUpdateProductField}
                cellType={column.cellType} // Pass 'editableCurrency' or 'editableText'
                productId={product.id}
                fieldKey={column.accessorKey} // Make sure accessorKey matches backend field name
            />
        );
    } else if (column.cell) { // Custom cell renderer from config (like Actions or Status toggle)
        cellContent = column.cell({ row: { original: product }, getValue: () => product[column.accessorKey] || (column.accessorFn && column.accessorFn(product)) });
    } else if (column.accessorFn) {
        cellContent = column.accessorFn(product);
    } else {
        cellContent = product[column.accessorKey];
    }

    // Fallback for undefined content (EditableCell now handles its own N/A for empty strings)
    if (!(column.cellType === 'editableCurrency' || column.cellType === 'editableText') &&
        (cellContent === undefined || cellContent === null || cellContent === '')) {
        cellContent = <span className="italic text-neutral-400">N/A</span>;
    }


    return (
        <motion.td
            layout
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 whitespace-nowrap ${column.sticky ? `sticky ${column.sticky === 'left' ? 'left-0' : 'right-0'} bg-white dark:bg-neutral-800 z-10` : ''} ${column.cellType === 'editableText' || column.cellType === 'editableCurrency' ? 'py-1' : ''}`} // Reduce padding for editable cells
            style={{ width: column.size ? `${column.size}px` : 'auto', minWidth: column.size ? `${column.size}px` : '100px' }}
        >
            {/* For editable cells, ensure they can take full width of td */}
            {(column.cellType === 'editableCurrency' || column.cellType === 'editableText') ? (
                <div className="w-full">{cellContent}</div>
            ) : (
                cellContent
            )}
        </motion.td>
    );
};

ProductsTableCell.propTypes = {
    product: PropTypes.object.isRequired,
    column: PropTypes.object.isRequired,
    onUpdateProductField: PropTypes.func.isRequired,
};

export default ProductsTableCell;