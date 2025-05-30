import React from 'react';

// Design Guideline Mappings for Walls
const WALL_RENDERER_STYLES = {
    gradientLight: "bg-gradient-to-br from-neutral-300 to-neutral-400",
    gradientDark: "dark:from-neutral-600 dark:to-neutral-700",
    borderLight: "border-neutral-500",
    borderDark: "dark:border-neutral-500", // Corrected to match typical dark mode border
};

const WallRenderer = ({ item, itemRotation }) => { // item prop might be unused if no item-specific styling
    const borderRadiusClass = "rounded-sm"; // Or "rounded-none" if walls should be sharp

    return (
        <div
            className={`w-full h-full 
                        ${WALL_RENDERER_STYLES.gradientLight} ${WALL_RENDERER_STYLES.gradientDark}
                        border ${WALL_RENDERER_STYLES.borderLight} ${WALL_RENDERER_STYLES.borderDark}
                        ${borderRadiusClass}
                        transition-colors duration-150`}
        >
            {/* No text or icons for maximum minimalism */}
        </div>
    );
};

export default WallRenderer;