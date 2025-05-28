import React, { memo, useCallback, useMemo } from 'react';
import { useDrop } from 'react-dnd';

// --- Design Guideline-Derived Tailwind Classes (for direct use) ---
// These should align with your design system's neutral palette and semantic colors.
const GRID_LINE_STYLES = {
    minorLight: "border-neutral-200",
    minorDark: "dark:border-neutral-700/50", // Subtle with opacity
    majorLight: "border-neutral-300",
    majorDark: "dark:border-neutral-600/70", // More prominent
};

const CELL_FEEDBACK_BG_STYLES = {
    dropValidLight: "bg-green-500/15", // e.g., rose-500/15 if using primary accent for valid
    dropValidDark: "dark:bg-green-500/20", // e.g., dark:bg-rose-500/25
    dropInvalidLight: "bg-red-500/15",
    dropInvalidDark: "dark:bg-red-500/20",
    eraserHoverLight: "bg-red-500/10",
    eraserHoverDark: "dark:bg-red-500/15",
};
// --- End Design Guideline Variables ---

const CanvasCell = ({
    // Cell Position & Grid Info
    r_minor, c_minor,
    isMajorRowBoundary, isMajorColBoundary,
    gridSubdivision, // For calculating tool drop dimensions, debug, or minor specific logic

    // Callbacks from EditorCanvas/LayoutEditor
    onAddItemToLayout, onMoveExistingItem,
    canPlaceItemAtCoords,

    // Drag State & Eraser
    currentDraggedItemPreview, onUpdateCurrentDraggedItemPreview,
    isEraserActive, onEraseItemFromCell,

    // Configs
    ItemTypes, // All DND item types
}) => {

    const [{ isOver }, dropRef] = useDrop(() => ({
        accept: [
            ...Object.values(ItemTypes).filter(type => typeof type === 'string' && type.endsWith('Tool')),
            ...Object.values(ItemTypes).filter(type => typeof type === 'string' && type.startsWith('placed')),
        ],
        drop: (itemPayload, monitor) => {
            if (monitor.didDrop()) return;

            const droppedActualType = monitor.getItemType();
            const isNewTool = String(droppedActualType).endsWith('Tool');

            if (isNewTool) {
                onAddItemToLayout(itemPayload, r_minor, c_minor);
            } else {
                onMoveExistingItem(itemPayload.id, r_minor, c_minor);
            }
            onUpdateCurrentDraggedItemPreview(null);
        },
        hover: (itemPayload, monitor) => {
            if (!monitor.isOver({ shallow: true })) return;
            if (currentDraggedItemPreview && currentDraggedItemPreview.type === 'resize') return; // Resize preview handled by EditorCanvas

            let previewW_minor, previewH_minor, itemIdToExclude = null;
            const currentHoverItemType = monitor.getItemType();
            const isNewTool = String(currentHoverItemType).endsWith('Tool');

            if (isNewTool) {
                if (!itemPayload.w_major || !itemPayload.h_major) { // Safeguard for tool payload
                    console.warn("CanvasCell: Tool payload missing w_major/h_major.", itemPayload);
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
                r: r_minor, c: c_minor,
                w: previewW_minor, h: previewH_minor,
                isValid: isValidPlacement,
                type: 'placement' // Distinguish from 'resize' preview
            });
        },
        canDrop: (itemPayload, monitor) => {
            if (currentDraggedItemPreview && currentDraggedItemPreview.type === 'resize') return false;

            let itemW_minor, itemH_minor, itemIdToExclude = null;
            const currentDropItemType = monitor.getItemType();
            const isNewTool = String(currentDropItemType).endsWith('Tool');

            if (isNewTool) {
                if (!itemPayload.w_major || !itemPayload.h_major) return false;
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
            canDropThisItem: !!monitor.canDrop(), // Specific to this cell as an anchor
            draggedItemType: monitor.getItemType(),
        }),
    }), [
        r_minor, c_minor, onAddItemToLayout, onMoveExistingItem,
        canPlaceItemAtCoords, onUpdateCurrentDraggedItemPreview,
        ItemTypes, gridSubdivision, currentDraggedItemPreview, isEraserActive // Include isEraserActive if it affects canDrop
    ]);

    const handleClick = useCallback(() => {
        if (isEraserActive) {
            onEraseItemFromCell(r_minor, c_minor);
        }
        // No other direct click action for an empty cell in edit mode usually
    }, [isEraserActive, onEraseItemFromCell, r_minor, c_minor]);

    // --- Dynamic Styling ---
    const cellClasses = useMemo(() => {
        let classes = "relative transition-colors duration-75 ease-in-out"; // Base

        // Border styling (right and bottom for each cell to form the grid)
        // The EditorCanvas container provides the top and left border for the whole grid.
        classes += ` border-b ${isMajorRowBoundary ? GRID_LINE_STYLES.majorLight : GRID_LINE_STYLES.minorLight} ${isMajorRowBoundary ? GRID_LINE_STYLES.majorDark : GRID_LINE_STYLES.minorDark}`;
        classes += ` border-r ${isMajorColBoundary ? GRID_LINE_STYLES.majorLight : GRID_LINE_STYLES.minorLight} ${isMajorColBoundary ? GRID_LINE_STYLES.majorDark : GRID_LINE_STYLES.minorDark}`;

        // Interaction Feedback Backgrounds
        let bgClass = '';
        if (currentDraggedItemPreview && currentDraggedItemPreview.type === 'placement') {
            const { r: pR, c: pC, w: pW, h: pH, isValid: pIsValid } = currentDraggedItemPreview;
            if (r_minor >= pR && r_minor < pR + pH && c_minor >= pC && c_minor < pC + pW) { // Cell is part of the footprint
                bgClass = pIsValid
                    ? `${CELL_FEEDBACK_BG_STYLES.dropValidLight} ${CELL_FEEDBACK_BG_STYLES.dropValidDark}`
                    : `${CELL_FEEDBACK_BG_STYLES.dropInvalidLight} ${CELL_FEEDBACK_BG_STYLES.dropInvalidDark}`;
            }
        } else if (isEraserActive && isOver) { // Eraser directly hovering this cell
            bgClass = `${CELL_FEEDBACK_BG_STYLES.eraserHoverLight} ${CELL_FEEDBACK_BG_STYLES.eraserHoverDark}`;
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
        // title={`Cell (${r_minor},${c_minor})`} // Can be too verbose; remove for final
        >
            {/* Content of the cell is primarily its borders and background feedback.
                No direct child elements unless for extreme debugging. */}
        </div>
    );
};

// Memoize CanvasCell as many instances will be rendered.
// Re-renders only if its specific props change.
export default memo(CanvasCell);