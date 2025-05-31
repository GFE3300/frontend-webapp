import React, { useState, useRef, useMemo } from "react";
// eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";
import Icon from "../../../components/common/Icon"; // Adjusted path
import WavingBackground from "../../../components/animations/WavingLine"; // Adjusted path
import { getEffectiveDisplayPrice } from "../utils/productUtils"; // Adjusted path

// Constants for card layout
const CARD_CONTENT_WIDTH = 240;
const CARD_CONTENT_HEIGHT = 260; // Slightly increased for tags/discount
const IMAGE_DIAMETER = 128;
const IMAGE_PROTRUSION = 48;
const TEXT_AREA_TOP_CLEARANCE_FROM_CARD_TOP = (IMAGE_DIAMETER - IMAGE_PROTRUSION) + 12; // Space for image + padding

const FALLBACK_IMAGE_URL = 'https://via.placeholder.com/128?text=No+Image';

/**
 * Renders a card for a single menu item, displaying its details, price (with discounts),
 * tags, and an "Add to Order" button.
 *
 * @param {object} props - The component's props.
 * @param {object} props.product - The product object containing all details.
 *                                 Expected fields: `id`, `name`, `subtitle` (optional), `description`,
 *                                 `image_url`, `selling_price_excl_tax`, `active_applied_product_discounts`,
 *                                 `product_tags_details` (optional array of tags with `id`, `name`, `icon_name`),
 *                                 `editable_attribute_groups` (optional for options logic).
 * @param {function} props.onOpenOptionsPopup - Callback function invoked when the "Add" button is clicked.
 *                                              It receives the product object and the image's bounding rectangle.
 * @returns {JSX.Element} The rendered MenuItemCard component.
 */
export default function MenuItemCard({ product, onOpenOptionsPopup }) {
    const [isEffectActive, setIsEffectActive] = useState(false);
    const imageAnimationStartRef = useRef(null);

    // Memoize price calculation using the utility function
    const { originalPrice, displayPrice, bestDiscountApplied } = useMemo(
        () => getEffectiveDisplayPrice(product),
        [product]
    );

    const handleAddToCartClick = () => {
        setIsEffectActive(true);
        setTimeout(() => setIsEffectActive(false), 1200); // Effect duration

        if (imageAnimationStartRef.current) {
            const imageRect = imageAnimationStartRef.current.getBoundingClientRect();
            onOpenOptionsPopup(product, imageRect);
        } else {
            onOpenOptionsPopup(product, null); // Fallback if ref is not available
        }
    };

    const description = product.description || "A delightful selection from our menu.";
    const totalComponentHeight = CARD_CONTENT_HEIGHT + IMAGE_PROTRUSION;
    const imageUrl = product.image_url || FALLBACK_IMAGE_URL;

    const cardVariants = {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.42, 0, 0.58, 1] } },
        hover: { scale: 1.03, y: -3, transition: { type: "spring", stiffness: 300, damping: 15 } }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate" // Or whileInView="animate" if inside a scroll container for staggered animation
            whileHover="hover"
            className="relative flex-shrink-0 select-none"
            style={{
                width: `${CARD_CONTENT_WIDTH}px`,
                height: `${totalComponentHeight}px`,
            }}
            aria-label={`Menu item: ${product.name}`}
        >
            {/* Waving background effect on click */}
            <AnimatePresence>
                {isEffectActive && (
                    <motion.div
                        className="absolute rounded-3xl overflow-hidden pointer-events-none"
                        style={{
                            left: 0,
                            right: 0,
                            top: `${IMAGE_PROTRUSION}px`,
                            height: `${CARD_CONTENT_HEIGHT}px`,
                            width: `${CARD_CONTENT_WIDTH}px`,
                            zIndex: 5,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <WavingBackground
                            amplitude={10}
                            cycleInterval={5000}
                            propagationSpeed={0.3}
                            lineColor={['#fb7185', '#ec4899', '#e11d48']} // Theme-aware colors could be passed
                            lineWidth={5}
                            inclinationAngle={-15}
                            waveSpacing={18}
                            waveVariation={0.25}
                            width={CARD_CONTENT_WIDTH}
                            height={CARD_CONTENT_HEIGHT}
                            pushDown={15}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main card content structure */}
            <motion.div
                className="absolute left-0 right-0"
                style={{
                    top: 0,
                    width: `${CARD_CONTENT_WIDTH}px`,
                    height: `${totalComponentHeight}px`,
                    zIndex: 10,
                }}
                animate={isEffectActive ? { y: -8, scale: 1.015 } : { y: 0, scale: 1 }} // Slight lift effect
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
                {/* Product Image Container */}
                <div
                    ref={imageAnimationStartRef}
                    className="absolute left-1/2 -translate-x-1/2 top-0 z-20 rounded-full bg-white dark:bg-neutral-700 shadow-xl flex items-center justify-center overflow-hidden border-2 border-white dark:border-neutral-750"
                    style={{
                        width: `${IMAGE_DIAMETER}px`,
                        height: `${IMAGE_DIAMETER}px`,
                    }}
                >
                    <img
                        src={imageUrl}
                        alt={product.name || "Menu item image"}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE_URL; }}
                    />
                </div>

                {/* Text Content Box */}
                <div
                    className="absolute left-0 right-0 bg-neutral-100 dark:bg-neutral-800 rounded-3xl shadow-lg flex flex-col p-4"
                    style={{
                        top: `${IMAGE_PROTRUSION}px`,
                        height: `${CARD_CONTENT_HEIGHT}px`,
                        width: `${CARD_CONTENT_WIDTH}px`,
                    }}
                >
                    {/* Text Area: Name, Subtitle, Description, Tags */}
                    <div
                        className="w-full flex flex-col items-center text-center gap-0.5 flex-1 min-h-0 overflow-hidden"
                        style={{
                            paddingTop: `${TEXT_AREA_TOP_CLEARANCE_FROM_CARD_TOP}px`, // Clearance for protruding image
                        }}
                    >
                        <h1 className="font-montserrat font-bold text-lg text-neutral-900 dark:text-white tracking-tight leading-tight flex-shrink-0 mb-0.5 truncate w-full" title={product.name}>
                            {product.name}
                        </h1>
                        {product.subtitle && (
                            <p className="font-montserrat text-xs font-medium text-neutral-600 dark:text-neutral-400 leading-snug mb-1 truncate w-full" title={product.subtitle}>
                                {product.subtitle}
                            </p>
                        )}
                        <p
                            className="font-montserrat text-[11px] font-normal text-neutral-500 dark:text-neutral-400 leading-snug w-full mb-1.5"
                            style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2, // Limit description to 2 lines
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                minHeight: '28px', // Approx height for 2 lines of 11px text
                            }}
                            title={description}
                        >
                            {description}
                        </p>
                        {/* Product Tags */}
                        {product.product_tags_details && product.product_tags_details.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-1.5 mb-1.5 max-h-10 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 py-1">
                                {product.product_tags_details.slice(0, 3).map(tag => ( // Show up to 3 tags
                                    <span
                                        key={tag.id}
                                        className="text-[9px] bg-rose-100 dark:bg-rose-700/50 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium"
                                        title={tag.name}
                                    >
                                        {tag.icon_name && <Icon name={tag.icon_name} className="w-2.5 h-2.5" />}
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer: Price & Add Button */}
                    <div className="w-full flex items-end justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700 mt-auto flex-shrink-0">
                        {/* Price Display with Discount Handling */}
                        <div className="flex flex-col items-start text-left">
                            {bestDiscountApplied ? (
                                <>
                                    <span className="font-montserrat text-xs line-through text-neutral-400 dark:text-neutral-500">
                                        ${originalPrice.toFixed(2)}
                                    </span>
                                    <span className="font-montserrat text-lg font-bold text-red-600 dark:text-red-400 leading-tight">
                                        ${displayPrice.toFixed(2)}
                                    </span>
                                    {bestDiscountApplied.description && (
                                        <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 leading-tight mt-0.5 bg-green-100 dark:bg-green-700/30 px-1 py-0.5 rounded" title={bestDiscountApplied.description}>
                                            {bestDiscountApplied.description}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="font-montserrat text-lg font-bold text-neutral-700 dark:text-neutral-300">
                                    ${originalPrice.toFixed(2)}
                                </span>
                            )}
                        </div>
                        <motion.button
                            className="flex items-center justify-center gap-1.5 bg-rose-500 shadow-md text-white font-montserrat font-semibold text-sm py-2 px-3.5 rounded-lg"
                            onClick={handleAddToCartClick}
                            whileHover={{ scale: 1.05, backgroundColor: "#e11d48" }} // Slightly darker rose on hover
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            aria-label={`Add ${product.name} to order`}
                        >
                            <Icon
                                name={"add_shopping_cart"} // Material Symbols 'add_shopping_cart'
                                className="w-4 h-4"
                                variations={{ fill: 1, weight: 500 }} // Ensure icon is filled
                            />
                            <span>Add</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}