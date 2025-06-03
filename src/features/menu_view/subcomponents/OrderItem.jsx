// frontend/src/features/menu_view/subcomponents/OrderItem.jsx

import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon'; // Path from frontend.txt structure

const FALLBACK_IMAGE_URL_ORDER_ITEM = 'https://via.placeholder.com/64/F3F4F6/9CA3AF?text=Item'; // Neutral placeholder

/**
 * Displays a single item within the order summary.
 *
 * @param {object} props - The component's props.
 * @param {object} props.item - The order item object.
 *   Expected structure: { id: string, originalId: string, name: string, imageUrl?: string, price: number, quantity: number, selectedOptionsSummary?: string, detailedSelectedOptions?: array }
 * @param {function} props.onUpdateQuantity - Callback: `(itemId: string, newQuantity: number) => void`.
 * @param {boolean} [props.isPreviewMode=false] - If true, might adjust styling or behavior (not currently used for major changes in this refinement).
 * @param {object} [props.appliedItemDiscountDetails] - Optional discount details for this specific item.
 *   Expected structure: { amount: number, description: string, originalItemTotal: number }
 *     - amount: The monetary value of the discount applied to this entire line item.
 *     - description: A short description of the discount (e.g., "10% OFF", "SAVE $2.00").
 *     - originalItemTotal: The total price of this line item *before* this specific discount was applied.
 * @returns {JSX.Element | null} The rendered OrderItem component, or null if item is invalid.
 */
function OrderItem({ item, onUpdateQuantity, isPreviewMode = false, appliedItemDiscountDetails }) {
    if (!item || typeof item.id === 'undefined' || typeof item.price === 'undefined' || typeof item.quantity === 'undefined') {
        console.error('[OrderItem] Invalid item prop:', item);
        return null; // Return null or a placeholder error UI if item data is critically missing
    }

    const handleIncrement = () => {
        onUpdateQuantity(item.id, item.quantity + 1);
    };

    const handleDecrement = () => {
        onUpdateQuantity(item.id, item.quantity - 1); // Parent OrderSummaryPanel will handle quantity <= 0
    };

    const itemBasePricePerUnit = parseFloat(item.price) || 0;
    
    // Calculate totals considering item-specific discount
    const originalLineTotal = itemBasePricePerUnit * item.quantity;
    let displayLineTotal = originalLineTotal;
    let showDiscountedPrice = false;
    let discountDescriptionToShow = null;

    if (appliedItemDiscountDetails && 
        typeof appliedItemDiscountDetails.amount === 'number' && 
        appliedItemDiscountDetails.amount > 0) {
        
        // Use originalItemTotal from discount details if available, otherwise calculate
        const baseForDiscountDisplay = typeof appliedItemDiscountDetails.originalItemTotal === 'number'
            ? appliedItemDiscountDetails.originalItemTotal
            : originalLineTotal;

        displayLineTotal = baseForDiscountDisplay - appliedItemDiscountDetails.amount;
        if (displayLineTotal < 0) displayLineTotal = 0; // Price cannot be negative
        
        showDiscountedPrice = true;
        discountDescriptionToShow = appliedItemDiscountDetails.description;
    }

    const itemVariants = {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
        exit: { opacity: 0, x: -30, scale: 0.9, transition: { duration: 0.2, ease: "easeIn" } },
    };

    const itemBgClass = isPreviewMode
        ? "bg-neutral-100 dark:bg-neutral-700/70" // Slightly more subdued for preview
        : "bg-white dark:bg-neutral-700/80";

    return (
        <motion.div
            layout // Enables smooth reordering if list changes
            variants={itemVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`flex items-start ${itemBgClass} p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150 my-1.5`}
            role="listitem"
            aria-label={`${item.name}, quantity ${item.quantity}, final price ${displayLineTotal.toFixed(2)} dollars ${showDiscountedPrice ? `(discounted from ${originalLineTotal.toFixed(2)} dollars, ${discountDescriptionToShow})` : ''}`}
        >
            <img
                src={item.imageUrl || FALLBACK_IMAGE_URL_ORDER_ITEM}
                alt={item.name || 'Order item image'} // Provide alt text
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-md object-cover mr-3 flex-shrink-0 border border-neutral-200 dark:border-neutral-600"
                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE_URL_ORDER_ITEM; }}
                loading="lazy"
            />
            <div className="flex-grow min-w-0"> {/* min-w-0 for proper truncation */}
                <h4 className="font-semibold text-sm sm:text-base leading-tight text-neutral-800 dark:text-neutral-100 truncate" title={item.name}>
                    {item.name || "Unnamed Item"}
                </h4>
                {item.selectedOptionsSummary && (
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 truncate" title={item.selectedOptionsSummary}>
                        {item.selectedOptionsSummary}
                    </p>
                )}
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                    ${itemBasePricePerUnit.toFixed(2)} / unit
                </p>

                {/* Discount Badge/Label */}
                {showDiscountedPrice && discountDescriptionToShow && (
                    <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        className="mt-1.5 inline-flex items-center" // Changed mt-1 to mt-1.5 for a bit more space
                    >
                        <span className="bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300 text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
                            <Icon name="local_offer" className="w-3 h-3 mr-1" /> {/* Using local_offer icon */}
                            {discountDescriptionToShow}
                        </span>
                    </motion.div>
                )}
            </div>

            <div className="flex flex-col items-end space-y-1.5 ml-2 flex-shrink-0 w-28 sm:w-32">
                {/* Quantity Controls */}
                <div className="flex items-center space-x-1 sm:space-x-1.5 text-sm">
                    <motion.button
                        onClick={handleDecrement}
                        className="bg-neutral-200 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-500 text-neutral-700 dark:text-neutral-200 w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400"
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Decrease quantity of ${item.name}`}
                    >
                        <Icon name="remove" className="w-4 h-4" />
                    </motion.button>
                    <span className="text-sm sm:text-base font-medium text-neutral-700 dark:text-neutral-200 w-6 sm:w-8 text-center tabular-nums" aria-live="polite" aria-atomic="true">
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
                
                {/* Price Display */}
                <div className="text-right">
                    {showDiscountedPrice && (
                        <del className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 block" aria-label={`Original price ${originalLineTotal.toFixed(2)}`}>
                            ${originalLineTotal.toFixed(2)}
                        </del>
                    )}
                    <p className={`text-sm sm:text-base font-semibold ${showDiscountedPrice ? 'text-green-600 dark:text-green-400' : 'text-neutral-800 dark:text-neutral-100'}`} aria-label={`Current price ${displayLineTotal.toFixed(2)}`}>
                        ${displayLineTotal.toFixed(2)}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

export default OrderItem;