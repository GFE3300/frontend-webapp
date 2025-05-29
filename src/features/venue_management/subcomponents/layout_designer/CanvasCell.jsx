// features/venue_management/subcomponents/layout_designer/CanvasCell.jsx
// DEBUG MODE + ROTATION-RESIZE FOCUS
import React, { memo, useCallback, useMemo } from 'react';
import { useDrop } from 'react-dnd';

// Design Guideline-Derived Tailwind Classes
const GRID_LINE_STYLES = {
    minorLight: "border-neutral-200 dark:border-neutral-700/50",
    majorLight: "border-neutral-300 dark:border-neutral-600/70",
};

const CELL_FEEDBACK_BG_STYLES = {
    dropValidLight: "bg-green-500/15 dark:bg-green-500/20",
    dropInvalidLight: "bg-red-500/15 dark:bg-red-500/20",
    eraserHoverLight: "bg-red-500/10 dark:bg-red-500/15",
};

const ROTATION_RESIZE_DEBUG_CC = "[DEBUG ROTATION-RESIZE] [CanvasCell] ";

const CanvasCell = ({
    // Cell Position & Grid Info
    r_minor, c_minor,
    isMajorRowBoundary, isMajorColBoundary,
    gridSubdivision,

    // Callbacks from EditorCanvas/LayoutEditor
    onAddItemToLayout, onMoveExistingItem,
    canPlaceItemAtCoords,

    // Drag State & Eraser
    currentDraggedItemPreview, // This is the key prop from useDesignerInteractions, managed by EditorCanvas
    onUpdateCurrentDraggedItemPreview, // Callback to update the preview state in EditorCanvas
    isEraserActive, onEraseItemFromCell,

    // Configs
    ItemTypes, // All DND item types
}) => {

    // eslint-disable-next-line no-unused-vars
    const [{ isOver, canDropThisSpecificItem, draggedItemTypeForCell }, dropRef] = useDrop(() => ({
        accept: [
            ...Object.values(ItemTypes).filter(type => typeof type === 'string' && type.endsWith('Tool')),
            ...Object.values(ItemTypes).filter(type => typeof type === 'string' && type.startsWith('placed')),
        ],
        drop: (itemPayload, monitor) => {
            if (monitor.didDrop()) return;

            const droppedActualType = monitor.getItemType();
            const isNewTool = String(droppedActualType).endsWith('Tool');

            console.log(ROTATION_RESIZE_DEBUG_CC + `Cell (${r_minor},${c_minor}) DROP event. Type: ${droppedActualType}. IsNewTool: ${isNewTool}. Payload:`, JSON.parse(JSON.stringify(itemPayload)));

            if (isNewTool) {
                onAddItemToLayout(itemPayload, r_minor, c_minor);
            } else {
                onMoveExistingItem(itemPayload.id, r_minor, c_minor);
            }
            onUpdateCurrentDraggedItemPreview(null); // Clear placement preview on drop
        },
        hover: (itemPayload, monitor) => {
            if (!monitor.isOver({ shallow: true })) return;

            if (currentDraggedItemPreview && currentDraggedItemPreview.type === 'resize') {
                // console.log(ROTATION_RESIZE_DEBUG_CC + `Cell (${r_minor},${c_minor}) Hover - resize preview active, skipping placement preview.`);
                return;
            }

            let previewW_minor, previewH_minor, itemIdToExclude = null;
            const currentHoverItemType = monitor.getItemType();
            const isNewTool = String(currentHoverItemType).endsWith('Tool');

            if (isNewTool) {
                if (!itemPayload.w_major || !itemPayload.h_major || !gridSubdivision) {
                    // console.warn(ROTATION_RESIZE_DEBUG_CC + `Cell (${r_minor},${c_minor}) Hover - Tool payload or gridSubdivision missing.`);
                    onUpdateCurrentDraggedItemPreview(null); return;
                }
                previewW_minor = itemPayload.w_major * gridSubdivision;
                previewH_minor = itemPayload.h_major * gridSubdivision;
            } else if (itemPayload.effW_minor !== undefined && itemPayload.effH_minor !== undefined) { // Existing item being moved
                previewW_minor = itemPayload.effW_minor; // These are AABB dimensions from PlacedItem payload
                previewH_minor = itemPayload.effH_minor; // These are AABB dimensions from PlacedItem payload
                itemIdToExclude = itemPayload.id;
            } else {
                // console.warn(ROTATION_RESIZE_DEBUG_CC + `Cell (${r_minor},${c_minor}) Hover - Dragged item missing dimensions for preview.`);
                onUpdateCurrentDraggedItemPreview(null); return;
            }

            // console.log(ROTATION_RESIZE_DEBUG_CC + `Cell (${r_minor},${c_minor}) Hover - ItemType: ${currentHoverItemType}, PreviewDims for canPlace: w=${previewW_minor}, h=${previewH_minor}`);

            const isValidPlacement = canPlaceItemAtCoords(r_minor, c_minor, previewW_minor, previewH_minor, itemIdToExclude);

            // console.log(ROTATION_RESIZE_DEBUG_CC + `Cell (${r_minor},${c_minor}) Hover - isValidPlacement=${isValidPlacement}. Updating preview with anchor (${r_minor},${c_minor}), dims (${previewW_minor},${previewH_minor})`);
            onUpdateCurrentDraggedItemPreview({
                r: r_minor, c: c_minor,
                w: previewW_minor, h: previewH_minor,
                isValid: isValidPlacement,
                type: 'placement'
            });
        },
        canDrop: (itemPayload, monitor) => {
            if (currentDraggedItemPreview && currentDraggedItemPreview.type === 'resize') {
                return false;
            }

            let itemW_minor, itemH_minor, itemIdToExclude = null;
            const currentDropItemType = monitor.getItemType();
            const isNewTool = String(currentDropItemType).endsWith('Tool');

            if (isNewTool) {
                if (!itemPayload.w_major || !itemPayload.h_major || !gridSubdivision) return false;
                itemW_minor = itemPayload.w_major * gridSubdivision;
                itemH_minor = itemPayload.h_major * gridSubdivision;
            } else if (itemPayload.effW_minor !== undefined && itemPayload.effH_minor !== undefined) {
                itemW_minor = itemPayload.effW_minor;
                itemH_minor = itemPayload.effH_minor;
                itemIdToExclude = itemPayload.id;
            } else {
                return false;
            }
            return canPlaceItemAtCoords(r_minor, c_minor, itemW_minor, itemH_minor, itemIdToExclude);
        },
        collect: monitor => ({
            isOver: !!monitor.isOver({ shallow: true }),
            canDropThisSpecificItem: !!monitor.canDrop(),
            draggedItemTypeForCell: monitor.getItemType(),
        }),
    }), [
        r_minor, c_minor, onAddItemToLayout, onMoveExistingItem,
        canPlaceItemAtCoords, onUpdateCurrentDraggedItemPreview,
        ItemTypes, gridSubdivision, currentDraggedItemPreview,
    ]);

    const handleClick = useCallback(() => {
        if (isEraserActive) {
            onEraseItemFromCell(r_minor, c_minor);
        }
    }, [isEraserActive, onEraseItemFromCell, r_minor, c_minor]);

    const cellClasses = useMemo(() => {
        let classes = "relative transition-colors duration-75 ease-in-out";
        classes += ` border-b ${isMajorRowBoundary ? GRID_LINE_STYLES.majorLight : GRID_LINE_STYLES.minorLight}`;
        classes += ` border-r ${isMajorColBoundary ? GRID_LINE_STYLES.majorLight : GRID_LINE_STYLES.minorLight}`;
        let bgClass = '';

        // Log currentDraggedItemPreview state when cellClasses is recomputed and a preview is active
        if (currentDraggedItemPreview) {
            if (r_minor === 1 && c_minor === 1) { // Log only for one cell to avoid flooding, or choose a specific cell
                // console.log(ROTATION_RESIZE_DEBUG_CC + `Cell (${r_minor},${c_minor}) useMemo - currentDraggedItemPreview: type=${currentDraggedItemPreview.type}, w=${currentDraggedItemPreview.w}, h=${currentDraggedItemPreview.h}, anchor_r=${currentDraggedItemPreview.r}, anchor_c=${currentDraggedItemPreview.c}, isValid=${currentDraggedItemPreview.isValid}`);
            }
        }

        if (currentDraggedItemPreview && currentDraggedItemPreview.type === 'placement') {
            const { r: pR, c: pC, w: pW, h: pH, isValid: pIsValid } = currentDraggedItemPreview;

            const isInFootprint = (r_minor >= pR && r_minor < (pR + pH) && c_minor >= pC && c_minor < (pC + pW));

            // ***** NEW LOG: Log for EVERY cell, whether it thinks it's in the footprint or not *****
            // To reduce log spam, let's only log if it's near the expected footprint or if something seems off.
            // For instance, if the preview anchor is (4,7) and preview is 2x5, check cells around r=4-8, c=7-8
            const isNearAnchor = Math.abs(r_minor - pR) < (pH + 2) && Math.abs(c_minor - pC) < (pW + 2);
            if (isNearAnchor) { // Only log for cells somewhat near the preview area to reduce flood
                console.log(ROTATION_RESIZE_DEBUG_CC +
                    `Cell (${r_minor},${c_minor}). PreviewAnchor:(${pR},${pC}), PreviewDims:(${pW}w,${pH}h). Condition: (r_minor(${r_minor}) >= pR(${pR}) && r_minor(${r_minor}) < (pR+pH)(${(pR + pH)}) && c_minor(${c_minor}) >= pC(${pC}) && c_minor(${c_minor}) < (pC+pW)(${(pC + pW)})) === ${isInFootprint}. ValidDrop: ${pIsValid}`);
            }
            // ***** END NEW LOG *****

            // CRITICAL LOG: Check the values used for footprint calculation
            if (r_minor === pR && c_minor === pC) { // Log for the anchor cell of the preview
                console.log(ROTATION_RESIZE_DEBUG_CC + `Cell (${r_minor},${c_minor}) - ANCHOR of PLACEMENT preview. Preview footprint: w=${pW}, h=${pH}. My coords: r=${r_minor}, c=${c_minor}`);
            }

            if (r_minor >= pR && r_minor < pR + pH && c_minor >= pC && c_minor < pC + pW) {
                // This cell is part of the footprint
                bgClass = pIsValid ? `${CELL_FEEDBACK_BG_STYLES.dropValidLight}` : `${CELL_FEEDBACK_BG_STYLES.dropInvalidLight}`;
                // if (r_minor === pR && c_minor === pC) { // More specific log if needed
                //    console.log(ROTATION_RESIZE_DEBUG_CC + `Cell (${r_minor},${c_minor}) IS HIGHLIGHTED. Valid: ${pIsValid}`);
                // }
            }
        }
        else if (isEraserActive && isOver) { // isOver comes from useDrop
            bgClass = `${CELL_FEEDBACK_BG_STYLES.eraserHoverLight}`;
        }

        return `${classes} ${bgClass}`;
    }, [
        isMajorRowBoundary, isMajorColBoundary,
        currentDraggedItemPreview, // This is a key dependency
        isEraserActive, isOver,    // isOver from useDrop hook
        r_minor, c_minor           // Cell's own coordinates
    ]);

    return (
        <div
            ref={dropRef}
            className={cellClasses}
            onClick={handleClick}
            role="gridcell"
            aria-rowindex={r_minor}
            aria-colindex={c_minor}
        >
        </div>
    );
};

export default memo(CanvasCell);