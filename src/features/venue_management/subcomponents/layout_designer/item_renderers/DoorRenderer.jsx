import React from 'react';

// Design Guideline Mappings for Doors
const DOOR_RENDERER_STYLES = {
    frameGradientLight: "bg-gradient-to-br from-amber-300 to-amber-400",
    frameGradientDark: "dark:from-amber-600 dark:to-amber-700",
    frameBorderLight: "border-amber-500",
    frameBorderDark: "dark:border-amber-500",
    panelGradientLight: "bg-gradient-to-br from-amber-200 to-amber-300",
    panelGradientDark: "dark:from-amber-500 dark:to-amber-600",
    panelBorderLight: "border-amber-400",
    panelBorderDark: "dark:border-amber-400",
    openTransform: "rotate(-75deg)",
    openTransformRight: "rotate(75deg)",
};

const DoorRenderer = ({ item, itemRotation }) => { // Added itemRotation
    const borderRadiusClass = "rounded-sm";
    const panelWidth = "w-[8%]";
    const panelHeight = "h-[70%]";

    const swingArcBase = "absolute border-neutral-400/50 dark:border-neutral-600/50";
    let swingArcClasses = "";
    let panelPositionClasses = "top-1/2 -translate-y-1/2";
    let panelTransformOrigin = ""; // Renamed from transformOrigin to avoid conflict

    if (item.swingDirection === 'left') {
        swingArcClasses = `${swingArcBase} w-1/2 h-full rounded-r-full border-l-0 border-t-0 border-b-0 border-dashed left-0`;
        panelPositionClasses += " left-[2px]";
        panelTransformOrigin = "left center";
    } else {
        swingArcClasses = `${swingArcBase} w-1/2 h-full rounded-l-full border-r-0 border-t-0 border-b-0 border-dashed right-0`;
        panelPositionClasses += " right-[2px]";
        panelTransformOrigin = "right center";
    }

    // The door's internal swing transform needs to be combined with the item's overall rotation
    const combinedTransform = `rotate(${itemRotation}deg) ${item.isOpen ? (item.swingDirection === 'left' ? DOOR_RENDERER_STYLES.openTransform : DOOR_RENDERER_STYLES.openTransformRight) : ''}`;
    // If rotating the entire door item, the panel itself doesn't need to be counter-rotated usually,
    // as its swing is relative to the door frame's orientation.

    return (
        <div // This is the main container that PlacedItem positions. It should NOT have the itemRotation here.
            className={`w-full h-full relative overflow-hidden
                        ${DOOR_RENDERER_STYLES.frameGradientLight} ${DOOR_RENDERER_STYLES.frameGradientDark}
                        border ${DOOR_RENDERER_STYLES.frameBorderLight} ${DOOR_RENDERER_STYLES.frameBorderDark}
                        ${borderRadiusClass}
                        transition-colors duration-150`}
            style={{ transform: `rotate(${itemRotation}deg)`, transformOrigin: 'center center' }} // Apply itemRotation to the whole door frame
        >
            {/* Subtle swing arc indication - its position is relative to the rotated frame */}
            {item.isOpen && <div className={swingArcClasses} style={{ top: '0', height: '100%' }} />}

            {/* Door Panel - its transform is for the swing, relative to the (already rotated) frame */}
            <div
                className={`absolute 
                            ${panelWidth} ${panelHeight} ${panelPositionClasses}
                            ${DOOR_RENDERER_STYLES.panelGradientLight} ${DOOR_RENDERER_STYLES.panelGradientDark}
                            border ${DOOR_RENDERER_STYLES.panelBorderLight} ${DOOR_RENDERER_STYLES.panelBorderDark}
                            ${borderRadiusClass} shadow-md
                            transition-transform duration-300 ease-out`}
                style={{
                    transformOrigin: panelTransformOrigin, // For the swing
                    transform: item.isOpen // Only apply swing transform
                        ? (item.swingDirection === 'left' ? DOOR_RENDERER_STYLES.openTransform : DOOR_RENDERER_STYLES.openTransformRight)
                        : 'none',
                }}
            />
        </div>
    );
};

export default DoorRenderer;