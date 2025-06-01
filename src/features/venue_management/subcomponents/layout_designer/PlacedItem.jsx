import React, { useMemo, useCallback, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
// eslint-disable-next-line
import { motion } from 'framer-motion';

import TableRenderer from './item_renderers/TableRenderer';
import WallRenderer from './item_renderers/WallRenderer';
import DoorRenderer from './item_renderers/DoorRenderer';
import DecorRenderer from './item_renderers/DecorRenderer';
import CounterRenderer from './item_renderers/CounterRenderer';
import { getEffectiveDimensions as getEffectiveDimensionsUtil } from '../../utils/layoutUtils';
import Icon from '../../../../components/common/Icon';

// Localization
import slRaw, { interpolate } from '../../utils/script_lines.js';
const sl = slRaw.venueManagement.placedItem;
const slResize = slRaw.venueManagement.resizeHandle;
const slRotate = slRaw.venueManagement.rotationHandle;
// ITEM_CONFIGS is used for item.displayName, which should ideally be localized if ITEM_CONFIGS itself is not.
// For now, assuming ITEM_CONFIGS.displayName is the source of truth for item names.

// Design Guideline Variables (Copied from original, no changes here)
const PLACED_ITEM_CLASSES = {
    base: "group absolute cursor-grab focus-visible:outline-none",
    dragging: "!cursor-grabbing opacity-60 shadow-2xl scale-105",
    fixed: "!cursor-default",
    selectedLight: "ring-2 ring-rose-500 shadow-lg",
    selectedDark: "dark:ring-rose-400",
    moveCandidateLight: "ring-2 ring-sky-500 dark:ring-sky-400 shadow-xl",
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
// --- End Design Guideline Variables ---

const DefaultItemRenderer = ({ item }) => (
    <div
        className="w-full h-full border border-dashed border-red-500 bg-red-100/50 flex flex-col items-center justify-center text-red-700 text-xxs p-0.5 text-center"
    // itemRotation is applied by the parent div, so not needed here directly
    >
        <span>{sl.defaultRendererMissingText || "Renderer Missing"}</span>
        <span>
            {interpolate(sl.defaultRendererTypeLabel || "Type: {itemType}", { itemType: item.itemType?.toString() || 'Unknown' })}
        </span>
        <span>
            {interpolate(sl.defaultRendererIdLabel || "ID: {itemId}", { itemId: item.id?.substring(0, 5) || 'N/A' })}
        </span>
    </div>
);

const ResizeHandle = ({ item, direction, ItemTypes, isSelected }) => {
    const [{ isDragging: isResizeHandleDragging }, dragResizeRef, previewResizeRef] = useDrag(() => ({
        type: ItemTypes.RESIZE_HANDLE,
        item: () => ({
            type: ItemTypes.RESIZE_HANDLE,
            itemId: item.id,
            direction: direction,
            originalItem: { ...item },
        }),
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }), [item, ItemTypes, direction, isSelected]);

    useEffect(() => {
        previewResizeRef(getEmptyImage(), { captureDraggingState: true });
    }, [previewResizeRef]);

    const handleSize = HANDLE_CLASSES.resizeSize;
    const offset = `-translate-x-1/2 -translate-y-1/2`;
    let positionClasses = "";
    let cursorClass = "";
    let directionName = direction;

    switch (direction) {
        case 'N': positionClasses = `top-0 left-1/2 ${offset}`; cursorClass = 'cursor-ns-resize'; directionName = slResize.directionN || "North"; break;
        case 'S': positionClasses = `bottom-0 left-1/2 ${offset} translate-y-full`; cursorClass = 'cursor-ns-resize'; directionName = slResize.directionS || "South"; break;
        case 'E': positionClasses = `top-1/2 right-0 ${offset} translate-x-full`; cursorClass = 'cursor-ew-resize'; directionName = slResize.directionE || "East"; break;
        case 'W': positionClasses = `top-1/2 left-0 ${offset}`; cursorClass = 'cursor-ew-resize'; directionName = slResize.directionW || "West"; break;
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
            title={interpolate(slResize.tooltipPrefix || "Resize {direction}", { direction: directionName.toLowerCase() })}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
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
            onTouchStart={(e) => { e.stopPropagation(); }}
            className={`
                ${HANDLE_CLASSES.base} ${HANDLE_CLASSES.rotationSize}
                ${HANDLE_CLASSES.bgLight} ${HANDLE_CLASSES.bgDark} ${HANDLE_CLASSES.border}
                flex items-center justify-center cursor-pointer
                -top-3 -right-3 transform translate-x-1/2 -translate-y-1/2
                ${isSelected ? '!opacity-100' : 'opacity-0'}
            `}
            style={{ zIndex: 26 }}
            title={slRotate.tooltip || "Rotate Item (90°)"}
            aria-label={slRotate.ariaLabel || "Rotate Item by 90 degrees"}
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
    moveCandidateItemId,
    minorCellSizeRem,
    ItemTypes, // Pass ItemTypes for ResizeHandle
    ITEM_CONFIGS, // Pass ITEM_CONFIGS for renderers and name lookup
    zoomLevel,
}) => {
    const effectiveDimensionsForDragPayload = useMemo(() => getEffectiveDimensionsUtil(item), [item]);
    const isThisTheMoveCandidate = item.id === moveCandidateItemId;

    const [{ isDragging: isItemBodyDragging }, dragItemBodyRef, previewBodyRef] = useDrag(() => ({
        type: item.itemType,
        item: () => ({
            ...item,
            effW_minor: effectiveDimensionsForDragPayload.w,
            effH_minor: effectiveDimensionsForDragPayload.h,
        }),
        canDrag: () => !isEraserActive && !item.isFixed && !isThisTheMoveCandidate,
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }), [item, ItemTypes, isEraserActive, isSelected, effectiveDimensionsForDragPayload, isThisTheMoveCandidate]);

    useEffect(() => {
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
        e.stopPropagation();
        if (isEraserActive && !item.isFixed) {
            onEraseItemById(item.id);
        } else if (onSelectItem) {
            onSelectItem(item.id);
        }
    }, [isEraserActive, item.id, item.isFixed, onEraseItemById, onSelectItem]);

    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSelectItem && !item.isFixed) onSelectItem(item.id);
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
    } else if (isThisTheMoveCandidate) {
        classList.push(PLACED_ITEM_CLASSES.moveCandidateLight, PLACED_ITEM_CLASSES.selectedDark, selectionRingOffsetClasses);
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

    // Construct dynamic title
    const itemName = itemConfig?.displayName || item.itemType;
    let dynamicTitle = interpolate(sl.itemBaseTitle || "{itemName}", { itemName });
    if (item.isFixed) dynamicTitle += ` ${sl.itemFixedSuffix || "(Fixed)"}`;

    if (isEraserActive && !item.isFixed) {
        dynamicTitle = interpolate(sl.itemEraserActionText || "Tap to erase {itemName}", { itemName });
    } else if (item.isFixed) {
        // Already handled above
    } else if (isThisTheMoveCandidate) {
        dynamicTitle = interpolate(sl.itemMoveCandidateSuffix || "Click a cell to move {itemName}", { itemName });
    } else if (item.itemType === ItemTypes.PLACED_TABLE && item.isProvisional) {
        dynamicTitle = `${itemName} ${sl.itemProvisionalSuffix || "(Provisional - Click in Editor to set number)"}`;
    } else {
        dynamicTitle = interpolate(sl.itemSelectActionText || "Tap to select {itemName}", { itemName });
    }


    return (
        <motion.div
            ref={dragItemBodyRef}
            style={{ ...dynamicPositionAndSizeStyle, transform: `rotate(${item.rotation || 0}deg)` }} // Apply rotation here
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: isItemBodyDragging ? 1.05 : 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={combinedClassName}
            title={dynamicTitle}
            role={sl.itemDefaultAriaRole || "button"}
            tabIndex={isEraserActive || item.isFixed ? -1 : 0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e); }}
            data-is-canvas-item="true"
        >
            <div className="w-full h-full relative"> {/* This div will not be rotated by PlacedItem */}
                <SpecificItemRenderer
                    item={item}
                    // itemRotation={item.rotation || 0} // Renderer itself doesn't need to apply item.rotation if PlacedItem does
                    onUpdateItemProperty={onUpdateItemProperty}
                    isSelected={isSelected || isThisTheMoveCandidate}
                    zoomLevel={zoomLevel}
                    ITEM_CONFIGS_Local={ITEM_CONFIGS} // Pass ITEM_CONFIGS for DefaultItemRenderer
                />
            </div>

            {(isSelected || isThisTheMoveCandidate) && !isEraserActive && !item.isFixed && (
                <>
                    {canResize && ['N', 'S', 'E', 'W'].map(dir => (
                        <ResizeHandle key={`${item.id}-rh-${dir}`} item={item} direction={dir} ItemTypes={ItemTypes} isSelected={isSelected || isThisTheMoveCandidate} ITEM_CONFIGS_Local={ITEM_CONFIGS} />
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