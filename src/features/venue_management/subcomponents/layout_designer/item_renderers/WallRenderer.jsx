import React from 'react';

// Design Guideline Mappings for Walls
const WALL_RENDERER_STYLES = {
    gradientLight: "bg-gradient-to-br from-neutral-300 to-neutral-400", // Lighter grey
    gradientDark: "dark:from-neutral-600 dark:to-neutral-700",
    borderLight: "border-neutral-500",
    borderDark: "dark:border-neutral-500", // Can be same or slightly lighter than fill for dark
};

const WallRenderer = ({ item }) => {
    // Walls are primarily visual representations of boundaries.
    // The effective dimensions and rotation are handled by the PlacedItem wrapper.
    // A subtle rounded corner can soften the look.
    const borderRadiusClass = "rounded-sm"; // Subtle rounding

    return (
        <div
            className={`w-full h-full 
                        ${WALL_RENDERER_STYLES.gradientLight} ${WALL_RENDERER_STYLES.gradientDark}
                        border ${WALL_RENDERER_STYLES.borderLight} ${WALL_RENDERER_STYLES.borderDark}
                        ${borderRadiusClass}
                        transition-colors duration-150`}
        // Title attribute is handled by PlacedItem.jsx
        >
            {/* No text or icons for maximum minimalism */}
        </div>
    );
};

export default WallRenderer;