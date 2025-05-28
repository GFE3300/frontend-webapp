import React from 'react';

// Design Guideline Mappings for Counters
const COUNTER_RENDERER_STYLES = {
    gradientLight: "bg-gradient-to-br from-amber-300 to-amber-400", // Using amber as "orange"
    gradientDark: "dark:from-amber-500 dark:to-amber-600",
    borderLight: "border-amber-500",
    borderDark: "dark:border-amber-400",
    textLight: "text-amber-800",
    textDark: "dark:text-amber-100",
    fontFamily: "font-montserrat",
    fontWeight: "font-medium",
    fontSize: "text-[10px]", // Counters might be thin, so small text
};

const CounterRenderer = ({ item }) => {
    // item: { id, shape (e.g. 'counter-straight-2x1'), label, rotation (handled by wrapper) }

    // Counters are typically rectangular, so rounded-md.
    // Their length is determined by w_minor/h_minor via PlacedItem.
    // This renderer just styles the block.
    const borderRadiusClass = "rounded-md";

    return (
        <div
            className={`w-full h-full flex items-center justify-center 
                        ${COUNTER_RENDERER_STYLES.gradientLight} ${COUNTER_RENDERER_STYLES.gradientDark}
                        border ${COUNTER_RENDERER_STYLES.borderLight} ${COUNTER_RENDERER_STYLES.borderDark}
                        ${borderRadiusClass}
                        select-none transition-colors duration-150 px-1`} // Added padding for text
        // Title attribute handled by PlacedItem.jsx
        >
            {item.label && (
                <span
                    className={`truncate ${COUNTER_RENDERER_STYLES.fontFamily} ${COUNTER_RENDERER_STYLES.fontWeight} ${COUNTER_RENDERER_STYLES.fontSize} ${COUNTER_RENDERER_STYLES.textLight} ${COUNTER_RENDERER_STYLES.textDark}`}
                >
                    {item.label}
                </span>
            )}
            {!item.label && ( // Fallback if no label, to still show something
                <span
                    className={`opacity-60 ${COUNTER_RENDERER_STYLES.fontFamily} ${COUNTER_RENDERER_STYLES.fontWeight} ${COUNTER_RENDERER_STYLES.fontSize} ${COUNTER_RENDERER_STYLES.textLight} ${COUNTER_RENDERER_STYLES.textDark}`}
                >
                    Counter
                </span>
            )}
        </div>
    );
};

export default CounterRenderer;