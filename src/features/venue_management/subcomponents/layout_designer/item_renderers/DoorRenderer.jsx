import React from 'react';

// Design Guideline Mappings for Doors
const DOOR_RENDERER_STYLES = {
    frameGradientLight: "bg-gradient-to-br from-amber-300 to-amber-400", // "Wood" frame like color
    frameGradientDark: "dark:from-amber-600 dark:to-amber-700",
    frameBorderLight: "border-amber-500",
    frameBorderDark: "dark:border-amber-500",

    panelGradientLight: "bg-gradient-to-br from-amber-200 to-amber-300", // Slightly lighter panel
    panelGradientDark: "dark:from-amber-500 dark:to-amber-600",
    panelBorderLight: "border-amber-400",
    panelBorderDark: "dark:border-amber-400",

    openTransform: "rotate(-75deg)", // For left swing, visual indicator of open
    openTransformRight: "rotate(75deg)",
};

const DoorRenderer = ({ item }) => {
    // item: { id, shape, swingDirection ('left'/'right'), isOpen (boolean), rotation (handled by wrapper) }

    const borderRadiusClass = "rounded-sm";

    // Door panel style depends on its parent's (PlacedItem) rotation which is already applied.
    // We render the door as if it's in its base (0-degree) orientation.
    // The door panel itself will be thinner than the frame.
    const panelWidth = "w-[8%]"; // approx 8-10% of the cell for thickness
    const panelHeight = "h-[70%]"; // 70% of the cell height for the door panel

    // Swing arc and open state are visual cues
    const swingArcBase = "absolute border-neutral-400/50 dark:border-neutral-600/50";
    let swingArcClasses = "";
    let panelPositionClasses = "top-1/2 -translate-y-1/2"; // Centered vertically
    let transformOrigin = "";

    if (item.swingDirection === 'left') {
        swingArcClasses = `${swingArcBase} w-1/2 h-full rounded-r-full border-l-0 border-t-0 border-b-0 border-dashed left-0`;
        panelPositionClasses += " left-[2px]"; // Tiny offset from edge
        transformOrigin = "left center";
    } else { // right swing
        swingArcClasses = `${swingArcBase} w-1/2 h-full rounded-l-full border-r-0 border-t-0 border-b-0 border-dashed right-0`;
        panelPositionClasses += " right-[2px]";
        transformOrigin = "right center";
    }

    return (
        <div
            className={`w-full h-full relative overflow-hidden
                        ${DOOR_RENDERER_STYLES.frameGradientLight} ${DOOR_RENDERER_STYLES.frameGradientDark}
                        border ${DOOR_RENDERER_STYLES.frameBorderLight} ${DOOR_RENDERER_STYLES.frameBorderDark}
                        ${borderRadiusClass}
                        transition-colors duration-150`}
        // Title attribute handled by PlacedItem.jsx
        >
            {/* Subtle swing arc indication */}
            {item.isOpen && <div className={swingArcClasses} style={{ top: '0', height: '100%' }} />}

            {/* Door Panel */}
            <div
                className={`absolute 
                            ${panelWidth} ${panelHeight} ${panelPositionClasses}
                            ${DOOR_RENDERER_STYLES.panelGradientLight} ${DOOR_RENDERER_STYLES.panelGradientDark}
                            border ${DOOR_RENDERER_STYLES.panelBorderLight} ${DOOR_RENDERER_STYLES.panelBorderDark}
                            ${borderRadiusClass} shadow-md
                            transition-transform duration-300 ease-out`}
                style={{
                    transformOrigin: transformOrigin,
                    transform: item.isOpen
                        ? (item.swingDirection === 'left' ? DOOR_RENDERER_STYLES.openTransform : DOOR_RENDERER_STYLES.openTransformRight)
                        : 'none',
                }}
            />
        </div>
    );
};

export default DoorRenderer;