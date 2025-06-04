import React, { useState, useEffect } from 'react';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import Icon from '../../../components/common/Icon'; // Assuming this is your Icon component

// --- THEMING CONSTANTS ---
// These constants define the visual appearance of the OrderItem component.
// They are organized by their purpose (colors, typography, sizing, etc.)
// to make them easy to understand and modify.

// --- Color Palette ---
// Neutral shades are used for backgrounds, text, and borders.
// These support both light and dark modes.
const NEUTRAL_BG_ITEM = "bg-neutral-100 dark:bg-neutral-800"; // Solid dark bg for more contrast
const NEUTRAL_BG_ITEM_PREVIEW = "bg-neutral-100 dark:bg-neutral-700/70"; // Preview mode background
const NEUTRAL_TEXT_PRIMARY = "text-neutral-800 dark:text-neutral-100"; // Primary text color
const NEUTRAL_TEXT_SECONDARY = "text-neutral-600 dark:text-neutral-300"; // Secondary text color
const NEUTRAL_TEXT_MUTED = "text-neutral-500 dark:text-neutral-400"; // Muted text (e.g., for less important details)
const NEUTRAL_BORDER = "border-neutral-200 dark:border-neutral-600/50"; // Border color

// Accent colors are used for elements that need to stand out, like discount badges.
const DISCOUNT_BADGE_BG = "bg-green-100 dark:bg-green-700/30";
const DISCOUNT_BADGE_TEXT = "text-green-700 dark:text-green-300";
const DISCOUNT_PRICE_TEXT = "text-green-600 dark:text-green-400";

// --- Typography ---
const FONT_INTER = "font-inter"; // Primary font family

// Text sizes for various elements, with responsive adjustments.
const ITEM_NAME_TEXT_SIZE = "text-sm sm:text-base";
const ITEM_OPTIONS_TEXT_SIZE = "text-xs sm:text-sm";
const ITEM_PRICE_UNIT_TEXT_SIZE = "text-xs";
const ITEM_TOTAL_PRICE_TEXT_SIZE = "text-sm sm:text-base";
const STEPPER_TEXT_SIZE = "text-sm sm:text-base";
const DISCOUNT_BADGE_TEXT_SIZE = "text-xs"; // Maintained size, improved padding

// --- Sizing, Spacing, and Layout ---
const CARD_PADDING = "p-4"; // Increased padding for a more spacious card
const CARD_MARGIN_Y = "my-2.5"; // Increased vertical margin between items
const IMAGE_ICON_CONTAINER_SIZE = "w-16 h-16 sm:w-20 sm:h-20"; // Larger image/icon container
const IMAGE_ICON_MARGIN_RIGHT = "mr-4"; // Spacing between image/icon and item details

// --- Borders, Radii & Shadows ---
const ITEM_CARD_RADIUS = "rounded-xl"; // Slightly larger radius for a softer, modern look
const IMAGE_ICON_RADIUS = "rounded-full"; // For circular images/icon backgrounds
const STEPPER_BUTTON_RADIUS = "rounded-full";

// Enhanced shadow for a more "lifted" feel, with smoother transition.
const ITEM_CARD_SHADOW_BASE = "shadow-lg"; // Base shadow more pronounced
const ITEM_CARD_SHADOW_HOVER = "hover:shadow-xl";
const ITEM_CARD_HOVER_EFFECT = "hover:scale-[1.015]"; // Subtle scale on hover
const ITEM_CARD_TRANSITION = "transition-all duration-300 ease-in-out"; // For shadow and scale

// --- Image Fallback Icon ---
// Used when the item image is unavailable or fails to load.
const FALLBACK_ICON_BG = "bg-neutral-100 dark:bg-neutral-700"; // Background for the icon placeholder
const FALLBACK_ICON_COLOR = "text-neutral-400 dark:text-neutral-500"; // Color of the fallback icon
const FALLBACK_ICON_NAME = "inventory_2"; // Material Icon name (e.g., inventory_2, category, image)
const FALLBACK_ICON_SIZE_CLASS = "w-6 h-6 sm:w-10 sm:h-10"; // Tailwind size class for the fallback Icon component

// --- Stepper Buttons ---
// Styles for the quantity adjustment buttons.
const STEPPER_BUTTON_BG = "bg-neutral-200 dark:bg-neutral-600";
const STEPPER_BUTTON_BG_HOVER = "hover:bg-neutral-300 dark:hover:bg-neutral-500";
const STEPPER_BUTTON_TEXT = "text-neutral-700 dark:text-neutral-200";
const STEPPER_RING_FOCUS = "focus:ring-rose-500 dark:focus:ring-rose-400"; // Focus ring style
const STEPPER_BUTTON_SIZE = "w-7 h-7 sm:w-8 sm:h-8"; // Size of the stepper buttons
const STEPPER_BUTTON_ICON_SIZE = "w-4 h-4"; // Size of icons within stepper buttons
const STEPPER_BUTTON_TRANSITION = "transition-all duration-150 ease-in-out"; // For button hover effects

// --- Discount Badge ---
const DISCOUNT_BADGE_PADDING = "px-2.5 py-1"; // More breathable padding
const DISCOUNT_BADGE_FONT_WEIGHT = "font-semibold";
const DISCOUNT_BADGE_ICON_SIZE = "w-3.5 h-3.5"; // Adjusted size for discount icon

/**
 * @typedef {object} OrderItemType
 * @property {string|number} id - Unique identifier for the item.
 * @property {string} [name="Unnamed Item"] - Name of the item.
 * @property {string|number} price - Base price per unit of the item.
 * @property {number} quantity - Current quantity of the item in the order.
 * @property {string} [imageUrl] - URL for the item's image.
 * @property {string} [selectedOptionsSummary] - A summary string of selected options (e.g., "Size: M, Color: Red").
 */

/**
 * @typedef {object} AppliedDiscountDetailsType
 * @property {number} amount - The monetary amount of the discount applied to this item.
 * @property {string} description - A description of the discount (e.g., "10% Off").
 * @property {number} [originalItemTotal] - The original total price of the item line before this specific discount, if different from quantity * unit price (e.g., due to other prior adjustments).
 */

/**
 * OrderItem component displays a single item in an order list.
 * It allows users to see item details, adjust quantity, and view applied discounts.
 *
 * @component
 * @param {object} props - The props for the OrderItem component.
 * @param {OrderItemType} props.item - The order item data.
 * @param {(itemId: string|number, newQuantity: number) => void} props.onUpdateQuantity - Callback function to update the item's quantity.
 * @param {boolean} [props.isPreviewMode=false] - If true, applies styling for a preview context (e.g., in a cart summary).
 * @param {AppliedDiscountDetailsType} [props.appliedItemDiscountDetails] - Details of any discount applied specifically to this item.
 */
function OrderItem({
    item,
    onUpdateQuantity,
    isPreviewMode = false,
    appliedItemDiscountDetails
}) {
    // --- State ---
    // Manages the loading state of the item image.
    const [imageLoadError, setImageLoadError] = useState(false);

    // --- Effects ---
    // Reset image error state if the item's imageUrl changes.
    // This is useful if the item data is updated externally.
    useEffect(() => {
        setImageLoadError(false);
    }, [item.imageUrl]);

    // --- Event Handlers ---
    /** Handles incrementing the item quantity. */
    const handleIncrement = () => {
        onUpdateQuantity(item.id, item.quantity + 1);
    };

    /** Handles decrementing the item quantity. */
    const handleDecrement = () => {
        if (item.quantity > 0) { // Prevent quantity from going below 0 (or 1, depending on business logic)
            onUpdateQuantity(item.id, item.quantity - 1);
        }
    };

    // --- Calculated Values ---
    // Calculate prices and discount information.
    const itemBasePricePerUnit = parseFloat(String(item.price)) || 0;
    const originalLineTotal = itemBasePricePerUnit * item.quantity;

    let displayLineTotal = originalLineTotal;
    let showDiscountedPrice = false;
    let discountDescriptionToShow = null;

    if (
        appliedItemDiscountDetails &&
        typeof appliedItemDiscountDetails.amount === 'number' &&
        appliedItemDiscountDetails.amount > 0
    ) {
        // Use originalItemTotal from discount details if provided, otherwise use calculated originalLineTotal.
        const baseForDiscountDisplay = typeof appliedItemDiscountDetails.originalItemTotal === 'number'
            ? appliedItemDiscountDetails.originalItemTotal
            : originalLineTotal;

        displayLineTotal = baseForDiscountDisplay - appliedItemDiscountDetails.amount;
        if (displayLineTotal < 0) displayLineTotal = 0; // Price cannot be negative.

        showDiscountedPrice = true;
        discountDescriptionToShow = appliedItemDiscountDetails.description;
    }

    // --- Animation Variants ---
    // Defines animations for item appearance and disappearance using Framer Motion.
    const itemVariants = {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25, duration: 0.3 } },
        exit: { opacity: 0, x: -30, scale: 0.9, transition: { duration: 0.2, ease: "easeIn" } },
    };

    // Determine background class based on preview mode.
    const itemBgClass = isPreviewMode ? NEUTRAL_BG_ITEM_PREVIEW : NEUTRAL_BG_ITEM;
    const itemName = item.name || "Unnamed Item"; // Fallback for item name

    // --- ARIA Label ---
    // Construct a detailed ARIA label for the entire list item for screen readers.
    const ariaLabel = `
        ${itemName}, quantity ${item.quantity},
        final price ${displayLineTotal.toFixed(2)} dollars
        ${showDiscountedPrice ? `(discounted from ${originalLineTotal.toFixed(2)} dollars, ${discountDescriptionToShow || 'special discount'})` : ''}
    `.trim().replace(/\s+/g, ' ');


    // --- Props Validation ---
    // Ensure essential item properties are present.
    if (!item || typeof item.id === 'undefined' || typeof item.price === 'undefined' || typeof item.quantity === 'undefined') {
        console.error('[OrderItem] Invalid item prop: Essential fields (id, price, quantity) are missing.', item);
        return null; // Render nothing if item data is critically flawed.
    }

    // --- JSX Rendering ---
    return (
        <motion.div
            layout // Animates layout changes (e.g., when items are added/removed/reordered)
            variants={itemVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`
                flex items-start ${itemBgClass} ${CARD_PADDING} ${ITEM_CARD_RADIUS}
                ${ITEM_CARD_SHADOW_BASE} ${ITEM_CARD_SHADOW_HOVER} ${ITEM_CARD_HOVER_EFFECT}
                ${ITEM_CARD_TRANSITION}
                ${CARD_MARGIN_Y} ${FONT_INTER}
            `}
            role="listitem"
            aria-label={ariaLabel}
        >
            {/* Section: Item Image or Fallback Icon */}
            <div
                className={`
                    ${IMAGE_ICON_CONTAINER_SIZE} ${IMAGE_ICON_RADIUS} ${IMAGE_ICON_MARGIN_RIGHT}
                    flex-shrink-0 border ${NEUTRAL_BORDER}
                    flex items-center justify-center overflow-hidden
                    ${(!item.imageUrl || imageLoadError) ? FALLBACK_ICON_BG : ''}
                `}
            >
                {item.imageUrl && !imageLoadError ? (
                    <img
                        src={item.imageUrl}
                        alt={itemName} // Use processed itemName for alt text
                        className="w-full h-full object-cover"
                        onError={() => setImageLoadError(true)}
                        loading="lazy"
                    />
                ) : (
                    <Icon
                        name={FALLBACK_ICON_NAME}
                        className={`${FALLBACK_ICON_SIZE_CLASS} ${FALLBACK_ICON_COLOR}`}
                        // If your Icon component primarily uses fontSize for sizing, you might add:
                        // style={{ fontSize: '2rem' }} // Adjust size as needed
                        aria-hidden="true" // Decorative, as item name is present
                    />
                )}
            </div>

            {/* Section: Item Details (Name, Options, Unit Price, Discount Badge) */}
            <div className="flex-grow min-w-0"> {/* min-w-0 is crucial for text truncation in flex items */}
                <h4
                    className={`font-semibold ${ITEM_NAME_TEXT_SIZE} leading-tight ${NEUTRAL_TEXT_PRIMARY} truncate`}
                    title={itemName}
                >
                    {itemName}
                </h4>

                {item.selectedOptionsSummary && (
                    <p
                        className={`${ITEM_OPTIONS_TEXT_SIZE} ${NEUTRAL_TEXT_MUTED} mt-0.5 truncate`}
                        title={item.selectedOptionsSummary}
                    >
                        {item.selectedOptionsSummary}
                    </p>
                )}

                <p className={`${ITEM_PRICE_UNIT_TEXT_SIZE} ${NEUTRAL_TEXT_SECONDARY} mt-1 sm:mt-1.5`}>
                    ${itemBasePricePerUnit.toFixed(2)} / unit
                </p>

                {showDiscountedPrice && discountDescriptionToShow && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        className="mt-1.5 inline-flex items-center" // inline-flex to wrap content tightly
                    >
                        <span
                            className={`
                                ${DISCOUNT_BADGE_BG} ${DISCOUNT_BADGE_TEXT} ${DISCOUNT_BADGE_TEXT_SIZE}
                                ${DISCOUNT_BADGE_FONT_WEIGHT} ${DISCOUNT_BADGE_PADDING}
                                rounded-full flex items-center
                            `}
                        >
                            <Icon
                                name="local_offer" // Google Icon for discount
                                className={`${DISCOUNT_BADGE_ICON_SIZE} mr-1.5`}
                                style={{ fontSize: '0.875rem' }}
                                aria-hidden="true"
                            />
                            {discountDescriptionToShow}
                        </span>
                    </motion.div>
                )}
            </div>

            {/* Section: Quantity Stepper and Total Price */}
            <div className="flex flex-col items-end space-y-2 ml-3 flex-shrink-0 w-28 sm:w-32">
                {/* Subsection: Quantity Stepper */}
                <div className="flex items-center space-x-1 sm:space-x-1.5">
                    <motion.button
                        onClick={handleDecrement}
                        disabled={item.quantity <= 0 && !isPreviewMode} // Disable if quantity is 0 (or 1 if that's min) unless in preview
                        className={`
                            ${STEPPER_BUTTON_BG} ${STEPPER_BUTTON_TEXT}
                            ${STEPPER_BUTTON_SIZE} ${STEPPER_BUTTON_RADIUS}
                            flex items-center justify-center
                            ${STEPPER_BUTTON_TRANSITION} ${STEPPER_BUTTON_BG_HOVER}
                            focus:outline-none focus-visible:ring-2 ${STEPPER_RING_FOCUS}
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Decrease quantity of ${itemName}`}
                    >
                        <Icon name="remove" className={STEPPER_BUTTON_ICON_SIZE} style={{ fontSize: '1rem' }} />
                    </motion.button>

                    <span
                        className={`${STEPPER_TEXT_SIZE} font-medium ${NEUTRAL_TEXT_SECONDARY} w-6 sm:w-7 text-center tabular-nums`}
                        aria-live="polite" // Announces changes to screen readers
                        aria-atomic="true"
                    >
                        {item.quantity}
                    </span>

                    <motion.button
                        onClick={handleIncrement}
                        disabled={isPreviewMode} // Optionally disable in preview mode
                        className={`
                            ${STEPPER_BUTTON_BG} ${STEPPER_BUTTON_TEXT}
                            ${STEPPER_BUTTON_SIZE} ${STEPPER_BUTTON_RADIUS}
                            flex items-center justify-center
                            ${STEPPER_BUTTON_TRANSITION} ${STEPPER_BUTTON_BG_HOVER}
                            focus:outline-none focus-visible:ring-2 ${STEPPER_RING_FOCUS}
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Increase quantity of ${itemName}`}
                    >
                        <Icon name="add" className={STEPPER_BUTTON_ICON_SIZE}  style={{ fontSize: '1rem' }}  />
                    </motion.button>
                </div>

                {/* Subsection: Price Display */}
                <div className="text-right">
                    {showDiscountedPrice && (
                        <del
                            className={`${ITEM_OPTIONS_TEXT_SIZE} ${NEUTRAL_TEXT_MUTED} block`}
                            aria-label={`Original price ${originalLineTotal.toFixed(2)}`}
                        >
                            ${originalLineTotal.toFixed(2)}
                        </del>
                    )}
                    <p
                        className={`
                            ${ITEM_TOTAL_PRICE_TEXT_SIZE} font-semibold
                            ${showDiscountedPrice ? DISCOUNT_PRICE_TEXT : NEUTRAL_TEXT_PRIMARY}
                        `}
                        aria-label={`Current total price ${displayLineTotal.toFixed(2)}`}
                    >
                        ${displayLineTotal.toFixed(2)}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

export default OrderItem;