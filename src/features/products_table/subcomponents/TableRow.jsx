import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import TableCell from './TableCell';
import ProductInfoCell from './ProductInfoCell';
import CategoryTagsCell from './CategoryTagsCell';
import PriceCostMarginCell from './PriceCostMarginCell';
import StockLevelBar from './StockLevelBar';
import SparklineChart from './SparklineChart';
import ActionsMenu from './ActionsMenu';
import Icon from '../../../components/common/Icon';

const TableRow = memo(({
    product,
    isSelected,
    onSelect,
    visibleColumns,
    onUpdateProduct, // For status toggle & inline edits
    // onReorder (for drag handle - complex, will defer full implementation)
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleStatusToggle = () => {
        onUpdateProduct(product.id, { status: product.status === 'active' ? 'inactive' : 'active' });
    };

    const rowClasses = `
        border-b border-neutral-200 dark:border-neutral-700
        transition-colors duration-150
        ${isSelected ? 'bg-rose-50 dark:bg-rose-900/30' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/20'}
        ${product.status === 'inactive' ? 'opacity-60 bg-neutral-100 dark:bg-neutral-700/50' : ''}
    `;

    // Draggable functionality would require a library like react-beautiful-dnd
    // For now, the drag handle is visual.
    return (
        <motion.tr
            layout // For reordering animation if implemented
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={rowClasses}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            data-testid={`product-row-${product.id}`}
        >
            {/* Fixed Column: Checkbox + Drag Handle */}
            {visibleColumns.selection && (
                <TableCell
                    className="sticky left-0 bg-inherit z-10 w-16 min-w-[4rem] text-center" // Ensure bg matches row for seamless look
                >
                    <div className="flex items-center justify-center space-x-2">
                        <button
                            className="cursor-grab text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 p-1"
                            title="Reorder product (feature coming soon)"
                            aria-label="Reorder product"
                        >
                            <Icon name="drag_indicator" className="w-5 h-5" />
                        </button>
                        <input
                            type="checkbox"
                            className="h-4 w-4 text-rose-600 border-neutral-300 dark:border-neutral-600 rounded focus:ring-rose-500 dark:focus:ring-rose-600 dark:bg-neutral-700 dark:checked:bg-rose-500 dark:checked:border-rose-500"
                            checked={isSelected}
                            onChange={() => onSelect(product.id)}
                            aria-labelledby={`product-name-${product.id}`}
                        />
                    </div>
                </TableCell>
            )}

            {/* Product Info */}
            {visibleColumns.product && (
                <TableCell className="min-w-[250px] max-w-[350px]">
                    <ProductInfoCell product={product} id={`product-name-${product.id}`} />
                </TableCell>
            )}

            {/* Category & Tags */}
            {visibleColumns.categoryTags && (
                <TableCell className="min-w-[200px]">
                    <CategoryTagsCell category={product.category} tags={product.tags} />
                </TableCell>
            )}

            {/* Price/Cost/Margin */}
            {visibleColumns.priceCostMargin && (
                <TableCell className="min-w-[150px]">
                    <PriceCostMarginCell
                        price={product.price}
                        cost={product.cost}
                        onSave={(newPrice, newCost) => onUpdateProduct(product.id, { price: newPrice, cost: newCost })}
                    />
                </TableCell>
            )}

            {/* Stock Level */}
            {visibleColumns.stock && (
                <TableCell className="min-w-[180px]">
                    <StockLevelBar
                        levelPercentage={product.stockLevel}
                        quantity={product.stockQuantity}
                        threshold={product.lowStockThreshold}
                    />
                </TableCell>
            )}

            {/* 7-Day Sales Sparkline */}
            {visibleColumns.salesSparkline && (
                <TableCell className="min-w-[120px]">
                    <SparklineChart data={product.salesLast7Days} />
                </TableCell>
            )}

            {/* Status Toggle */}
            {visibleColumns.status && (
                <TableCell className="min-w-[100px] text-center">
                    <motion.button
                        onClick={handleStatusToggle}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800
                            ${product.status === 'active' ? 'bg-green-500 focus-visible:ring-green-500' : 'bg-neutral-300 dark:bg-neutral-600 focus-visible:ring-neutral-400'}`}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="sr-only">Toggle product status</span>
                        <motion.span
                            layout
                            transition={{ type: "spring", stiffness: 700, damping: 30 }}
                            className={`inline-block w-4 h-4 transform bg-white rounded-full shadow-lg 
                                ${product.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                    </motion.button>
                </TableCell>
            )}

            {/* Actions Menu */}
            {visibleColumns.actions && (
                <TableCell className="text-center min-w-[80px]">
                    <ActionsMenu productId={product.id} onAction={(action) => console.log(action, product.id)} />
                </TableCell>
            )}
        </motion.tr>
    );
});

TableRow.propTypes = {
    product: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
    visibleColumns: PropTypes.object.isRequired,
    onUpdateProduct: PropTypes.func.isRequired,
};

export default TableRow;