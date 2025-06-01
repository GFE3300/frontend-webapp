import React from 'react';
import Icon from '../../../../../components/common/Icon'; // Path to common Icon component

// Localization (imported for consistency, though not heavily used for direct strings yet)
// import slRaw from '../../../utils/script_lines.js';
// const sl = slRaw.venueManagement.decorRenderer;

// Design Guideline Mappings (Copied from original, no changes here)
const DECOR_RENDERER_STYLES = {
    plantGradientLight: "bg-gradient-to-br from-green-300 to-green-400",
    plantGradientDark: "dark:from-green-500 dark:to-green-600",
    plantBorderLight: "border-green-500",
    plantBorderDark: "dark:border-green-400",
    plantIconColorLight: "text-green-700",
    plantIconColorDark: "dark:text-green-200",

    rugGradientLight: "bg-gradient-to-br from-sky-200 to-sky-300",
    rugGradientDark: "dark:from-sky-600 dark:to-sky-700",
    rugBorderLight: "border-sky-400",
    rugBorderDark: "dark:border-sky-300",
    rugIconColorLight: "text-sky-700",
    rugIconColorDark: "dark:text-sky-200",

    defaultGradientLight: "bg-gradient-to-br from-neutral-200 to-neutral-300",
    defaultGradientDark: "dark:from-neutral-600 dark:to-neutral-700",
    defaultBorderLight: "border-neutral-400",
    defaultBorderDark: "dark:border-neutral-500",
    defaultIconColorLight: "text-neutral-500",
    defaultIconColorDark: "dark:text-neutral-400",
};
// --- End Design Guideline Variables ---

const DecorRenderer = ({ item, isPreviewMode = false, zoomLevel = 1 }) => { // itemRotation removed, isPreviewMode & zoomLevel added for context
    let content = null;
    let styleClasses = "";
    // item.shape might contain 'round', 'rect', etc.
    const borderRadiusClass = item.shape?.includes('round') ? 'rounded-full' : 'rounded-lg';

    // Adjust icon size based on zoomLevel or a fixed small size for preview
    // This is a simple scaling; more sophisticated logic might be needed for extreme zooms
    const baseIconSizeRem = 1.5; // Default size in rem (e.g., 24px if 1rem=16px)
    let effectiveIconSizeRem = baseIconSizeRem;

    if (isPreviewMode) {
        effectiveIconSizeRem = baseIconSizeRem * Math.max(0.5, Math.min(zoomLevel, 1.2)); // Scale in preview but clamp
    } else { // Editor mode
        effectiveIconSizeRem = baseIconSizeRem * Math.max(0.7, Math.min(zoomLevel, 1.5));
    }

    const iconStyle = { fontSize: `${effectiveIconSizeRem}rem` };
    // The w-6 h-6 classes (or similar) might need to be dynamic or removed if fontSize dictates size fully.
    // For Material Symbols, fontSize often controls the visual size well.
    const iconClasses = `w-auto h-auto`; // Let fontSize control it.

    switch (item.decorType) {
        case 'plant':
            styleClasses = `${DECOR_RENDERER_STYLES.plantGradientLight} ${DECOR_RENDERER_STYLES.plantGradientDark} border ${DECOR_RENDERER_STYLES.plantBorderLight} ${DECOR_RENDERER_STYLES.plantBorderDark}`;
            content = <Icon name="potted_plant" className={`${iconClasses} ${DECOR_RENDERER_STYLES.plantIconColorLight} ${DECOR_RENDERER_STYLES.plantIconColorDark}`} style={iconStyle} />;
            break;
        case 'rug':
            styleClasses = `${DECOR_RENDERER_STYLES.rugGradientLight} ${DECOR_RENDERER_STYLES.rugGradientDark} border ${DECOR_RENDERER_STYLES.rugBorderLight} ${DECOR_RENDERER_STYLES.rugBorderDark}`;
            content = <Icon name="texture" className={`${iconClasses} opacity-70 ${DECOR_RENDERER_STYLES.rugIconColorLight} ${DECOR_RENDERER_STYLES.rugIconColorDark}`} style={iconStyle} />;
            break;
        default: // Generic decor
            styleClasses = `${DECOR_RENDERER_STYLES.defaultGradientLight} ${DECOR_RENDERER_STYLES.defaultGradientDark} border ${DECOR_RENDERER_STYLES.defaultBorderLight} ${DECOR_RENDERER_STYLES.defaultBorderDark}`;
            content = <Icon name="interests" className={`${iconClasses} ${DECOR_RENDERER_STYLES.defaultIconColorLight} ${DECOR_RENDERER_STYLES.defaultIconColorDark}`} style={iconStyle} />;
            break;
    }

    // The main item rotation is handled by PlacedItem.
    // This renderer displays the decor as if its frame is at 0 degrees.
    return (
        <div
            className={`w-full h-full flex items-center justify-center 
                        ${styleClasses} ${borderRadiusClass}
                        transition-colors duration-150 overflow-hidden`} // Added overflow-hidden
        // Title attribute is handled by the parent PlacedItem component.
        >
            {content}
        </div>
    );
};

export default DecorRenderer;