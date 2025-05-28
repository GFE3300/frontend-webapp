// features/venue_management/subcomponents/layout_designer/PlacedItem.jsx
import React, { useMemo, useCallback, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend'; // Still needed for ResizeHandle drag preview
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

// Item Renderers
import TableRenderer from './item_renderers/TableRenderer';
import WallRenderer from './item_renderers/WallRenderer';
import DoorRenderer from './item_renderers/DoorRenderer';
import DecorRenderer from './item_renderers/DecorRenderer';
import CounterRenderer from './item_renderers/CounterRenderer';

import { getEffectiveDimensions as getEffectiveDimensionsUtil } from '../../utils/layoutUtils';
import Icon from '../../../../components/common/Icon';

// --- Design Guideline Variables ---
const PLACED_ITEM_CLASSES = {
    base: "group absolute cursor-grab focus-visible:outline-none transform-gpu", // transform-gpu for better perf on transforms
    dragging: "!cursor-grabbing opacity-60 shadow-2xl scale-105",
    fixed: "!cursor-default",
    selectedLight: "ring-2 ring-rose-500 shadow-lg", // Base selection ring color
    selectedDark: "dark:ring-rose-400",             // Dark mode selection ring color
    // Ring offset color classes will be added directly below based on theme
    eraserHoverLight: "hover:ring-2 hover:ring-red-500/70",
    eraserHoverDark: "dark:hover:ring-red-400/70",
};

const HANDLE_CLASSES = {
    base: "absolute rounded-full shadow-md transition-opacity duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100",
    bgLight: "bg-rose-500",
    bgDark: "dark:bg-rose-400",
    border: "border-2 border-white dark:border-neutral-800", // Handle border should contrast with its own bg and canvas
    resizeSize: "w-2.5 h-2.5", // 10px
    rotationSize: "w-6 h-6 p-0.5", // 24px container for a 16px icon
    rotationIconSize: "w-4 h-4", // 16px icon
    rotationIconColor: "text-white dark:text-neutral-900", // Icon color for rotation handle
};
// --- End Design Guideline Variables ---

const DefaultItemRenderer = ({ item }) => (
    <div className="w-full h-full border border-dashed border-red-500 bg-red-100/50 flex flex-col items-center justify-center text-red-700 text-xxs p-0.5 text-center">
        <span>Renderer Missing</span>
        <span>Type: {item.itemType?.toString()}</span>
        <span>ID: {item.id?.substring(0, 5)}</span>
    </div>
);

const ResizeHandle = ({ item, direction, ItemTypes }) => {
    // isDragging renamed to avoid potential naming conflicts if this component were less isolated.
    const [{ isDragging: isResizeDragging }, dragResizeRef, previewResizeRef] = useDrag(() => ({
        type: ItemTypes.RESIZE_HANDLE,
        item: () => ({
            type: ItemTypes.RESIZE_HANDLE,
            itemId: item.id,
            direction: direction,
            originalItem: { ...item }, // Pass a snapshot of the item at drag start
        }),
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }));

    // Use an empty image as drag preview for handles
    useEffect(() => { previewResizeRef(getEmptyImage(), { captureDraggingState: true }); }, [previewResizeRef]);

    const handleSize = HANDLE_CLASSES.resizeSize;
    const offset = `-translate-x-1/2 -translate-y-1/2`; // For centering the handle on the edge

    let positionClasses = "";
    let cursorClass = "";

    // Determine position and cursor based on handle direction
    switch (direction) {
        case 'N': positionClasses = `top-0 left-1/2 ${offset}`; cursorClass = 'cursor-ns-resize'; break;
        case 'S': positionClasses = `bottom-0 left-1/2 ${offset} translate-y-full`; cursorClass = 'cursor-ns-resize'; break;
        case 'E': positionClasses = `top-1/2 right-0 ${offset} translate-x-full`; cursorClass = 'cursor-ew-resize'; break;
        case 'W': positionClasses = `top-1/2 left-0 ${offset}`; cursorClass = 'cursor-ew-resize'; break;
        default: break;
    }

    return (
        <div
            ref={dragResizeRef}
            className={`
                ${HANDLE_CLASSES.base} ${HANDLE_CLASSES.bgLight} ${HANDLE_CLASSES.bgDark}
                ${HANDLE_CLASSES.border} ${handleSize} ${positionClasses} ${cursorClass}
                ${isResizeDragging ? 'opacity-70' : ''}
            `}
            title={`Resize ${direction}`}
            onClick={(e) => e.stopPropagation()} // Prevent PlacedItem click when handle is clicked
            style={{ zIndex: 25 }} // Handles should be above the item content
        />
    );
};

const RotationHandle = ({ item, onUpdateItemProperty }) => {
    const handleRotateClick = useCallback((e) => {
        e.stopPropagation(); // Prevent PlacedItem click
        if (item && item.id && onUpdateItemProperty) {
            // Signal a 90-degree step rotation to the state management hook
            onUpdateItemProperty(item.id, { rotation: true });
        }
    }, [item, onUpdateItemProperty]);

    return (
        <button // Using a button element for better accessibility with click interactions
            type="button"
            onClick={handleRotateClick}
            className={`
                ${HANDLE_CLASSES.base} ${HANDLE_CLASSES.rotationSize}
                ${HANDLE_CLASSES.bgLight} ${HANDLE_CLASSES.bgDark} ${HANDLE_CLASSES.border}
                flex items-center justify-center cursor-pointer
                -top-2 -right-2 transform translate-x-1/2 -translate-y-1/2
            `} // Positioned off the top-right corner
            style={{ zIndex: 26 }} // Rotation handle typically above resize handles visually
            title="Rotate Item (90°)"
            aria-label="Rotate Item by 90 degrees"
        >
            <Icon name="rotate_right" className={`${HANDLE_CLASSES.rotationIconSize} ${HANDLE_CLASSES.rotationIconColor}`} style={{ fontSize: '1rem' }} />
        </button>
    );
};

const PlacedItem = ({
    item,
    isEraserActive,
    onEraseItemById,
    onUpdateItemProperty,
    onSelectItem,
    isSelected,
    minorCellSizeRem,
    ItemTypes, // Still needed for ResizeHandle and main item drag type
    ITEM_CONFIGS,
    zoomLevel, // Passed for potential internal use by renderers or handles
}) => {

    const effectiveDimensions = useMemo(() => getEffectiveDimensionsUtil(item), [item]);

    // isDragging renamed to avoid potential naming conflicts
    const [{ isDragging: isItemDragging }, dragItemBodyRef] = useDrag(() => ({
        type: item.itemType, // This is the PLACED_ITEM type (e.g., PLACED_TABLE)
        item: () => ({ ...item, effW_minor: effectiveDimensions.w, effH_minor: effectiveDimensions.h }), // Payload for drag
        canDrag: () => !isEraserActive && !item.isFixed,
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }), [item, isEraserActive, ItemTypes, effectiveDimensions]);

    const dynamicStyle = useMemo(() => ({
        position: 'absolute',
        top: `${(item.gridPosition.rowStart - 1) * minorCellSizeRem}rem`,
        left: `${(item.gridPosition.colStart - 1) * minorCellSizeRem}rem`,
        width: `${item.w_minor * minorCellSizeRem}rem`,
        height: `${item.h_minor * minorCellSizeRem}rem`,
        zIndex: isItemDragging ? 200 : (isSelected ? 15 : (isEraserActive && !item.isFixed ? 20 : 10)),
        transform: `rotate(${item.rotation || 0}deg)`,
        transformOrigin: 'center center', // Crucial for rotation on its own axis
    }), [item, minorCellSizeRem, isItemDragging, isSelected, isEraserActive]);

    const handleClick = useCallback((e) => {
        e.stopPropagation(); // Prevent event bubbling to canvas
        if (isEraserActive && !item.isFixed) {
            onEraseItemById(item.id);
        } else if (onSelectItem) {
            onSelectItem(item.id);
        }
    }, [isEraserActive, item.id, item.isFixed, onEraseItemById, onSelectItem]);

    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        // Placeholder for custom context menu; for now, just selects the item
        if (onSelectItem) onSelectItem(item.id);
        // console.log("Context menu for item:", item.id); // Optional: for debugging
    }, [item.id, onSelectItem]);

    const itemConfig = ITEM_CONFIGS[item.itemType];
    let SpecificItemRenderer = DefaultItemRenderer; // Fallback renderer
    const rendererKey = itemConfig?.PlacedComponent;

    // Dispatch to the correct renderer based on item configuration
    switch (rendererKey) {
        case 'TableRenderer': SpecificItemRenderer = TableRenderer; break;
        case 'WallRenderer': SpecificItemRenderer = WallRenderer; break;
        case 'DoorRenderer': SpecificItemRenderer = DoorRenderer; break;
        case 'DecorRenderer': SpecificItemRenderer = DecorRenderer; break;
        case 'CounterRenderer': SpecificItemRenderer = CounterRenderer; break;
        // default: SpecificItemRenderer remains DefaultItemRenderer
    }

    // Base classes for the PlacedItem
    let combinedClassName = `${PLACED_ITEM_CLASSES.base} ${item.isFixed ? PLACED_ITEM_CLASSES.fixed : ''}`;

    // Standard Tailwind classes for ring offset based on assumed canvas background colors
    // (white in light mode, neutral-800 in dark mode for the grid background where items are placed)
    const selectionRingOffsetClasses = "ring-offset-1 ring-offset-white dark:ring-offset-neutral-800";

    if (isItemDragging) {
        combinedClassName += ` ${PLACED_ITEM_CLASSES.dragging}`;
    } else if (isSelected && !isEraserActive) {
        combinedClassName += ` ${PLACED_ITEM_CLASSES.selectedLight} ${PLACED_ITEM_CLASSES.selectedDark} ${selectionRingOffsetClasses}`;
    } else if (isEraserActive && !item.isFixed) {
        combinedClassName += ` ${PLACED_ITEM_CLASSES.eraserHoverLight} ${PLACED_ITEM_CLASSES.eraserHoverDark} ${selectionRingOffsetClasses}`;
    }

    const canResize = typeof itemConfig?.isResizable === 'function' ? itemConfig.isResizable(item) : itemConfig?.isResizable === true;
    const canRotate = itemConfig?.isRotatable === true;

    // Safeguard for invalid item data to prevent rendering errors
    if (!item || !item.gridPosition || typeof item.w_minor !== 'number' || typeof item.h_minor !== 'number') {
        console.warn("PlacedItem: Invalid item data received. Rendering null.", item);
        return null;
    }

    return (
        <motion.div
            ref={dragItemBodyRef} // Ref for dragging the item body
            style={dynamicStyle}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            layout // Framer Motion prop to animate layout changes (position, size)
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }} // Animation physics
            className={combinedClassName}
            title={isEraserActive && !item.isFixed ? `Click to erase ${itemConfig?.displayName || item.itemType}` :
                item.isFixed ? `${itemConfig?.displayName || item.itemType} (Fixed)` :
                    `Drag to move, Click to select ${itemConfig?.displayName || item.itemType}`
            }
            role="button" // Semantically a button as it's clickable
            tabIndex={isEraserActive || item.isFixed ? -1 : 0} // Focusable if interactive
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e); }} // Keyboard activation
        >
            <SpecificItemRenderer
                item={item}
                onUpdateItemProperty={onUpdateItemProperty} // Pass down for in-renderer edits (e.g., TableNumber)
                isSelected={isSelected}
                zoomLevel={zoomLevel} // Pass zoom for potential use in specific item renderers
            />
            {/* Handles are only shown if the item is selected, not fixed, and eraser is not active */}
            {isSelected && !isEraserActive && !item.isFixed && (
                <>
                    {canResize && ['N', 'S', 'E', 'W'].map(dir => (
                        <ResizeHandle key={`${item.id}-rh-${dir}`} item={item} direction={dir} ItemTypes={ItemTypes} />
                    ))}
                    {canRotate && (
                        <RotationHandle key={`${item.id}-roth`} item={item} onUpdateItemProperty={onUpdateItemProperty} />
                    )}
                </>
            )}
        </motion.div>
    );
};

export default PlacedItem;