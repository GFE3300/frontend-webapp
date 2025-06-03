import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon';

// Color Palette (Guideline 2.1)
const NEUTRAL_BG_ITEM = "bg-white dark:bg-neutral-700/80"; // Slightly transparent dark bg for depth
const NEUTRAL_BG_ITEM_PREVIEW = "bg-neutral-100 dark:bg-neutral-700/70"; // Preview mode bg
const NEUTRAL_TEXT_PRIMARY = "text-neutral-800 dark:text-neutral-100";
const NEUTRAL_TEXT_SECONDARY = "text-neutral-600 dark:text-neutral-300";
const NEUTRAL_TEXT_MUTED = "text-neutral-500 dark:text-neutral-400";
const NEUTRAL_BORDER = "border-neutral-200 dark:border-neutral-600"; // Image border

const STEPPER_BUTTON_BG = "bg-neutral-200 dark:bg-neutral-600";
const STEPPER_BUTTON_BG_HOVER = "hover:bg-neutral-300 dark:hover:bg-neutral-500";
const STEPPER_BUTTON_TEXT = "text-neutral-700 dark:text-neutral-200";
const STEPPER_RING_FOCUS = "focus:ring-rose-500 dark:focus:ring-rose-400"; // Using Rose for active interaction focus

// Semantic Colors (Guideline 2.1)
const DISCOUNT_BADGE_BG = "bg-green-100 dark:bg-green-700/30";
const DISCOUNT_BADGE_TEXT = "text-green-700 dark:text-green-300";
const DISCOUNT_PRICE_TEXT = "text-green-600 dark:text-green-400";

// Typography (Guideline 2.2)
const FONT_INTER = "font-inter";
const ITEM_NAME_TEXT_SIZE = "text-sm sm:text-base"; // Body Medium
const ITEM_OPTIONS_TEXT_SIZE = "text-xs sm:text-sm"; // Body Small
const ITEM_PRICE_UNIT_TEXT_SIZE = "text-xs"; // Body Extra Small
const ITEM_TOTAL_PRICE_TEXT_SIZE = "text-sm sm:text-base"; // Body Medium
const STEPPER_TEXT_SIZE = "text-sm sm:text-base"; // Body Medium (for quantity display)

// Borders & Corner Radii (Guideline 2.6)
const ITEM_CARD_RADIUS = "rounded-lg"; // Standard card radius
const IMAGE_RADIUS = "rounded-md"; // Image radius
const STEPPER_BUTTON_RADIUS = "rounded-md"; // Stepper buttons

// Shadows & Elevation (Guideline 2.5)
const ITEM_CARD_SHADOW = "shadow-sm hover:shadow-md"; // Subtle shadow, increases on hover

const FALLBACK_IMAGE_URL_ORDER_ITEM = 'https://via.placeholder.com/64/F3F4F6/9CA3AF?text=Item';

function OrderItem({ item, onUpdateQuantity, isPreviewMode = false, appliedItemDiscountDetails }) {
    if (!item || typeof item.id === 'undefined' || typeof item.price === 'undefined' || typeof item.quantity === 'undefined') {
        console.error('[OrderItem] Invalid item prop:', item);
        return null;
    }

    const handleIncrement = () => {
        onUpdateQuantity(item.id, item.quantity + 1);
    };

    const handleDecrement = () => {
        onUpdateQuantity(item.id, item.quantity - 1);
    };

    const itemBasePricePerUnit = parseFloat(item.price) || 0;

    const originalLineTotal = itemBasePricePerUnit * item.quantity;
    let displayLineTotal = originalLineTotal;
    let showDiscountedPrice = false;
    let discountDescriptionToShow = null;

    if (appliedItemDiscountDetails &&
        typeof appliedItemDiscountDetails.amount === 'number' &&
        appliedItemDiscountDetails.amount > 0) {

        const baseForDiscountDisplay = typeof appliedItemDiscountDetails.originalItemTotal === 'number'
            ? appliedItemDiscountDetails.originalItemTotal
            : originalLineTotal;

        displayLineTotal = baseForDiscountDisplay - appliedItemDiscountDetails.amount;
        if (displayLineTotal < 0) displayLineTotal = 0;

        showDiscountedPrice = true;
        discountDescriptionToShow = appliedItemDiscountDetails.description;
    }

    // Animation variants (Guideline 4.1, 4.3)
    const itemVariants = {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25, duration: 0.3 } },
        exit: { opacity: 0, x: -30, scale: 0.9, transition: { duration: 0.2, ease: "easeIn" } },
    };

    const itemBgClass = isPreviewMode ? NEUTRAL_BG_ITEM_PREVIEW : NEUTRAL_BG_ITEM;

    return (
        <motion.div
            layout // Guideline 4.3 - Component Enter/Exit for lists
            variants={itemVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`flex items-start ${itemBgClass} p-3 ${ITEM_CARD_RADIUS} ${ITEM_CARD_SHADOW} transition-shadow duration-150 my-1.5 ${FONT_INTER}`}
            role="listitem"
            aria-label={`${item.name}, quantity ${item.quantity}, final price ${displayLineTotal.toFixed(2)} dollars ${showDiscountedPrice ? `(discounted from ${originalLineTotal.toFixed(2)} dollars, ${discountDescriptionToShow})` : ''}`}
        >
            {/* Image (Guideline 2.4, 2.6) */}
            <img
                src={item.imageUrl || FALLBACK_IMAGE_URL_ORDER_ITEM}
                alt={item.name || 'Order item image'} // Guideline 7: Alt text
                className={`w-14 h-14 sm:w-16 sm:h-16 ${IMAGE_RADIUS} object-cover mr-3 flex-shrink-0 border ${NEUTRAL_BORDER}`}
                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE_URL_ORDER_ITEM; }}
                loading="lazy"
            />
            <div className="flex-grow min-w-0"> {/* min-w-0 for proper truncation */}
                {/* Item Name (Guideline 2.2 Body Medium) */}
                <h4 className={`font-semibold ${ITEM_NAME_TEXT_SIZE} leading-tight ${NEUTRAL_TEXT_PRIMARY} truncate`} title={item.name}>
                    {item.name || "Unnamed Item"}
                </h4>
                {/* Selected Options (Guideline 2.2 Body Small) */}
                {item.selectedOptionsSummary && (
                    <p className={`${ITEM_OPTIONS_TEXT_SIZE} ${NEUTRAL_TEXT_MUTED} mt-0.5 truncate`} title={item.selectedOptionsSummary}>
                        {item.selectedOptionsSummary}
                    </p>
                )}
                {/* Price Per Unit (Guideline 2.2 Body Extra Small) */}
                <p className={`${ITEM_PRICE_UNIT_TEXT_SIZE} ${NEUTRAL_TEXT_SECONDARY} mt-1`}>
                    ${itemBasePricePerUnit.toFixed(2)} / unit
                </p>

                {/* Discount Badge (Guideline 6.10 Tags & Pills, Semantic Color 2.1) */}
                {showDiscountedPrice && discountDescriptionToShow && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        className="mt-1.5 inline-flex items-center"
                    >
                        <span className={`${DISCOUNT_BADGE_BG} ${DISCOUNT_BADGE_TEXT} text-xs font-medium px-2 py-0.5 rounded-full flex items-center`}>
                            {/* Icon (Guideline 2.3 Small) */}
                            <Icon name="local_offer" className="w-3 h-3 mr-1" />
                            {discountDescriptionToShow}
                        </span>
                    </motion.div>
                )}
            </div>

            {/* Quantity Stepper & Price (Guideline 6.11, 2.2 Typography) */}
            <div className="flex flex-col items-end space-y-1.5 ml-2 flex-shrink-0 w-28 sm:w-32">
                <div className="flex items-center space-x-1 sm:space-x-1.5">
                    {/* Stepper Buttons (Guideline 6.1 Buttons - Icon Button style adjusted, 4.4 States) */}
                    <motion.button
                        onClick={handleDecrement}
                        className={`${STEPPER_BUTTON_BG} ${STEPPER_BUTTON_BG_HOVER} ${STEPPER_BUTTON_TEXT} w-7 h-7 sm:w-8 sm:h-8 ${STEPPER_BUTTON_RADIUS} flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 ${STEPPER_RING_FOCUS}`}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Decrease quantity of ${item.name}`}
                    >
                        {/* Icon (Guideline 2.3 Small) */}
                        <Icon name="remove" className="w-4 h-4" />
                    </motion.button>
                    {/* Quantity Display (Guideline 2.2 Body Medium) */}
                    <span className={`${STEPPER_TEXT_SIZE} font-medium ${NEUTRAL_TEXT_SECONDARY} w-6 sm:w-8 text-center tabular-nums`} aria-live="polite" aria-atomic="true">
                        {item.quantity}
                    </span>
                    <motion.button
                        onClick={handleIncrement}
                        className={`${STEPPER_BUTTON_BG} ${STEPPER_BUTTON_BG_HOVER} ${STEPPER_BUTTON_TEXT} w-7 h-7 sm:w-8 sm:h-8 ${STEPPER_BUTTON_RADIUS} flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 ${STEPPER_RING_FOCUS}`}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Increase quantity of ${item.name}`}
                    >
                        <Icon name="add" className="w-4 h-4" />
                    </motion.button>
                </div>

                {/* Price Display (Guideline 2.2 Typography) */}
                <div className="text-right">
                    {showDiscountedPrice && (
                        // Original Price (Guideline 2.2 Body Small)
                        <del className={`${ITEM_OPTIONS_TEXT_SIZE} ${NEUTRAL_TEXT_MUTED} block`} aria-label={`Original price ${originalLineTotal.toFixed(2)}`}>
                            ${originalLineTotal.toFixed(2)}
                        </del>
                    )}
                    {/* Final Price (Guideline 2.2 Body Medium, Semantic Color for discount) */}
                    <p className={`${ITEM_TOTAL_PRICE_TEXT_SIZE} font-semibold ${showDiscountedPrice ? DISCOUNT_PRICE_TEXT : NEUTRAL_TEXT_PRIMARY}`} aria-label={`Current price ${displayLineTotal.toFixed(2)}`}>
                        ${displayLineTotal.toFixed(2)}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

export default OrderItem;