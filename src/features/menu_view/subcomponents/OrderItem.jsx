// frontend/src/features/menu_view/subcomponents/OrderItem.jsx

import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon'; // Path from frontend.txt structure

const FALLBACK_IMAGE_URL_ORDER_ITEM = 'https://via.placeholder.com/64?text=Item';

/**
 * Displays a single item within the order summary.
 *
 * @param {object} props - The component's props.
 * @param {object} props.item - The order item object. Expected structure:
 *  {
 *    id: string, // Unique ID for this specific configuration in the order
 *    originalId: string, // Original product ID from backend (used in payload)
 *    name: string,
 *    imageUrl: string,
 *    price: number, // Final price PER UNIT for this configuration
 *    quantity: number,
 *    selectedOptionsSummary: string | null // e.g., "Size: Large; Extras: Chocolate, Almonds"
 *  }
 * @param {function} props.onUpdateQuantity - Callback: `(itemId, newQuantity) => void`.
 * @param {boolean} [props.isPreviewMode=false] - If true, might adjust styling or behavior.
 * @returns {JSX.Element} The rendered OrderItem component.
 */
function OrderItem({ item, onUpdateQuantity, isPreviewMode = false }) {
    const handleIncrement = () => {
        onUpdateQuantity(item.id, item.quantity + 1);
    };

    const handleDecrement = () => {
        // Parent (OrderSummaryPanel/AdminMenuPreviewPage) will handle removal if quantity becomes <= 0
        onUpdateQuantity(item.id, item.quantity - 1);
    };

    const itemBasePrice = parseFloat(item.price) || 0; // This is already the price with options
    const itemTotalPrice = (itemBasePrice * item.quantity).toFixed(2);

    return (
        <motion.div
            layout // Enables smooth reordering/removal animation when list changes
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            // For Admin Preview, isPreviewMode is true. We can customize exit animation if needed.
            exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            // Styling from frontend.txt version, should work well on OrderSummaryPanel's dark bg
            className="flex items-start bg-white dark:bg-neutral-700/60 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150"
            role="listitem"
            aria-label={`${item.name}, quantity ${item.quantity}, total ${itemTotalPrice}`}
        >
            <img
                src={item.imageUrl || FALLBACK_IMAGE_URL_ORDER_ITEM}
                alt={item.name || 'Order item image'}
                className="w-16 h-16 rounded-md object-cover mr-3 flex-shrink-0 border border-neutral-200 dark:border-neutral-600"
                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE_URL_ORDER_ITEM; }}
            />
            <div className="flex-grow min-w-0"> {/* min-w-0 for proper truncation */}
                <h4 className="font-semibold text-sm leading-tight text-neutral-800 dark:text-neutral-100 truncate" title={item.name}>
                    {item.name || "Unnamed Item"}
                </h4>
                {/* Display selected options summary */}
                {item.selectedOptionsSummary && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate" title={item.selectedOptionsSummary}>
                        {item.selectedOptionsSummary}
                    </p>
                )}
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                    ${itemBasePrice.toFixed(2)} / unit
                </p>
            </div>
            <div className="flex flex-col items-end space-y-1.5 ml-2 flex-shrink-0">
                <div className="flex items-center space-x-1.5 text-sm">
                    <motion.button
                        onClick={handleDecrement}
                        className="bg-neutral-200 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-500 text-neutral-700 dark:text-neutral-200 w-7 h-7 rounded-md flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400"
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Decrease quantity of ${item.name}`}
                    >
                        <Icon name="remove" className="w-4 h-4" />
                    </motion.button>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 w-6 text-center tabular-nums">
                        {item.quantity}
                    </span>
                    <motion.button
                        onClick={handleIncrement}
                        className="bg-neutral-200 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-500 text-neutral-700 dark:text-neutral-200 w-7 h-7 rounded-md flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400"
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Increase quantity of ${item.name}`}
                    >
                        <Icon name="add" className="w-4 h-4" />
                    </motion.button>
                </div>
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                    ${itemTotalPrice}
                </p>
            </div>
        </motion.div>
    );
}

export default OrderItem;