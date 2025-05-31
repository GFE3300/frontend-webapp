// frontend/src/features/menu_view/subcomponents/MenuItemCard.jsx
// (Path from your frontend.txt)

import React, { useState, useRef, useMemo } from "react";
// eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";
import Icon from "../../../components/common/Icon"; // REVIEW: Ensure this path is correct.
import WavingBackground from "../../../components/animations/WavingLine"; // REVIEW: Ensure this path is correct.
import { getEffectiveDisplayPrice } from "../utils/productUtils"; // REVIEW: Ensure this path is correct.

// Constants for card layout
// REVIEW: These constants define the card's geometry. Ensure they match the desired visual proportions.
const CARD_CONTENT_WIDTH = 240;
const CARD_CONTENT_HEIGHT = 260; // Slightly increased for tags/discount
const IMAGE_DIAMETER = 128;
const IMAGE_PROTRUSION = 48; // How much the image circle sticks out above the text box.
const TEXT_AREA_TOP_CLEARANCE_FROM_CARD_TOP = (IMAGE_DIAMETER - IMAGE_PROTRUSION) + 12; // Space for image + padding

// REVIEW: Fallback image if product.image_url is missing or broken.
const FALLBACK_IMAGE_URL = 'https://via.placeholder.com/128?text=No+Image';

/**
 * Renders a card for a single menu item... (docstring seems fine)
 */
export default function MenuItemCard({ product, onOpenOptionsPopup }) {
    const [isEffectActive, setIsEffectActive] = useState(false); // For WavingBackground animation
    const imageAnimationStartRef = useRef(null); // Ref for the image, used for flying animation start point

    // CRITICAL: Price calculation using utility.
    // Depends on `product.selling_price_excl_tax` and `product.active_applied_product_discounts`.
    const { originalPrice, displayPrice, bestDiscountApplied } = useMemo(
        () => getEffectiveDisplayPrice(product),
        [product]
    );

    const handleAddToCartClick = () => {
        setIsEffectActive(true);
        setTimeout(() => setIsEffectActive(false), 1200); // REVIEW: Duration of WavingBackground effect.

        // Pass the product and image's bounding rectangle to the parent.
        if (imageAnimationStartRef.current) {
            const imageRect = imageAnimationStartRef.current.getBoundingClientRect();
            onOpenOptionsPopup(product, imageRect);
        } else {
            onOpenOptionsPopup(product, null); // Fallback if ref is not available
        }
    };

    // CRITICAL: `product.description` from backend. Fallback text if missing.
    const description = product.description || "A delightful selection from our menu.";
    const totalComponentHeight = CARD_CONTENT_HEIGHT + IMAGE_PROTRUSION;
    // CRITICAL: `product.image_url` from backend.
    const imageUrl = product.image_url || FALLBACK_IMAGE_URL;

    // REVIEW: Card animation variants (initial entry, hover).
    const cardVariants = {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.42, 0, 0.58, 1] } },
        hover: { scale: 1.03, y: -3, transition: { type: "spring", stiffness: 300, damping: 15 } }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="initial"
            // `animate` prop is used here. If this card is directly mapped in `MenuDisplayLayout` without its own
            // parent `motion` component with `staggerChildren`, each card will animate independently based on this.
            // If `MenuDisplayLayout` uses `whileInView` for the whole section, this animate might be redundant or could be `whileInView` too.
            // For now, assuming `animate` is fine for an immediate animation.
            animate="animate"
            whileHover="hover"
            className="relative flex-shrink-0 select-none" // `select-none` to prevent text selection on drag.
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
                            top: `${IMAGE_PROTRUSION}px`, // Starts where the text box starts
                            height: `${CARD_CONTENT_HEIGHT}px`,
                            width: `${CARD_CONTENT_WIDTH}px`,
                            zIndex: 5, // Behind main content but above base.
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {/* REVIEW: WavingBackground parameters. Ensure theme-aware colors could be passed if needed. */}
                        <WavingBackground
                            amplitude={10}
                            cycleInterval={5000}
                            propagationSpeed={0.3}
                            lineColor={['#fb7185', '#ec4899', '#e11d48']} // Example pink/rose colors
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
                    zIndex: 10, // Above WavingBackground
                }}
                // Slight lift effect when WavingBackground is active.
                animate={isEffectActive ? { y: -8, scale: 1.015 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
                {/* Product Image Container */}
                {/* REVIEW: Image container styling (position, z-index, rounded, bg, shadow, border). */}
                <div
                    ref={imageAnimationStartRef}
                    className="absolute left-1/2 -translate-x-1/2 top-0 z-20 rounded-full bg-white dark:bg-neutral-700 shadow-xl flex items-center justify-center overflow-hidden border-2 border-white dark:border-neutral-750"
                    style={{
                        width: `${IMAGE_DIAMETER}px`,
                        height: `${IMAGE_DIAMETER}px`,
                    }}
                >
                    <img
                        src={imageUrl} // From `product.image_url` or fallback
                        alt={product.name || "Menu item image"}
                        className="w-full h-full object-cover" // `object-cover` ensures image fills circle.
                        onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE_URL; }}
                    />
                </div>

                {/* Text Content Box */}
                {/* REVIEW: Text box styling (position, bg, rounded, shadow, padding). */}
                <div
                    className="absolute left-0 right-0 bg-neutral-100 dark:bg-neutral-800 rounded-3xl shadow-lg flex flex-col p-4"
                    style={{
                        top: `${IMAGE_PROTRUSION}px`, // Positioned below the protruding part of the image.
                        height: `${CARD_CONTENT_HEIGHT}px`,
                        width: `${CARD_CONTENT_WIDTH}px`,
                    }}
                >
                    {/* Text Area: Name, Subtitle, Description, Tags */}
                    <div
                        className="w-full flex flex-col items-center text-center gap-0.5 flex-1 min-h-0 overflow-hidden"
                        style={{
                            // Clearance for protruding image. REVIEW: `+12` padding from constant.
                            paddingTop: `${TEXT_AREA_TOP_CLEARANCE_FROM_CARD_TOP}px`,
                        }}
                    >
                        {/* REVIEW: Product name styling (font, size, color, tracking, leading, truncation). `product.name` from backend. */}
                        <h1 className="font-montserrat font-bold text-lg text-neutral-900 dark:text-white tracking-tight leading-tight flex-shrink-0 mb-0.5 truncate w-full" title={product.name}>
                            {product.name}
                        </h1>
                        {/* REVIEW: Subtitle styling (font, size, color, leading, truncation). `product.subtitle` from backend. */}
                        {product.subtitle && (
                            <p className="font-montserrat text-xs font-medium text-neutral-600 dark:text-neutral-400 leading-snug mb-1 truncate w-full" title={product.subtitle}>
                                {product.subtitle}
                            </p>
                        )}
                        {/* REVIEW: Description styling (font, size, color, leading, line-clamp for 2 lines). */}
                        <p
                            className="font-montserrat text-[11px] font-normal text-neutral-500 dark:text-neutral-400 leading-snug w-full mb-1.5"
                            style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2, // Limit description to 2 lines
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                minHeight: '28px', // Approx height for 2 lines of 11px text. REVIEW: Adjust if font/line-height changes.
                            }}
                            title={description}
                        >
                            {description}
                        </p>
                        {/* Product Tags */}
                        {/* CRITICAL: Depends on `product.product_tags_details` array from backend. Each tag: id, name, icon_name. */}
                        {product.product_tags_details && product.product_tags_details.length > 0 && (
                            // REVIEW: Tag container styling (flex, gap, margin, max-height for scroll, scrollbar styling).
                            <div className="flex flex-wrap justify-center gap-1.5 mb-1.5 max-h-10 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 py-1">
                                {product.product_tags_details.slice(0, 3).map(tag => ( // Shows up to 3 tags. REVIEW: Limit if different.
                                    // REVIEW: Individual tag styling (font size, bg, text color, padding, icon size/margin).
                                    <span
                                        key={tag.id}
                                        className="text-[9px] bg-rose-100 dark:bg-rose-700/50 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium"
                                        title={tag.name}
                                    >
                                        {tag.icon_name && <Icon name={tag.icon_name} className="w-2.5 h-2.5" />} {/* Icon for tag */}
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer: Price & Add Button */}
                    {/* REVIEW: Footer styling (padding, border). */}
                    <div className="w-full flex items-end justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700 mt-auto flex-shrink-0">
                        {/* Price Display with Discount Handling */}
                        <div className="flex flex-col items-start text-left">
                            {bestDiscountApplied ? ( // If a discount is applied
                                <>
                                    {/* REVIEW: Original price (struck-through) styling. */}
                                    <span className="font-montserrat text-xs line-through text-neutral-400 dark:text-neutral-500">
                                        ${originalPrice.toFixed(2)}
                                    </span>
                                    {/* REVIEW: Discounted price styling. */}
                                    <span className="font-montserrat text-lg font-bold text-red-600 dark:text-red-400 leading-tight">
                                        ${displayPrice.toFixed(2)}
                                    </span>
                                    {/* REVIEW: Discount description styling (font size, color, bg, padding). */}
                                    {bestDiscountApplied.description && (
                                        <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 leading-tight mt-0.5 bg-green-100 dark:bg-green-700/30 px-1 py-0.5 rounded" title={bestDiscountApplied.description}>
                                            {bestDiscountApplied.description}
                                        </span>
                                    )}
                                </>
                            ) : ( // If no discount
                                // REVIEW: Regular price styling.
                                <span className="font-montserrat text-lg font-bold text-neutral-700 dark:text-neutral-300">
                                    ${originalPrice.toFixed(2)}
                                </span>
                            )}
                        </div>
                        {/* "Add" Button */}
                        {/* REVIEW: Button styling (bg, shadow, text color, font, padding, icon styling). */}
                        <motion.button
                            className="flex items-center justify-center gap-1.5 bg-rose-500 shadow-md text-white font-montserrat font-semibold text-sm py-2 px-3.5 rounded-lg"
                            onClick={handleAddToCartClick}
                            whileHover={{ scale: 1.05, backgroundColor: "#e11d48" }} // Darker rose on hover
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