// src/features/menu_view/subcomponents/MenuItemCard.jsx
import React, { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from '../../../components/common/Icon.jsx'; // Adjusted path
import WavingBackground from "../../../components/animations/WavingLine.jsx"; // Adjusted path
import { getEffectiveDisplayPrice } from "../utils/productUtils.js";

// Constants for card layout
const CARD_CONTENT_WIDTH_PX = 240;
const CARD_CONTENT_HEIGHT_PX = 270; // Slightly increased to accommodate tags/discounts better
const IMAGE_DIAMETER_PX = 128;
const IMAGE_PROTRUSION_PX = 48; // How much the image sticks out from the top of the card box
const TEXT_AREA_TOP_CLEARANCE_FROM_CARD_TOP_PX = (IMAGE_DIAMETER_PX - IMAGE_PROTRUSION_PX) + 12; // Space from card top to text area start

const FALLBACK_IMAGE_URL = 'https://via.placeholder.com/128?text=No+Image';

export default function MenuItemCard({ product, onOpenOptionsPopup }) {
    const [isEffectActive, setIsEffectActive] = useState(false);
    const imageAnimationStartRef = useRef(null);

    const { originalPrice, displayPrice, bestDiscountApplied } = useMemo(
        () => getEffectiveDisplayPrice(product),
        [product]
    );

    const handleCardClick = () => {
        setIsEffectActive(true);
        setTimeout(() => setIsEffectActive(false), 1200); // Duration of WavingBackground

        if (imageAnimationStartRef.current) {
            const imageRect = imageAnimationStartRef.current.getBoundingClientRect();
            onOpenOptionsPopup(product, imageRect);
        } else {
            onOpenOptionsPopup(product, null);
        }
    };

    const name = product?.name || "Unnamed Product";
    const subtitle = product?.subtitle;
    const description = product?.description || "A delightful selection from our menu.";
    const imageUrl = product?.image_url || FALLBACK_IMAGE_URL;
    const productTags = product?.product_tags_details || [];

    const totalComponentHeight = CARD_CONTENT_HEIGHT_PX + IMAGE_PROTRUSION_PX;

    const cardVariants = {
        initial: { opacity: 0, y: 30, scale: 0.95 },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.5, ease: [0.42, 0, 0.58, 1] }
        },
        hover: {
            scale: 1.03,
            y: -4, // Slightly more lift
            boxShadow: "0px 10px 20px rgba(0,0,0,0.12), 0px 4px 8px rgba(0,0,0,0.08)", // Enhanced shadow
            transition: { type: "spring", stiffness: 350, damping: 18 }
        }
    };

    const imageVariants = {
        hover: { scale: 1.05, transition: { type: "spring", stiffness: 350, damping: 12 } }
    }

    const contentBoxVariants = {
        hover: { y: -2, transition: { type: "spring", stiffness: 350, damping: 15 } }
    }


    return (
        <motion.div
            variants={cardVariants}
            // `initial` and `animate` will be controlled by parent's `staggerChildren` if part of a list.
            // If rendered individually, it will animate on mount.
            // For MenuDisplayLayout, it is part of a list, so this is fine.
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="relative flex-shrink-0 select-none cursor-pointer"
            style={{
                width: `${CARD_CONTENT_WIDTH_PX}px`,
                height: `${totalComponentHeight}px`,
            }}
            aria-label={`Menu item: ${name}`}
            onClick={handleCardClick}
        >
            {/* Waving background effect */}
            <AnimatePresence>
                {isEffectActive && (
                    <motion.div
                        className="absolute rounded-3xl overflow-hidden pointer-events-none"
                        style={{
                            left: 0,
                            right: 0,
                            top: `${IMAGE_PROTRUSION_PX}px`,
                            height: `${CARD_CONTENT_HEIGHT_PX}px`,
                            width: `${CARD_CONTENT_WIDTH_PX}px`,
                            zIndex: 5, // Behind main content, above base
                        }}
                        initial={{ opacity: 0, scaleY: 0.8 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0.8 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                    >
                        <WavingBackground
                            amplitude={12}
                            cycleInterval={4500}
                            propagationSpeed={0.35}
                            lineColor={['#fb7185', '#ec4899', '#e11d48']}
                            lineWidth={6}
                            inclinationAngle={-12}
                            waveSpacing={20}
                            waveVariation={0.3}
                            width={CARD_CONTENT_WIDTH_PX}
                            height={CARD_CONTENT_HEIGHT_PX}
                            pushDown={20}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main card structure (Image + Text Box) */}
            <motion.div
                className="absolute left-0 right-0"
                style={{
                    top: 0, // Image starts at the very top of the allocated space
                    width: `${CARD_CONTENT_WIDTH_PX}px`,
                    height: `${totalComponentHeight}px`,
                    zIndex: 10, // Main content above waving effect
                }}
                animate={isEffectActive ? { y: -10, scale: 1.02 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
            >
                {/* Product Image Container */}
                <motion.div
                    ref={imageAnimationStartRef}
                    variants={imageVariants} // Apply hover variant to image
                    className="absolute left-1/2 -translate-x-1/2 top-0 z-20 rounded-full bg-white dark:bg-neutral-700 shadow-xl flex items-center justify-center overflow-hidden border-4 border-white dark:border-neutral-750"
                    style={{
                        width: `${IMAGE_DIAMETER_PX}px`,
                        height: `${IMAGE_DIAMETER_PX}px`,
                    }}
                >
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE_URL; }}
                    />
                </motion.div>

                {/* Text Content Box */}
                <motion.div
                    variants={contentBoxVariants} // Apply hover variant to content box
                    className="absolute left-0 right-0 bg-neutral-100 dark:bg-neutral-800 rounded-3xl shadow-lg flex flex-col p-4"
                    style={{
                        top: `${IMAGE_PROTRUSION_PX}px`, // Positioned so image protrudes
                        height: `${CARD_CONTENT_HEIGHT_PX}px`,
                        width: `${CARD_CONTENT_WIDTH_PX}px`,
                    }}
                >
                    {/* Text Area: Positioned below the image's lowest point within this box */}
                    <div
                        className="w-full flex flex-col items-center text-center flex-1 min-h-0 overflow-hidden"
                        style={{
                            paddingTop: `${TEXT_AREA_TOP_CLEARANCE_FROM_CARD_TOP_PX}px`,
                            // Total height for text area = CARD_CONTENT_HEIGHT_PX - TEXT_AREA_TOP_CLEARANCE_FROM_CARD_TOP_PX - footerHeight
                            // Footer height approx 50-60px. Manage this with flex-1 and min-h-0 on children for scroll/clamp.
                        }}
                    >
                        <h1 className="font-montserrat font-bold text-lg text-neutral-900 dark:text-white tracking-tight leading-tight flex-shrink-0 mb-0.5 truncate w-full" title={name}>
                            {name}
                        </h1>
                        {subtitle && (
                            <p className="font-montserrat text-xs font-medium text-neutral-600 dark:text-neutral-400 leading-snug mb-1 truncate w-full" title={subtitle}>
                                {subtitle}
                            </p>
                        )}
                        <p
                            className="font-montserrat text-[11px] font-normal text-neutral-500 dark:text-neutral-400 leading-snug w-full mb-1.5 flex-grow" // flex-grow might be too aggressive, ensure clamping works
                            style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2, // Max 2 lines for description
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                minHeight: '28px', // Approx 2 lines of 11px text to prevent collapse
                                maxHeight: '28px', // Ensure it doesn't push tags down too much
                            }}
                            title={description}
                        >
                            {description}
                        </p>

                        {/* Product Tags */}
                        {productTags.length > 0 && (
                            <div className="flex flex-wrap justify-center items-center gap-1.5 my-1.5 max-h-[44px] overflow-hidden flex-shrink-0"> {/* Fixed max-height, no scrollbar */}
                                {productTags.slice(0, 3).map(tag => ( // Max 3 tags
                                    <span
                                        key={tag.id}
                                        className="text-[9px] bg-rose-100 dark:bg-rose-700/60 text-rose-700 dark:text-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium whitespace-nowrap"
                                        title={tag.name}
                                    >
                                        {tag.icon_name && <Icon name={tag.icon_name} className="w-2.5 h-2.5" />}
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer: Price & Visual Cue for Add Button */}
                    <div className="w-full flex items-end justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700 mt-auto flex-shrink-0">
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
                                        <span
                                            className="text-[9px] font-semibold text-green-700 dark:text-green-300 leading-tight mt-0.5 bg-green-100 dark:bg-green-800/40 px-1.5 py-0.5 rounded truncate max-w-[100px]"
                                            title={bestDiscountApplied.description}
                                        >
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

                        {/* Visual cue, not an actual button since card is clickable */}
                        <div
                            className="flex items-center justify-center gap-1 bg-rose-500 shadow-md text-white font-montserrat font-semibold text-sm py-2 px-3 rounded-lg pointer-events-none"
                        >
                            <Icon
                                name={"add_shopping_cart"}
                                className="w-4 h-4"
                                variations={{ fill: 1, weight: 600 }}
                            />
                            <span>Add</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}