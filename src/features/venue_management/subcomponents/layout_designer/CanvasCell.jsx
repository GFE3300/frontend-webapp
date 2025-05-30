// features/venue_management/subcomponents/layout_designer/CanvasCell.jsx
import React, { memo, useCallback, useMemo, useState } from 'react'; // Added useState
import { useDrop } from 'react-dnd';

// Design Guideline-Derived Tailwind Classes
const GRID_LINE_STYLES = {
    minorLight: "border-neutral-200 dark:border-neutral-700/50",
    majorLight: "border-neutral-300 dark:border-neutral-600/70",
};

const CELL_FEEDBACK_BG_STYLES = {
    dropValidLight: "bg-green-500/15 dark:bg-green-500/20",      // DND valid
    dropInvalidLight: "bg-red-500/15 dark:bg-red-500/20",        // DND invalid
    eraserHoverLight: "bg-red-500/10 dark:bg-red-500/15",       // Eraser hover
    clickMoveTargetHoverLight: "bg-sky-500/10 dark:bg-sky-500/15", // Moving existing item target hover (generic)
    // NEW: For click-placing a NEW tool
    clickPlaceNewValidLight: "bg-teal-500/15 dark:bg-teal-500/20",  // New tool placement valid
    clickPlaceNewInvalidLight: "bg-orange-500/15 dark:bg-orange-500/20",// New tool placement invalid
};

const CanvasCell = ({
    // Cell Position & Grid Info
    r_minor, c_minor,
    isMajorRowBoundary, isMajorColBoundary,
    gridSubdivision,

    // Callbacks from EditorCanvas/LayoutEditor
    onAddItemToLayout, 
    onMoveExistingItem, 
    onCellClickForPrimaryAction,
    canPlaceItemAtCoords,

    // Interaction States
    currentDraggedItemPreview, onUpdateCurrentDraggedItemPreview,
    moveCandidateItemId,    
    activeToolForPlacement, 
    isEraserActive, onEraseItemFromCell,

    // Configs
    ItemTypes,
}) => {

    const [{ isOverForDnd }, dropRef] = useDrop(() => ({
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
        hover: (itemPayload, monitor) => { /* ... (no changes to DND hover logic for preview) ... */
            if (!monitor.isOver({ shallow: true })) return;
            if (currentDraggedItemPreview && currentDraggedItemPreview.type === 'resize') return;
            if (activeToolForPlacement) { // If a tool is selected for click-placement, DND hover shouldn't generate a preview
                onUpdateCurrentDraggedItemPreview(null); // Clear any DND placement preview
                return;
            }

            let previewW_minor, previewH_minor, itemIdToExclude = null;
            const currentHoverItemType = monitor.getItemType();
            const isNewTool = String(currentHoverItemType).endsWith('Tool');

            if (isNewTool) {
                if (!itemPayload.w_major || !itemPayload.h_major || !gridSubdivision) {
                    onUpdateCurrentDraggedItemPreview(null); return;
                }
                previewW_minor = itemPayload.w_major * gridSubdivision;
                previewH_minor = itemPayload.h_major * gridSubdivision;
            } else if (itemPayload.effW_minor !== undefined && itemPayload.effH_minor !== undefined) {
                previewW_minor = itemPayload.effW_minor;
                previewH_minor = itemPayload.effH_minor;
                itemIdToExclude = itemPayload.id;
            } else {
                onUpdateCurrentDraggedItemPreview(null); return;
            }
            const isValidPlacement = canPlaceItemAtCoords(r_minor, c_minor, previewW_minor, previewH_minor, itemIdToExclude);
            onUpdateCurrentDraggedItemPreview({
                r: r_minor, c: c_minor,
                w: previewW_minor, h: previewH_minor,
                isValid: isValidPlacement,
                type: 'placement' // DND placement preview
            });
        },
        canDrop: (itemPayload, monitor) => {
            if (currentDraggedItemPreview && currentDraggedItemPreview.type === 'resize') return false;
            if (activeToolForPlacement) return false; 

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
            isOverForDnd: !!monitor.isOver({ shallow: true }),
            canDropThisSpecificItem: !!monitor.canDrop(),
        }),
    }), [
        r_minor, c_minor, onAddItemToLayout, onMoveExistingItem,
        canPlaceItemAtCoords, onUpdateCurrentDraggedItemPreview,
        ItemTypes, gridSubdivision, currentDraggedItemPreview, activeToolForPlacement, // Added activeToolForPlacement
    ]);

    const [isHoveredDirectly, setIsHoveredDirectly] = useState(false);

    const handleClick = useCallback(() => {
        if (isEraserActive) {
            onEraseItemFromCell(r_minor, c_minor);
        } else if (onCellClickForPrimaryAction) {
            // This callback (handleCanvasCellPrimaryClick in LayoutEditor) now decides
            // whether to place a new item (if activeToolForPlacement is set)
            // or move an existing item (if moveCandidateItemId is set).
            onCellClickForPrimaryAction(r_minor, c_minor);
        }
    }, [isEraserActive, onEraseItemFromCell, r_minor, c_minor, onCellClickForPrimaryAction]);

    const cellClasses = useMemo(() => {
        let classes = "relative transition-colors duration-75 ease-in-out";
        classes += ` border-b ${isMajorRowBoundary ? GRID_LINE_STYLES.majorLight : GRID_LINE_STYLES.minorLight}`;
        classes += ` border-r ${isMajorColBoundary ? GRID_LINE_STYLES.majorLight : GRID_LINE_STYLES.minorLight}`;
        let bgClass = '';

        // Determine background based on interaction mode priority:
        // 1. DND Preview (if an item is being dragged over)
        // 2. Eraser Hover
        // 3. Click-Place New Tool Preview (if a tool is active and cell hovered)
        // 4. Click-Move Existing Item Target Hover (if item is selected for move and cell hovered)

        if (currentDraggedItemPreview && currentDraggedItemPreview.type === 'placement' && isOverForDnd) {
            const { r: pR, c: pC, w: pW, h: pH, isValid: pIsValid } = currentDraggedItemPreview;
            if (r_minor >= pR && r_minor < pR + pH && c_minor >= pC && c_minor < pC + pW) {
                bgClass = pIsValid ? CELL_FEEDBACK_BG_STYLES.dropValidLight : CELL_FEEDBACK_BG_STYLES.dropInvalidLight;
            }
        } else if (isEraserActive && isOverForDnd) { // isOverForDnd better for eraser context
            bgClass = CELL_FEEDBACK_BG_STYLES.eraserHoverLight;
        } else if (activeToolForPlacement && isHoveredDirectly && !isEraserActive) {
            // Preview for placing a NEW item from toolbar (click-to-place)
            const toolWMinor = activeToolForPlacement.w_major * gridSubdivision;
            const toolHMinor = activeToolForPlacement.h_major * gridSubdivision;
            // Check if this cell is the top-left anchor of the potential new item's footprint
            if (isHoveredDirectly) { // This means the cursor is directly over *this* cell
                // For a full footprint preview, we'd need to pass more info or use a global preview div.
                // For individual cell highlight as potential top-left:
                const isValidPlacement = canPlaceItemAtCoords(r_minor, c_minor, toolWMinor, toolHMinor, null);
                bgClass = isValidPlacement ? CELL_FEEDBACK_BG_STYLES.clickPlaceNewValidLight : CELL_FEEDBACK_BG_STYLES.clickPlaceNewInvalidLight;
            }
            // To show a full footprint preview for click-to-place (like DND),
            // LayoutEditor would manage a state like `clickPlacePreview` similar to `draggedItemPreview`
            // and CanvasCell would read from that. For now, this is a simpler cell-specific highlight.
        } else if (moveCandidateItemId && isHoveredDirectly && !isEraserActive) {
            // Hover feedback for moving an EXISTING item to this cell (click-to-move)
            // This is a generic highlight; could be enhanced with validity check
            bgClass = CELL_FEEDBACK_BG_STYLES.clickMoveTargetHoverLight;
        }

        return `${classes} ${bgClass}`;
    }, [
        isMajorRowBoundary, isMajorColBoundary,
        currentDraggedItemPreview, isOverForDnd,
        isEraserActive,
        activeToolForPlacement, moveCandidateItemId, isHoveredDirectly,
        r_minor, c_minor, gridSubdivision, canPlaceItemAtCoords // Added dependencies for new preview
    ]);

    return (
        <div
            ref={dropRef}
            className={cellClasses}
            onClick={handleClick}
            onMouseEnter={() => setIsHoveredDirectly(true)}
            onMouseLeave={() => setIsHoveredDirectly(false)}
            role="gridcell"
            aria-rowindex={r_minor}
            aria-colindex={c_minor}
        >
            {/* Cell content */}
        </div>
    );
};

export default memo(CanvasCell);