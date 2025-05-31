import React, { useMemo, useCallback, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
// eslint-disable-next-line
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
    dragging: "!cursor-grabbing opacity-60 shadow-2xl scale-105", // DND dragging style
    fixed: "!cursor-default",
    selectedLight: "ring-2 ring-rose-500 shadow-lg",
    selectedDark: "dark:ring-rose-400",
    // << NEW: Style for when item is the move candidate >>
    moveCandidateLight: "ring-2 ring-sky-500 dark:ring-sky-400 shadow-xl", // Example: different ring for move candidate
    eraserHoverLight: "hover:ring-2 hover:ring-red-500/70",
    eraserHoverDark: "dark:hover:ring-red-400/70",
};

const HANDLE_CLASSES = {
    base: "absolute rounded-full shadow-md transition-opacity duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100",
    bgLight: "bg-rose-500",
    bgDark: "dark:bg-rose-400",
    border: "border-2 border-white dark:border-neutral-800",
    resizeSize: "w-3 h-3 md:w-2.5 md:h-2.5",
    rotationSize: "w-7 h-7 md:w-6 md:h-6 p-1 md:p-0.5",
    rotationIconSize: "w-4 h-4",
    rotationIconColor: "text-white dark:text-neutral-900",
};

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
    const [{ isDragging: isResizeHandleDragging }, dragResizeRef, previewResizeRef] = useDrag(() => {
        return {
            type: ItemTypes.RESIZE_HANDLE,
            item: () => {
                const payload = {
                    type: ItemTypes.RESIZE_HANDLE,
                    itemId: item.id,
                    direction: direction,
                    originalItem: { ...item },
                };
                return payload;
            },
            collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
        };
    }, [item, ItemTypes, direction, isSelected]);

    useEffect(() => {
        previewResizeRef(getEmptyImage(), { captureDraggingState: true });
    }, [previewResizeRef]);

    const handleSize = HANDLE_CLASSES.resizeSize;
    const offset = `-translate-x-1/2 -translate-y-1/2`;
    let positionClasses = "";
    let cursorClass = "";

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
                ${isResizeHandleDragging ? '!opacity-100 ring-2 ring-white' : (isSelected ? 'opacity-100 group-hover:opacity-100' : 'opacity-0')}
                ${isSelected ? '!opacity-100' : ''}
            `}
            title={`Resize ${direction.toLowerCase()}`}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()} // Prevent PlacedItem's onTouchStart if handle is grabbed
            style={{ zIndex: 25 }}
        />
    );
};

const RotationHandle = ({ item, onUpdateItemProperty, isSelected }) => {
    const handleRotateClick = useCallback((e) => {
        e.stopPropagation();
        if (item && item.id && onUpdateItemProperty) {
            onUpdateItemProperty(item.id, { rotation: true });
        }
    }, [item, onUpdateItemProperty]);

    return (
        <button
            type="button"
            onClick={handleRotateClick}
            onTouchStart={(e) => { e.stopPropagation(); }} // Prevent PlacedItem's onTouchStart
            className={`
                ${HANDLE_CLASSES.base} ${HANDLE_CLASSES.rotationSize}
                ${HANDLE_CLASSES.bgLight} ${HANDLE_CLASSES.bgDark} ${HANDLE_CLASSES.border}
                flex items-center justify-center cursor-pointer
                -top-3 -right-3 transform translate-x-1/2 -translate-y-1/2
                ${isSelected ? '!opacity-100' : 'opacity-0'}
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
    moveCandidateItemId, // << NEW PROP
    minorCellSizeRem,
    ItemTypes,
    ITEM_CONFIGS,
    zoomLevel,
}) => {
    const effectiveDimensionsForDragPayload = useMemo(() => {
        return getEffectiveDimensionsUtil(item);
    }, [item]);

    const isThisTheMoveCandidate = item.id === moveCandidateItemId;

    const [{ isDragging: isItemBodyDragging }, dragItemBodyRef, previewBodyRef] = useDrag(() => { // Added previewBodyRef
        return {
            type: item.itemType,
            item: () => {
                const payload = {
                    ...item,
                    effW_minor: effectiveDimensionsForDragPayload.w,
                    effH_minor: effectiveDimensionsForDragPayload.h,
                };
                return payload;
            },
            // Prevents DND drag starting if:
            // - Eraser is active
            // - Item is fixed
            // - Item is currently the one selected for a click-move (to allow cell click for placement)
            //   This means user must *deselect* it first if they want to DND drag it again, or drag another unselected item.
            canDrag: () => !isEraserActive && !item.isFixed && !isThisTheMoveCandidate,
            collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
        };
    }, [item, ItemTypes, isEraserActive, isSelected, effectiveDimensionsForDragPayload, isThisTheMoveCandidate]); // Added isThisTheMoveCandidate

    useEffect(() => { // Attach empty drag preview for the item body
        previewBodyRef(getEmptyImage(), { captureDraggingState: true });
    }, [previewBodyRef]);


    const dynamicPositionAndSizeStyle = useMemo(() => {
        if (!item.gridPosition) return { display: 'none' };
        return {
            position: 'absolute',
            top: `${(item.gridPosition.rowStart - 1) * minorCellSizeRem}rem`,
            left: `${(item.gridPosition.colStart - 1) * minorCellSizeRem}rem`,
            width: `${item.w_minor * minorCellSizeRem}rem`,
            height: `${item.h_minor * minorCellSizeRem}rem`,
            zIndex: isItemBodyDragging ? 200 : (isSelected ? 20 : (isEraserActive && !item.isFixed ? 15 : 10)),
        };
    }, [item.gridPosition, item.w_minor, item.h_minor, minorCellSizeRem, isItemBodyDragging, isSelected, isEraserActive, item.isFixed]);

    const handleClick = useCallback((e) => {
        e.stopPropagation(); // Prevent click from reaching canvas if on item
        if (isEraserActive && !item.isFixed) {
            onEraseItemById(item.id);
        } else if (onSelectItem) {
            // If it's already the move candidate and selected, clicking again deselects it.
            // Otherwise, selects it (and sets as move candidate in LayoutEditor).
            onSelectItem(item.id);
        }
    }, [isEraserActive, item.id, item.isFixed, onEraseItemById, onSelectItem]);

    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSelectItem && !item.isFixed) onSelectItem(item.id); // Select on right click if not fixed
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
    } else if (isThisTheMoveCandidate) { // << HIGHLIGHT if it's the move candidate
        // This item is selected and is the current candidate for a click-move.
        // Use a distinct highlight or combine with `isSelected` style.
        // For now, let's assume `moveCandidate` highlight takes precedence if different.
        classList.push(PLACED_ITEM_CLASSES.moveCandidateLight, PLACED_ITEM_CLASSES.selectedDark, selectionRingOffsetClasses); // Example: Sky blue ring
    } else if (isSelected && !isEraserActive) {
        classList.push(PLACED_ITEM_CLASSES.selectedLight, PLACED_ITEM_CLASSES.selectedDark, selectionRingOffsetClasses);
    } else if (isEraserActive && !item.isFixed) {
        classList.push(PLACED_ITEM_CLASSES.eraserHoverLight, PLACED_ITEM_CLASSES.eraserHoverDark, selectionRingOffsetClasses);
    }
    const combinedClassName = classList.join(' ');

    const canResize = typeof itemConfig?.isResizable === 'function' ? itemConfig.isResizable(item) : itemConfig?.isResizable === true;
    const canRotate = itemConfig?.isRotatable === true;

    if (!item || !item.gridPosition || typeof item.w_minor !== 'number' || typeof item.h_minor !== 'number') {
        return null;
    }

    return (
        <motion.div
            ref={dragItemBodyRef}
            style={dynamicPositionAndSizeStyle}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            // onTouchStart should not stop propagation if we want parent (CanvasCell) to handle its events
            // However, if PlacedItem is the target of touch, it might be okay.
            // If it causes issues with CanvasCell's touch detection for other purposes, revisit.
            layout // Framer Motion layout prop
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: 1,
                scale: isItemBodyDragging ? 1.05 : 1,
            }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={combinedClassName}
            title={isEraserActive && !item.isFixed ? `Tap to erase ${itemConfig?.displayName || item.itemType}` :
                item.isFixed ? `${itemConfig?.displayName || item.itemType} (Fixed)` :
                    (isThisTheMoveCandidate ? `Click a cell to move ${itemConfig?.displayName || item.itemType}` : `Tap to select ${itemConfig?.displayName || item.itemType}`)
            }
            role="button"
            tabIndex={isEraserActive || item.isFixed ? -1 : 0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e); }}
            data-is-canvas-item="true"
        >
            <div className="w-full h-full relative">
                <SpecificItemRenderer
                    item={item}
                    itemRotation={item.rotation || 0}
                    onUpdateItemProperty={onUpdateItemProperty}
                    isSelected={isSelected || isThisTheMoveCandidate} // Renderer might use this for internal styles
                    zoomLevel={zoomLevel}
                />
            </div>

            {/* Show handles if selected OR if it's the move candidate, and not in eraser mode, and not fixed */}
            {(isSelected || isThisTheMoveCandidate) && !isEraserActive && !item.isFixed && (
                <>
                    {canResize && ['N', 'S', 'E', 'W'].map(dir => (
                        <ResizeHandle key={`${item.id}-rh-${dir}`} item={item} direction={dir} ItemTypes={ItemTypes} isSelected={isSelected || isThisTheMoveCandidate} />
                    ))}
                    {canRotate && (
                        <RotationHandle key={`${item.id}-roth`} item={item} onUpdateItemProperty={onUpdateItemProperty} isSelected={isSelected || isThisTheMoveCandidate} />
                    )}
                </>
            )}
        </motion.div>
    );
};

export default PlacedItem;