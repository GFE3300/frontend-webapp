// src/features/Userpage/SubComponents/MenuItemCard.jsx
import React, { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "../../../components/common/Icon";
import WavingBackground from "../../../components/animations/WavingLine";
import { getEffectiveDisplayPrice } from "../utils/productUtils"; // Import the utility

// Constants for card layout - these can be adjusted as needed
const CARD_CONTENT_WIDTH = 240; // Width of the main content box
const CARD_CONTENT_HEIGHT = 260; // Height of the main content box (increased slightly for tags/discount)
const IMAGE_DIAMETER = 128; // Diameter of the circular image
const IMAGE_PROTRUSION = 48; // How much the image protrudes above the content box
const TEXT_AREA_TOP_CLEARANCE_FROM_CARD_TOP = (IMAGE_DIAMETER - IMAGE_PROTRUSION) + 12; // Space from top of card to text content (adjusted for subtitle/tags)

export default function MenuItemCard({ product, onOpenOptionsPopup }) {
    const [isEffectActive, setIsEffectActive] = useState(false);
    const imageAnimationStartRef = useRef(null);

    // Memoize price calculation to avoid re-computation on every render unless product changes
    const { originalPrice, displayPrice, bestDiscountApplied } = useMemo(
        () => getEffectiveDisplayPrice(product),
        [product]
    );

    const handleAddToCartClick = () => {
        setIsEffectActive(true);
        setTimeout(() => setIsEffectActive(false), 1200); // Shortened effect duration

        if (imageAnimationStartRef.current) {
            const imageRect = imageAnimationStartRef.current.getBoundingClientRect();
            onOpenOptionsPopup(product, imageRect); // Pass the full product object
        } else {
            onOpenOptionsPopup(product, null);
        }
    };

    const description = product.description || "A delightful selection from our menu.";
    const totalComponentHeight = CARD_CONTENT_HEIGHT + IMAGE_PROTRUSION;
    const imageUrl = product.image_url || 'https://via.placeholder.com/128?text=No+Image'; // Fallback image

    return (
        <div
            className="relative flex-shrink-0 select-none"
            style={{
                width: `${CARD_CONTENT_WIDTH}px`,
                height: `${totalComponentHeight}px`,
            }}
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
                            zIndex: 5, // Behind main card content but above page background
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
                            lineColor={['#fb7185', '#ec4899', '#e11d48']}
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
                animate={isEffectActive ? { y: -8, scale: 1.015 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
                {/* Product Image Container */}
                <div
                    ref={imageAnimationStartRef}
                    className="absolute left-1/2 -translate-x-1/2 top-0 z-20 rounded-full bg-white dark:bg-neutral-700 shadow-xl flex items-center justify-center overflow-hidden"
                    style={{
                        width: `${IMAGE_DIAMETER}px`,
                        height: `${IMAGE_DIAMETER}px`,
                    }}
                >
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/128?text=Error'; }}
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
                            paddingTop: `${TEXT_AREA_TOP_CLEARANCE_FROM_CARD_TOP}px`, // Clearance for image
                        }}
                    >
                        <h1 className="font-montserrat font-bold text-lg text-neutral-900 dark:text-white tracking-tight leading-tight flex-shrink-0 mb-0.5">
                            {product.name}
                        </h1>
                        {product.subtitle && (
                            <p className="font-montserrat text-xs font-medium text-neutral-600 dark:text-neutral-400 leading-snug mb-1">
                                {product.subtitle}
                            </p>
                        )}
                        <p
                            className="font-montserrat text-[11px] font-normal text-neutral-500 dark:text-neutral-400 leading-snug w-full mb-1.5"
                            style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2, // Adjusted for more space for tags/price
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                minHeight: '28px', // Approx 2 lines
                            }}
                        >
                            {description}
                        </p>
                        {/* Product Tags */}
                        {product.product_tags_details && product.product_tags_details.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-1 mb-1.5 max-h-10 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600">
                                {product.product_tags_details.slice(0, 3).map(tag => ( // Show max 3 tags for brevity
                                    <span key={tag.id} className="text-[9px] bg-rose-100 dark:bg-rose-700/50 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded-full flex items-center gap-1">
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
                        <div className="flex flex-col items-start">
                            {bestDiscountApplied ? (
                                <>
                                    <span className="font-montserrat text-xs line-through text-neutral-400 dark:text-neutral-500">
                                        ${originalPrice.toFixed(2)}
                                    </span>
                                    <span className="font-montserrat text-lg font-semibold text-red-600 dark:text-red-400">
                                        ${displayPrice.toFixed(2)}
                                    </span>
                                    <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 leading-tight">
                                        {bestDiscountApplied.description}
                                    </span>
                                </>
                            ) : (
                                <span className="font-montserrat text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                                    ${originalPrice.toFixed(2)}
                                </span>
                            )}
                        </div>
                        <motion.button
                            className="flex items-center justify-center gap-1.5 bg-rose-500 shadow-md text-white font-montserrat font-semibold text-sm py-2 px-3 rounded-lg"
                            onClick={handleAddToCartClick}
                            whileHover={{ scale: 1.05, backgroundColor: "#e11d48" }} // Adjusted hover color
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <Icon
                                name={"add_shopping_cart"}
                                className="w-4 h-4"
                                variations={{ fill: 1, weight: 500, opsz: 20 }} // Slightly bolder
                            />
                            <span>Add</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}