// features/venue_management/subcomponents/layout_designer/PlacedItem.jsx
import React, { useMemo, useCallback, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend'; // For custom drag preview (hiding default)
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

// Item Renderers
import TableRenderer from './item_renderers/TableRenderer';
import WallRenderer from './item_renderers/WallRenderer';
import DoorRenderer from './item_renderers/DoorRenderer';
import DecorRenderer from './item_renderers/DecorRenderer';
import CounterRenderer from './item_renderers/CounterRenderer';

// Utilities
import { getEffectiveDimensions as getEffectiveDimensionsUtil } from '../../utils/layoutUtils';
import Icon from '../../../../components/common/Icon';

// Design Guideline Variables
const PLACED_ITEM_CLASSES = {
    base: "group absolute cursor-grab focus-visible:outline-none",
    dragging: "!cursor-grabbing opacity-60 shadow-2xl scale-105", // Added scale for dragging emphasis
    fixed: "!cursor-default",
    selectedLight: "ring-2 ring-rose-500 shadow-lg",
    selectedDark: "dark:ring-rose-400",
    eraserHoverLight: "hover:ring-2 hover:ring-red-500/70", // For mouse hover when eraser is active
    eraserHoverDark: "dark:hover:ring-red-400/70",
    // For touch, eraser interaction is usually via direct tap on item, not hover.
};

const HANDLE_CLASSES = {
    base: "absolute rounded-full shadow-md transition-opacity duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100",
    // For touch, consider making handles always visible when item is selected, or larger.
    // This can be done by adding a class when isSelected and isTouchDevice (hypothetical prop).
    bgLight: "bg-rose-500",
    bgDark: "dark:bg-rose-400",
    border: "border-2 border-white dark:border-neutral-800",
    // Ensure these are large enough for touch. Current are 10px visual, maybe 12-16px physical hit area needed.
    resizeSize: "w-3 h-3 md:w-2.5 md:h-2.5", // Slightly larger default, can be overridden by responsive if needed.
    rotationSize: "w-7 h-7 md:w-6 md:h-6 p-1 md:p-0.5", // Larger for easier touch
    rotationIconSize: "w-4 h-4",
    rotationIconColor: "text-white dark:text-neutral-900",
};

// Default renderer if a specific one isn't found
const DefaultItemRenderer = ({ item, itemRotation }) => (
    <div
        className="w-full h-full border border-dashed border-red-500 bg-red-100/50 flex flex-col items-center justify-center text-red-700 text-xxs p-0.5 text-center"
        style={{ transform: `rotate(${itemRotation}deg)`, transformOrigin: 'center center' }}
    >
        <span>Renderer Missing</span>
        <span>Type: {item.itemType?.toString()}</span>
        <span>ID: {item.id?.substring(0, 5)}</span>
    </div>
);

const ResizeHandle = ({ item, direction, ItemTypes, isSelected }) => {
    const [{ isDragging: isResizeHandleDragging }, dragResizeRef, previewResizeRef] = useDrag(() => ({
        type: ItemTypes.RESIZE_HANDLE,
        item: () => ({ // This is the payload for when the handle is dropped onto EditorCanvas
            type: ItemTypes.RESIZE_HANDLE, // Explicitly set type for the payload
            itemId: item.id,
            direction: direction,
            originalItem: { ...item }, // Snapshot of item at drag start
        }),
        // canDrag: () => isSelected && !item.isFixed, // Only draggable if selected and not fixed
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }));

    // Use getEmptyImage to hide the browser's default drag preview for the handle
    useEffect(() => {
        previewResizeRef(getEmptyImage(), { captureDraggingState: true });
    }, [previewResizeRef]);

    const handleSize = HANDLE_CLASSES.resizeSize;
    // Center the handle visually and for interaction. Translate by half its size.
    const offset = `-translate-x-1/2 -translate-y-1/2`;

    let positionClasses = "";
    let cursorClass = "";

    switch (direction) {
        case 'N': positionClasses = `top-0 left-1/2 ${offset}`; cursorClass = 'cursor-ns-resize'; break;
        case 'S': positionClasses = `bottom-0 left-1/2 ${offset} translate-y-full`; cursorClass = 'cursor-ns-resize'; break; // Adjusted for bottom edge
        case 'E': positionClasses = `top-1/2 right-0 ${offset} translate-x-full`; cursorClass = 'cursor-ew-resize'; break; // Adjusted for right edge
        case 'W': positionClasses = `top-1/2 left-0 ${offset}`; cursorClass = 'cursor-ew-resize'; break;
        default: break;
    }

    return (
        <div
            ref={dragResizeRef}
            className={`
                ${HANDLE_CLASSES.base} ${HANDLE_CLASSES.bgLight} ${HANDLE_CLASSES.bgDark}
                ${HANDLE_CLASSES.border} ${handleSize} ${positionClasses} ${cursorClass}
                ${isResizeHandleDragging ? '!opacity-100 ring-2 ring-white' : (isSelected ? 'opacity-100 group-hover:opacity-100' : 'opacity-0')} 
                ${isSelected ? '!opacity-100' : ''} {/* Always show if selected */}
            `}
            title={`Resize ${direction.toLowerCase()}`}
            onClick={(e) => e.stopPropagation()} // Prevent click from deselecting item
            onTouchStart={(e) => e.stopPropagation()} // Allow touch drag of handle without deselecting
            style={{ zIndex: 25 }}
        />
    );
};

const RotationHandle = ({ item, onUpdateItemProperty, isSelected }) => {
    const handleRotateClick = useCallback((e) => {
        e.stopPropagation();
        if (item && item.id && onUpdateItemProperty) {
            onUpdateItemProperty(item.id, { rotation: true }); // true signals a 90-degree step
        }
    }, [item, onUpdateItemProperty]);

    return (
        <button
            type="button"
            onClick={handleRotateClick}
            onTouchStart={(e) => { e.stopPropagation(); /* Allow button interaction on touch */ }}
            className={`
                ${HANDLE_CLASSES.base} ${HANDLE_CLASSES.rotationSize}
                ${HANDLE_CLASSES.bgLight} ${HANDLE_CLASSES.bgDark} ${HANDLE_CLASSES.border}
                flex items-center justify-center cursor-pointer
                -top-3 -right-3 transform translate-x-1/2 -translate-y-1/2 
                ${isSelected ? '!opacity-100' : 'opacity-0'} /* Always show if selected */
            `}
            style={{ zIndex: 26 }}
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
    ItemTypes,
    ITEM_CONFIGS,
    zoomLevel,
}) => {
    // The item's w_minor and h_minor should represent its AABB dimensions.
    // getEffectiveDimensionsUtil might be redundant here if item.w_minor/h_minor are already AABB.
    // Assuming item.w_minor and item.h_minor are the base dimensions before rotation.
    const effectiveDimensionsForDragPayload = useMemo(() => getEffectiveDimensionsUtil(item), [item]);

    const [{ isDragging: isItemBodyDragging }, dragItemBodyRef] = useDrag(() => ({
        type: item.itemType, // e.g., ItemTypes.PLACED_TABLE
        item: () => ({
            ...item,
            // Pass the AABB dimensions for the drop handler in CanvasCell to use for placement checks
            effW_minor: effectiveDimensionsForDragPayload.w,
            effH_minor: effectiveDimensionsForDragPayload.h,
        }),
        canDrag: () => !isEraserActive && !item.isFixed && !isSelected, // Prevent dragging selected items to avoid conflict with handles
        // Or, allow dragging selected items but ensure handles are part of the drag target
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
        // Optional: end drag logic if needed (e.g., to clear a custom preview)
    }));

    // For default preview behavior from react-dnd-html5-backend and react-dnd-touch-backend,
    // just applying dragItemBodyRef is usually enough.
    // itemBodyPreviewRef(getEmptyImage()) would hide the default preview if you used a custom DragLayer.

    const dynamicPositionAndSizeStyle = useMemo(() => {
        if (!item.gridPosition) return { display: 'none' }; // Should not happen with valid items
        return {
            position: 'absolute',
            top: `${(item.gridPosition.rowStart - 1) * minorCellSizeRem}rem`,
            left: `${(item.gridPosition.colStart - 1) * minorCellSizeRem}rem`,
            // The motion.div itself will be sized to the item's base (pre-rotation) dimensions.
            // The internal renderer handles the visual rotation within this box.
            width: `${item.w_minor * minorCellSizeRem}rem`,
            height: `${item.h_minor * minorCellSizeRem}rem`,
            zIndex: isItemBodyDragging ? 200 : (isSelected ? 20 : (isEraserActive && !item.isFixed ? 15 : 10)),
        };
    }, [item.gridPosition, item.w_minor, item.h_minor, minorCellSizeRem, isItemBodyDragging, isSelected, isEraserActive]);

    const handleClick = useCallback((e) => {
        e.stopPropagation(); // Important to prevent canvas click if item is clicked
        if (isEraserActive && !item.isFixed) {
            onEraseItemById(item.id);
        } else if (onSelectItem) {
            onSelectItem(item.id);
        }
    }, [isEraserActive, item.id, item.isFixed, onEraseItemById, onSelectItem]);

    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSelectItem && !item.isFixed) onSelectItem(item.id); // Select on context menu
    }, [item.id, item.isFixed, onSelectItem]);

    const itemConfig = ITEM_CONFIGS[item.itemType];
    let SpecificItemRenderer = DefaultItemRenderer;
    const rendererKey = itemConfig?.PlacedComponent;

    switch (rendererKey) {
        case 'TableRenderer': SpecificItemRenderer = TableRenderer; break;
        case 'WallRenderer': SpecificItemRenderer = WallRenderer; break;
        case 'DoorRenderer': SpecificItemRenderer = DoorRenderer; break;
        case 'DecorRenderer': SpecificItemRenderer = DecorRenderer; break;
        case 'CounterRenderer': SpecificItemRenderer = CounterRenderer; break;
        default: SpecificItemRenderer = DefaultItemRenderer;
    }

    const classList = [PLACED_ITEM_CLASSES.base];
    if (item.isFixed) classList.push(PLACED_ITEM_CLASSES.fixed);

    const selectionRingOffsetClasses = "ring-offset-1 ring-offset-white dark:ring-offset-neutral-800";

    if (isItemBodyDragging) {
        classList.push(PLACED_ITEM_CLASSES.dragging);
    } else if (isSelected && !isEraserActive) {
        classList.push(PLACED_ITEM_CLASSES.selectedLight, PLACED_ITEM_CLASSES.selectedDark, selectionRingOffsetClasses);
    } else if (isEraserActive && !item.isFixed) {
        // For touch, eraser "hover" isn't a thing. Interaction is direct tap.
        // These classes are mainly for mouse hover visual feedback.
        classList.push(PLACED_ITEM_CLASSES.eraserHoverLight, PLACED_ITEM_CLASSES.eraserHoverDark, selectionRingOffsetClasses);
    }
    const combinedClassName = classList.join(' ');

    const canResize = typeof itemConfig?.isResizable === 'function' ? itemConfig.isResizable(item) : itemConfig?.isResizable === true;
    const canRotate = itemConfig?.isRotatable === true;

    if (!item || !item.gridPosition || typeof item.w_minor !== 'number' || typeof item.h_minor !== 'number') {
        console.warn("PlacedItem: Invalid item data received.", item);
        return null;
    }

    return (
        <motion.div
            ref={dragItemBodyRef} // Apply drag ref to the main item body
            style={dynamicPositionAndSizeStyle}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            layout // Framer Motion layout animation
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: 1,
                scale: isItemBodyDragging ? 1.05 : 1,
                // Item rotation is now handled by the SpecificItemRenderer internally
                // to ensure handles are not rotated with the item's visual content.
            }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={combinedClassName}
            title={isEraserActive && !item.isFixed ? `Tap to erase ${itemConfig?.displayName || item.itemType}` :
                item.isFixed ? `${itemConfig?.displayName || item.itemType} (Fixed)` :
                    `Drag to move, Tap to select ${itemConfig?.displayName || item.itemType}`
            }
            role="button" // Makes it behave more like an interactive element
            tabIndex={isEraserActive || item.isFixed ? -1 : 0} // Focusable if interactive
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e); }}
        >
            {/* The SpecificItemRenderer receives the item and its rotation. It's responsible for applying the visual rotation to its content. */}
            <div className="w-full h-full relative"> {/* Inner container for renderer to manage its own rotation */}
                <SpecificItemRenderer
                    item={item}
                    itemRotation={item.rotation || 0}
                    onUpdateItemProperty={onUpdateItemProperty}
                    isSelected={isSelected}
                    zoomLevel={zoomLevel}
                />
            </div>

            {/* Handles are positioned relative to this motion.div and are NOT affected by the item's visual rotation */}
            {isSelected && !isEraserActive && !item.isFixed && (
                <>
                    {canResize && ['N', 'S', 'E', 'W'].map(dir => (
                        <ResizeHandle key={`${item.id}-rh-${dir}`} item={item} direction={dir} ItemTypes={ItemTypes} isSelected={isSelected} />
                    ))}
                    {canRotate && (
                        <RotationHandle key={`${item.id}-roth`} item={item} onUpdateItemProperty={onUpdateItemProperty} isSelected={isSelected} />
                    )}
                </>
            )}
        </motion.div>
    );
};

export default PlacedItem;