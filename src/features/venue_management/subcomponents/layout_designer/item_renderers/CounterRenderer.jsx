import React from 'react';

// Localization
import slRaw from '../../../utils/script_lines.js'; // Adjusted path
const sl = slRaw.venueManagement.counterRenderer;

// Design Guideline Mappings (Copied from original, no changes here)
const COUNTER_RENDERER_STYLES = {
    gradientLight: "bg-gradient-to-br from-amber-300 to-amber-400",
    gradientDark: "dark:from-amber-500 dark:to-amber-600",
    borderLight: "border-amber-500",
    borderDark: "dark:border-amber-400",
    textLight: "text-amber-800",
    textDark: "dark:text-amber-100",
    fontFamily: "font-montserrat",
    fontWeight: "font-medium",
    fontSize: "text-[10px]", // Counters might be thin, so small text
};
// --- End Design Guideline Variables ---

const CounterRenderer = ({ item, isPreviewMode = false }) => { // itemRotation removed, isPreviewMode added
    // item: { id, shape (e.g. 'counter-straight-2x1'), label, rotation (handled by PlacedItem) }

    const borderRadiusClass = "rounded-md"; // Counters are typically rectangular

    // The itemRotation prop is no longer passed as PlacedItem handles the rotation of its wrapper.
    // This renderer displays the counter as if it's at 0 degrees.

    const displayText = item.label || (sl.defaultLabel || "Counter");
    const textOpacityClass = item.label ? '' : 'opacity-60'; // Dim default text slightly

    return (
        <div
            className={`w-full h-full flex items-center justify-center 
                        ${COUNTER_RENDERER_STYLES.gradientLight} ${COUNTER_RENDERER_STYLES.gradientDark}
                        border ${COUNTER_RENDERER_STYLES.borderLight} ${COUNTER_RENDERER_STYLES.borderDark}
                        ${borderRadiusClass}
                        select-none transition-colors duration-150 px-1`}
        // Title attribute is handled by the parent PlacedItem component.
        >
            <span
                className={`truncate ${textOpacityClass} ${COUNTER_RENDERER_STYLES.fontFamily} ${COUNTER_RENDERER_STYLES.fontWeight} ${COUNTER_RENDERER_STYLES.fontSize} ${COUNTER_RENDERER_STYLES.textLight} ${COUNTER_RENDERER_STYLES.textDark}`}
            >
                {displayText}
            </span>
        </div>
    );
};

export default CounterRenderer;