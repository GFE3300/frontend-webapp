import React from 'react';

// Localization (imported for consistency, though not used for strings in this component yet)
// import slRaw from '../../../utils/script_lines.js';
// const sl = slRaw.venueManagement.doorRenderer;

// Design Guideline Mappings (Copied from original, no changes here)
const DOOR_RENDERER_STYLES = {
    frameGradientLight: "bg-gradient-to-br from-amber-300 to-amber-400",
    frameGradientDark: "dark:from-amber-600 dark:to-amber-700",
    frameBorderLight: "border-amber-500",
    frameBorderDark: "dark:border-amber-500",
    panelGradientLight: "bg-gradient-to-br from-amber-200 to-amber-300",
    panelGradientDark: "dark:from-amber-500 dark:to-amber-600",
    panelBorderLight: "border-amber-400",
    panelBorderDark: "dark:border-amber-400",
    openTransform: "rotate(-75deg)", // Swing angle for left swing
    openTransformRight: "rotate(75deg)", // Swing angle for right swing
};
// --- End Design Guideline Variables ---

const DoorRenderer = ({ item, isPreviewMode = false }) => { // itemRotation prop removed, isPreviewMode added
    const borderRadiusClass = "rounded-sm"; // Standard border radius for door frame/panel

    // Determine panel width and height relative to the item's dimensions.
    // These are visual proportions for the door panel within the frame.
    // Assuming item.w_minor and item.h_minor represent the frame's dimensions.
    // A door panel is usually tall and thin.
    // If item.w_minor is the "thickness" of the wall it's in, and item.h_minor is its "length" along the wall.
    // The door panel itself would be a fraction of these.
    // The original had: panelWidth = "w-[8%]", panelHeight = "h-[70%]"
    // This needs to be dynamic based on whether the door is wider or taller.
    // For simplicity, let's assume the door frame itself is 1 minor unit thick (its smallest dimension)
    // and the panel is a percentage of its main length.

    // This logic assumes the door item's w_minor/h_minor are set appropriately
    // so that one of them represents the "thickness" of the door frame (e.g., 1 minor cell)
    // and the other represents the "width/length" of the door opening.
    // The panel itself is usually a fraction of the door's "width/length".

    // Let's refine panel dimensions based on aspect ratio if needed, or keep fixed %
    // The original CSS used fixed percentages which might be okay if door items are consistently sized.
    const panelWidthClass = "w-[8%]"; // Percentage of the frame's width
    const panelHeightClass = "h-[70%]"; // Percentage of the frame's height

    const swingArcBase = "absolute border-neutral-400/50 dark:border-neutral-600/50";
    let swingArcClasses = "";
    let panelPositionClasses = "top-1/2 -translate-y-1/2"; // Vertically centered
    let panelTransformOrigin = "";

    // Adjust based on swing direction relative to its own frame (0 degrees)
    if (item.swingDirection === 'left') {
        swingArcClasses = `${swingArcBase} w-1/2 h-full rounded-r-full border-l-0 border-t-0 border-b-0 border-dashed left-0`;
        panelPositionClasses += " left-[2px]"; // Small offset from the edge
        panelTransformOrigin = "left center";
    } else { // 'right'
        swingArcClasses = `${swingArcBase} w-1/2 h-full rounded-l-full border-r-0 border-t-0 border-b-0 border-dashed right-0`;
        panelPositionClasses += " right-[2px]"; // Small offset from the edge
        panelTransformOrigin = "right center";
    }

    // The main item rotation is handled by PlacedItem.
    // This renderer renders the door as if its frame is at 0 degrees.
    // The panel's transform is only for its open/closed swing.
    return (
        <div
            className={`w-full h-full relative overflow-hidden
                        ${DOOR_RENDERER_STYLES.frameGradientLight} ${DOOR_RENDERER_STYLES.frameGradientDark}
                        border ${DOOR_RENDERER_STYLES.frameBorderLight} ${DOOR_RENDERER_STYLES.frameBorderDark}
                        ${borderRadiusClass}
                        transition-colors duration-150`}
        // Title attribute is handled by the parent PlacedItem component.
        >
            {/* Subtle swing arc indication - always rendered relative to the non-rotated frame */}
            {item.isOpen && !isPreviewMode && <div className={swingArcClasses} style={{ top: '0', height: '100%' }} />}

            {/* Door Panel - its transform is for the swing */}
            <div
                className={`absolute 
                            ${panelWidthClass} ${panelHeightClass} ${panelPositionClasses}
                            ${DOOR_RENDERER_STYLES.panelGradientLight} ${DOOR_RENDERER_STYLES.panelGradientDark}
                            border ${DOOR_RENDERER_STYLES.panelBorderLight} ${DOOR_RENDERER_STYLES.panelBorderDark}
                            ${borderRadiusClass} shadow-md
                            transition-transform duration-300 ease-out`}
                style={{
                    transformOrigin: panelTransformOrigin,
                    transform: item.isOpen
                        ? (item.swingDirection === 'left' ? DOOR_RENDERER_STYLES.openTransform : DOOR_RENDERER_STYLES.openTransformRight)
                        : 'none',
                }}
            />
        </div>
    );
};

export default DoorRenderer;