import React from 'react';

// Localization (imported for consistency, though not used for strings in this component)
// import slRaw from '../../../utils/script_lines.js'; 
// const sl = slRaw.venueManagement.wallRenderer; // If strings were ever needed

// Design Guideline Mappings (Copied from original, no changes here)
const WALL_RENDERER_STYLES = {
    gradientLight: "bg-gradient-to-br from-neutral-300 to-neutral-400",
    gradientDark: "dark:from-neutral-600 dark:to-neutral-700",
    borderLight: "border-neutral-500",
    borderDark: "dark:border-neutral-500",
};
// --- End Design Guideline Variables ---

const WallRenderer = ({ item, isPreviewMode = false }) => { // item prop might be unused if no item-specific styling, added isPreviewMode for consistency
    const borderRadiusClass = "rounded-sm";

    // The itemRotation prop is no longer passed as PlacedItem handles the rotation of its wrapper.
    // This renderer displays the wall as if it's at 0 degrees.

    return (
        <div
            className={`w-full h-full 
                        ${WALL_RENDERER_STYLES.gradientLight} ${WALL_RENDERER_STYLES.gradientDark}
                        border ${WALL_RENDERER_STYLES.borderLight} ${WALL_RENDERER_STYLES.borderDark}
                        ${borderRadiusClass}
                        transition-colors duration-150`}
            // Title attribute is handled by the parent PlacedItem component.
            // No direct text or complex ARIA attributes specific to the wall's content are needed here.
        >
            {/* No text or icons for maximum minimalism */}
        </div>
    );
};

export default WallRenderer;