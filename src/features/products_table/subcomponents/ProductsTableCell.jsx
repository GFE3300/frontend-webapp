import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import EditableCell from './EditableCell';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon';

const ProductsTableCell = ({ product, column, onUpdateProductField, updatingStatusProductId }) => {
    const {
        id: columnId,
        accessorKey,
        accessorFn,
        cell: customCellRenderer,
        cellType,
        currentWidth,
        minWidth, 
        sticky,
        align = 'left',
    } = column;

    const isEditable = cellType === 'editableCurrency' || cellType === 'editableText';

    const rawValue = useMemo(() => {
        if (accessorKey) return product[accessorKey];
        if (accessorFn) return accessorFn(product);
        return undefined;
    }, [product, accessorKey, accessorFn]);

    let cellContent;
    if (isEditable) {
        cellContent = (
            <EditableCell
                initialValue={rawValue === null || rawValue === undefined ? '' : rawValue}
                onSave={onUpdateProductField} 
                cellType={cellType}
                productId={product.id}
                fieldKey={accessorKey || columnId}
            />
        );
    } else if (customCellRenderer) {
        cellContent = customCellRenderer({
            row: { original: product },
            getValue: () => rawValue,
            column,
            updatingStatusProductId: updatingStatusProductId,
        });
    } else {
        if (rawValue === undefined || rawValue === null || String(rawValue).trim() === '') {
            cellContent = <span className="italic text-neutral-400 dark:text-neutral-500">—</span>;
        } else if (cellType === 'currency') {
            const num = parseFloat(rawValue);
            cellContent = isNaN(num)
                ? <span className="italic text-red-500 dark:text-red-400">Invalid</span>
                : `$${num.toFixed(2)}`;
        } else {
            cellContent = String(rawValue);
        }
    }


    const alignmentClass = useMemo(() => {
        let effectiveAlign = align;
        if (align === 'left' && (cellType === 'currency' || cellType === 'editableCurrency' || typeof rawValue === 'number')) {
            effectiveAlign = 'right';
        }
        switch (effectiveAlign) {
            case 'center': return 'text-center justify-center';
            case 'right': return 'text-right justify-end';
            default: return 'text-left justify-start';
        }
    }, [align, cellType, rawValue]);

    const cellPaddingClass = isEditable ? 'py-0.5 px-1' : 'px-4 py-3';

    const NonEditableWrapper = ({ children }) => {
        const stringContent = typeof children === 'string' || typeof children === 'number' ? String(children) : '';
        return (
            <div
                className={`w-full flex items-center ${alignmentClass} ${isEditable ? '' : 'truncate'}`}
                title={stringContent.length > 20 || typeof children !== 'string' ? stringContent : undefined}
            >
                {children}
            </div>
        );
    };

    const tdStyle = {
        width: currentWidth ? `${currentWidth}px` : 'auto',
        minWidth: minWidth ? `${minWidth}px` : (isEditable ? '120px' : '100px'),
    };

    return (
        <motion.td
            className={`text-sm text-neutral-700 dark:text-neutral-300 whitespace-nowrap
                        ${cellPaddingClass}
                        ${sticky
                    ? `sticky ${sticky === 'left' ? 'left-0 border-r' : 'right-0 border-l'} 
                               bg-white dark:bg-neutral-800 z-[1] border-neutral-200 dark:border-neutral-700`
                    : ''
                }
                      `}
            style={tdStyle}
            role="gridcell"
        >
            {isEditable ? (
                <div className={`w-full flex ${alignmentClass}`}>
                    {cellContent}
                </div>
            ) : (
                <NonEditableWrapper>{cellContent}</NonEditableWrapper>
            )}
        </motion.td>
    );
};

ProductsTableCell.propTypes = {
    product: PropTypes.object.isRequired,
    column: PropTypes.shape({
        id: PropTypes.string.isRequired,
        accessorKey: PropTypes.string,
        accessorFn: PropTypes.func,
        cell: PropTypes.func,
        cellType: PropTypes.string,
        currentWidth: PropTypes.number,
        minWidth: PropTypes.number,
        sticky: PropTypes.oneOf(['left', 'right']),
        align: PropTypes.oneOf(['left', 'center', 'right']),
        header: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
        size: PropTypes.number,
    }).isRequired,
    onUpdateProductField: PropTypes.func.isRequired,
    updatingStatusProductId: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
};

export default ProductsTableCell;