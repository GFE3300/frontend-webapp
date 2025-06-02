import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon'; // Path from frontend.txt structure

const FALLBACK_IMAGE_URL_ORDER_ITEM = 'https://via.placeholder.com/64/F3F4F6/9CA3AF?text=Item'; // Neutral placeholder

/**
 * Displays a single item within the order summary.
 *
 * @param {object} props - The component's props.
 * @param {object} props.item - The order item object. Expected structure:
 *  {
 *    id: string, // Unique ID for this specific configuration in the order
 *    originalId: string, // Original product ID from backend (used for potential re-ordering/lookup)
 *    name: string,
 *    imageUrl?: string,
 *    price: number, // Final price PER UNIT for this configuration (after options)
 *    quantity: number,
 *    selectedOptionsSummary?: string | null // e.g., "Size: Large; Extras: Chocolate, Almonds"
 *  }
 * @param {function} props.onUpdateQuantity - Callback: `(itemId: string, newQuantity: number) => void`.
 * @param {boolean} [props.isPreviewMode=false] - If true, might adjust styling or behavior (e.g., for admin previews).
 * @returns {JSX.Element} The rendered OrderItem component.
 */
function OrderItem({ item, onUpdateQuantity, isPreviewMode = false }) {
    if (!item || typeof item.id === 'undefined') {
        console.error('[OrderItem] Invalid item prop:', item);
        return null; // Don't render if item is invalid
    }

    const handleIncrement = () => {
        onUpdateQuantity(item.id, item.quantity + 1);
    };

    const handleDecrement = () => {
        // The parent component (OrderSummaryPanel or Userpage directly)
        // will handle the logic for removing the item if quantity becomes 0 or less.
        onUpdateQuantity(item.id, item.quantity - 1);
    };

    const itemBasePricePerUnit = parseFloat(item.price) || 0; // Price per unit with selected options
    const itemTotalPrice = (itemBasePricePerUnit * item.quantity).toFixed(2);

    const itemVariants = {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
        exit: { opacity: 0, x: -30, scale: 0.9, transition: { duration: 0.2, ease: "easeIn" } },
    };

    // Determine background based on preview mode for better visual distinction if needed
    const itemBgClass = isPreviewMode
        ? "bg-neutral-100 dark:bg-neutral-700" // Lighter background for admin preview items
        : "bg-white dark:bg-neutral-700/80";   // Standard background for customer order items

    return (
        <motion.div
            layout // Enables smooth reordering/removal animation when list changes
            variants={itemVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`flex items-start ${itemBgClass} p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150 my-1.5`} // Added my-1.5 for spacing
            role="listitem"
            aria-label={`${item.name}, quantity ${item.quantity}, total ${itemTotalPrice}`}
        >
            <img
                src={item.imageUrl || FALLBACK_IMAGE_URL_ORDER_ITEM}
                alt={item.name || 'Order item image'}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-md object-cover mr-3 flex-shrink-0 border border-neutral-200 dark:border-neutral-600"
                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE_URL_ORDER_ITEM; }}
                loading="lazy"
            />
            <div className="flex-grow min-w-0"> {/* min-w-0 for proper truncation */}
                <h4 className="font-semibold text-sm sm:text-base leading-tight text-neutral-800 dark:text-neutral-100 truncate" title={item.name}>
                    {item.name || "Unnamed Item"}
                </h4>
                {/* Display selected options summary */}
                {item.selectedOptionsSummary && (
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 truncate" title={item.selectedOptionsSummary}>
                        {item.selectedOptionsSummary}
                    </p>
                )}
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                    ${itemBasePricePerUnit.toFixed(2)} / unit
                </p>
            </div>

            {/* Quantity Controls and Total Price */}
            <div className="flex flex-col items-end space-y-1.5 ml-2 flex-shrink-0 w-28 sm:w-32"> {/* Fixed width for alignment */}
                <div className="flex items-center space-x-1 sm:space-x-1.5 text-sm">
                    <motion.button
                        onClick={handleDecrement}
                        className="bg-neutral-200 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-500 text-neutral-700 dark:text-neutral-200 w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400"
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Decrease quantity of ${item.name}`}
                    >
                        <Icon name="remove" className="w-4 h-4" />
                    </motion.button>
                    <span className="text-sm sm:text-base font-medium text-neutral-700 dark:text-neutral-200 w-6 sm:w-8 text-center tabular-nums">
                        {item.quantity}
                    </span>
                    <motion.button
                        onClick={handleIncrement}
                        className="bg-neutral-200 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-500 text-neutral-700 dark:text-neutral-200 w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400"
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Increase quantity of ${item.name}`}
                    >
                        <Icon name="add" className="w-4 h-4" />
                    </motion.button>
                </div>
                <p className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-100">
                    ${itemTotalPrice}
                </p>
            </div>
        </motion.div>
    );
}

export default OrderItem;