import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "../../../components/common/Icon";
import WavingBackground from "../../../components/animations/WavingLine";


const CARD_CONTENT_WIDTH = 240;
const CARD_CONTENT_HEIGHT = 240;
const IMAGE_DIAMETER = 128;
const IMAGE_PROTRUSION = 48;
const TEXT_AREA_TOP_CLEARANCE_FROM_CARD_TOP = (IMAGE_DIAMETER - IMAGE_PROTRUSION) + 8; 

export default function MenuItemCard({ item, onOpenOptionsPopup }) {
    const [isEffectActive, setIsEffectActive] = useState(false);
    const imageAnimationStartRef = useRef(null);

    const handleAddToCartClick = () => {
        setIsEffectActive(true);
        setTimeout(() => setIsEffectActive(false), 2000);

        if (imageAnimationStartRef.current) {
            const imageRect = imageAnimationStartRef.current.getBoundingClientRect();
            onOpenOptionsPopup(item, imageRect);
        } else {
            onOpenOptionsPopup(item, null);
        }
    };
    
    const description = item.description || "A delightful selection from our menu.";
    const totalComponentHeight = CARD_CONTENT_HEIGHT + IMAGE_PROTRUSION;

    return (
        <div
            className="relative flex-shrink-0"
            style={{
                width: `${CARD_CONTENT_WIDTH}px`,
                height: `${totalComponentHeight}px`,
            }}
        >
            <AnimatePresence>
                {isEffectActive && (
                    <motion.div
                        className="absolute rounded-3xl overflow-hidden"
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
                            amplitude={12}
                            cycleInterval={6000}
                            propagationSpeed={0.25}
                            lineColor={['#fb7185', '#ec4899']}
                            lineWidth={6}
                            inclinationAngle={-20}
                            waveSpacing={20}
                            waveVariation={0.3}
                            width={CARD_CONTENT_WIDTH}
                            height={CARD_CONTENT_HEIGHT}
                            pushDown={10}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="absolute left-0 right-0"
                style={{
                    top: 0,
                    width: `${CARD_CONTENT_WIDTH}px`,
                    height: `${totalComponentHeight}px`,
                    zIndex: 10,
                }}
                animate={isEffectActive ? { y: -10, scale: 1.02 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
                <div
                    ref={imageAnimationStartRef}
                    className="absolute left-1/2 -translate-x-1/2 top-0 z-20 rounded-full bg-white dark:bg-neutral-700 shadow-xl flex items-center justify-center"
                    style={{
                        width: `${IMAGE_DIAMETER}px`,
                        height: `${IMAGE_DIAMETER}px`,
                    }}
                >
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-full"
                    />
                </div>

                <div
                    className="absolute left-0 right-0 bg-neutral-100 dark:bg-neutral-800 rounded-3xl shadow-lg flex flex-col p-4"
                    style={{
                        top: `${IMAGE_PROTRUSION}px`,
                        height: `${CARD_CONTENT_HEIGHT}px`,
                        width: `${CARD_CONTENT_WIDTH}px`,
                    }}
                >
                 
                    <div
                        className="w-full select-none flex flex-col items-center text-center gap-0.5 flex-1 min-h-0" 
                        style={{
                            paddingTop: `${TEXT_AREA_TOP_CLEARANCE_FROM_CARD_TOP - 16}px`,
                        }}
                    >
                        <h1 className="font-montserrat font-semibold text-lg text-neutral-900 dark:text-white tracking-tight leading-tight flex-shrink-0 mb-0.5"> 
                            {item.name}
                        </h1>
                        <p 
                            className="font-montserrat text-[11px] font-medium text-neutral-500 dark:text-neutral-400 leading-snug w-full" 
                            style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3, 
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {description}
                        </p>
                    </div>

                    <div className="w-full flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700 mt-auto flex-shrink-0">
                        <span className="font-montserrat text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                            €{item.price.toFixed(2)}
                        </span>
                        <motion.button
                            className="flex items-center justify-center gap-2 bg-pink-500 shadow-md text-white font-montserrat font-semibold text-sm py-2 px-3 rounded-lg" 
                            onClick={handleAddToCartClick}
                            whileHover={{ scale: 1.05, backgroundColor: "#d946ef" }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <Icon
                                name={"shopping_cart"}
                                className="w-4 h-4"
                                variations={{ fill: 1, weight: 600, opsz: 20 }}
                                style={{ fontSize: '16px' }}
                            />
                            <span>Add</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}