// features/venue_management/subcomponents/layout_designer/CanvasCell.jsx
import React, { memo, useCallback, useMemo } from 'react';
import { useDrop } from 'react-dnd';

// Design Guideline-Derived Tailwind Classes
const GRID_LINE_STYLES = {
    // Applied to border-b and border-r of each cell
    minorLight: "border-neutral-200 dark:border-neutral-700/50",
    majorLight: "border-neutral-300 dark:border-neutral-600/70",
};

const CELL_FEEDBACK_BG_STYLES = {
    // For the cell under the footprint of a valid/invalid placement preview
    dropValidLight: "bg-green-500/15 dark:bg-green-500/20",
    dropInvalidLight: "bg-red-500/15 dark:bg-red-500/20",
    // For the cell directly under the cursor when eraser is active
    eraserHoverLight: "bg-red-500/10 dark:bg-red-500/15",
};

const CanvasCell = ({
    // Cell Position & Grid Info
    r_minor, c_minor,
    isMajorRowBoundary, isMajorColBoundary, // Booleans indicating if this cell's bottom/right border is a major one
    gridSubdivision,

    // Callbacks from EditorCanvas/LayoutEditor
    onAddItemToLayout, onMoveExistingItem,
    canPlaceItemAtCoords,

    // Drag State & Eraser
    currentDraggedItemPreview, onUpdateCurrentDraggedItemPreview,
    isEraserActive, onEraseItemFromCell,

    // Configs
    ItemTypes, // All DND item types
}) => {

    // eslint-disable-next-line no-unused-vars
    const [{ isOver, canDropThisSpecificItem, draggedItemTypeForCell }, dropRef] = useDrop(() => ({
        accept: [
            // Dynamically accept all tool types and all placed item types from ItemTypes
            ...Object.values(ItemTypes).filter(type => typeof type === 'string' && type.endsWith('Tool')),
            ...Object.values(ItemTypes).filter(type => typeof type === 'string' && type.startsWith('placed')),
        ],
        drop: (itemPayload, monitor) => {
            if (monitor.didDrop()) return; // Prevent multiple drop handling

            const droppedActualType = monitor.getItemType();
            const isNewTool = String(droppedActualType).endsWith('Tool');

            if (isNewTool) {
                onAddItemToLayout(itemPayload, r_minor, c_minor);
            } else {
                onMoveExistingItem(itemPayload.id, r_minor, c_minor);
            }
            onUpdateCurrentDraggedItemPreview(null); // Clear placement preview on drop
        },
        hover: (itemPayload, monitor) => {
            if (!monitor.isOver({ shallow: true })) return;

            // If a resize operation's preview is active, let EditorCanvas handle visual feedback.
            // This cell hover should not generate a conflicting 'placement' preview.
            if (currentDraggedItemPreview && currentDraggedItemPreview.type === 'resize') {
                return;
            }

            let previewW_minor, previewH_minor, itemIdToExclude = null;
            const currentHoverItemType = monitor.getItemType();
            const isNewTool = String(currentHoverItemType).endsWith('Tool');

            if (isNewTool) {
                if (!itemPayload.w_major || !itemPayload.h_major || !gridSubdivision) {
                    console.warn("CanvasCell: Tool payload or gridSubdivision missing for preview.", itemPayload, gridSubdivision);
                    onUpdateCurrentDraggedItemPreview(null); return;
                }
                previewW_minor = itemPayload.w_major * gridSubdivision;
                previewH_minor = itemPayload.h_major * gridSubdivision;
            } else if (itemPayload.effW_minor !== undefined && itemPayload.effH_minor !== undefined) {
                previewW_minor = itemPayload.effW_minor;
                previewH_minor = itemPayload.effH_minor;
                itemIdToExclude = itemPayload.id;
            } else {
                console.warn("CanvasCell: Dragged item missing dimensions for preview.", itemPayload);
                onUpdateCurrentDraggedItemPreview(null); return;
            }

            const isValidPlacement = canPlaceItemAtCoords(r_minor, c_minor, previewW_minor, previewH_minor, itemIdToExclude);
            onUpdateCurrentDraggedItemPreview({
                r: r_minor, c: c_minor, // Anchor point for the preview
                w: previewW_minor, h: previewH_minor, // Dimensions of the item being previewed
                isValid: isValidPlacement,
                type: 'placement' // Specify preview type
            });
        },
        canDrop: (itemPayload, monitor) => {
            // Do not allow dropping onto a cell if a resize operation is visually active globally.
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
        ItemTypes, gridSubdivision, currentDraggedItemPreview, // Include currentDraggedItemPreview as it affects canDrop and hover
    ]);

    const handleClick = useCallback(() => {
        if (isEraserActive) {
            onEraseItemFromCell(r_minor, c_minor);
        }
        // Other cell click logic (e.g., for selecting an empty cell, if needed) can go here.
    }, [isEraserActive, onEraseItemFromCell, r_minor, c_minor]);

    const cellClasses = useMemo(() => {
        let classes = "relative transition-colors duration-75 ease-in-out"; // Base class

        // Apply bottom and right borders to each cell to form the grid lines.
        // EditorCanvas container provides top and left borders for the entire grid.
        classes += ` border-b ${isMajorRowBoundary ? GRID_LINE_STYLES.majorLight : GRID_LINE_STYLES.minorLight}`;
        classes += ` border-r ${isMajorColBoundary ? GRID_LINE_STYLES.majorLight : GRID_LINE_STYLES.minorLight}`;

        let bgClass = ''; // Background class for feedback

        // Feedback for item placement preview
        if (currentDraggedItemPreview && currentDraggedItemPreview.type === 'placement') {
            const { r: pR, c: pC, w: pW, h: pH, isValid: pIsValid } = currentDraggedItemPreview;
            // Check if this cell (r_minor, c_minor) is within the footprint of the item being previewed
            if (r_minor >= pR && r_minor < pR + pH && c_minor >= pC && c_minor < pC + pW) {
                bgClass = pIsValid
                    ? `${CELL_FEEDBACK_BG_STYLES.dropValidLight}`
                    : `${CELL_FEEDBACK_BG_STYLES.dropInvalidLight}`;
            }
        }
        // Feedback for eraser tool hovering directly over this cell
        else if (isEraserActive && isOver) {
            bgClass = `${CELL_FEEDBACK_BG_STYLES.eraserHoverLight}`;
        }

        return `${classes} ${bgClass}`;
    }, [
        isMajorRowBoundary, isMajorColBoundary,
        currentDraggedItemPreview,
        isEraserActive, isOver,
        r_minor, c_minor
    ]);

    return (
        <div
            ref={dropRef}
            className={cellClasses}
            onClick={handleClick}
            role="gridcell"
            aria-rowindex={r_minor}
            aria-colindex={c_minor}
        // title={`Cell (${r_minor},${c_minor})`} // Optional: for debugging
        >
            {/* Cell content is primarily its borders and dynamic background for feedback */}
        </div>
    );
};

export default memo(CanvasCell);