import React, { memo, useCallback, useMemo, useState } from 'react';
import { useDrop } from 'react-dnd';

// Localization
import slRaw from '../../utils/script_lines.js'; // Assuming path from CanvasCell to script_lines
const sl = slRaw.venueManagement.canvasCell; // Section for CanvasCell

// Design Guideline-Derived Tailwind Classes (Copied from original, no changes here)
const GRID_LINE_STYLES = {
    minorLight: "border-neutral-200 dark:border-neutral-700/50",
    majorLight: "border-neutral-300 dark:border-neutral-600/70",
};
const CELL_FEEDBACK_BG_STYLES = {
    dropValidLight: "bg-green-500/15 dark:bg-green-500/20",
    dropInvalidLight: "bg-red-500/15 dark:bg-red-500/20",
    eraserHoverLight: "bg-red-500/10 dark:bg-red-500/15",
    clickMoveTargetHoverLight: "bg-sky-500/10 dark:bg-sky-500/15",
    clickPlaceNewValidLight: "bg-teal-500/15 dark:bg-teal-500/20",
    clickPlaceNewInvalidLight: "bg-orange-500/15 dark:bg-orange-500/20",
};
// --- End Design Guideline Variables ---

const CanvasCell = ({
    r_minor, c_minor,
    isMajorRowBoundary, isMajorColBoundary,
    gridSubdivision,
    onAddItemToLayout,
    onMoveExistingItem,
    onCellClickForPrimaryAction,
    canPlaceItemAtCoords,
    currentDraggedItemPreview, onUpdateCurrentDraggedItemPreview,
    moveCandidateItemId,
    activeToolForPlacement,
    isEraserActive, onEraseItemFromCell,
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
        hover: (itemPayload, monitor) => {
            if (!monitor.isOver({ shallow: true })) return;
            if (currentDraggedItemPreview && currentDraggedItemPreview.type === 'resize') return;
            if (activeToolForPlacement) {
                onUpdateCurrentDraggedItemPreview(null);
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
                type: 'placement'
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
            // canDropThisSpecificItem: !!monitor.canDrop(), // Not used directly in render
        }),
    }), [
        r_minor, c_minor, onAddItemToLayout, onMoveExistingItem,
        canPlaceItemAtCoords, onUpdateCurrentDraggedItemPreview,
        ItemTypes, gridSubdivision, currentDraggedItemPreview, activeToolForPlacement,
    ]);

    const [isHoveredDirectly, setIsHoveredDirectly] = useState(false);

    const handleClick = useCallback(() => {
        if (isEraserActive) {
            onEraseItemFromCell(r_minor, c_minor);
        } else if (onCellClickForPrimaryAction) {
            onCellClickForPrimaryAction(r_minor, c_minor);
        }
    }, [isEraserActive, onEraseItemFromCell, r_minor, c_minor, onCellClickForPrimaryAction]);

    const cellClasses = useMemo(() => {
        let classes = "relative transition-colors duration-75 ease-in-out";
        classes += ` border-b ${isMajorRowBoundary ? GRID_LINE_STYLES.majorLight : GRID_LINE_STYLES.minorLight}`;
        classes += ` border-r ${isMajorColBoundary ? GRID_LINE_STYLES.majorLight : GRID_LINE_STYLES.minorLight}`;
        let bgClass = '';

        if (currentDraggedItemPreview && currentDraggedItemPreview.type === 'placement' && isOverForDnd) {
            const { r: pR, c: pC, w: pW, h: pH, isValid: pIsValid } = currentDraggedItemPreview;
            if (r_minor >= pR && r_minor < pR + pH && c_minor >= pC && c_minor < pC + pW) {
                bgClass = pIsValid ? CELL_FEEDBACK_BG_STYLES.dropValidLight : CELL_FEEDBACK_BG_STYLES.dropInvalidLight;
            }
        } else if (isEraserActive && isOverForDnd) {
            bgClass = CELL_FEEDBACK_BG_STYLES.eraserHoverLight;
        } else if (activeToolForPlacement && isHoveredDirectly && !isEraserActive) {
            const toolWMinor = activeToolForPlacement.w_major * gridSubdivision;
            const toolHMinor = activeToolForPlacement.h_major * gridSubdivision;
            if (isHoveredDirectly) {
                const isValidPlacement = canPlaceItemAtCoords(r_minor, c_minor, toolWMinor, toolHMinor, null);
                bgClass = isValidPlacement ? CELL_FEEDBACK_BG_STYLES.clickPlaceNewValidLight : CELL_FEEDBACK_BG_STYLES.clickPlaceNewInvalidLight;
            }
        } else if (moveCandidateItemId && isHoveredDirectly && !isEraserActive) {
            bgClass = CELL_FEEDBACK_BG_STYLES.clickMoveTargetHoverLight;
        }

        return `${classes} ${bgClass}`;
    }, [
        isMajorRowBoundary, isMajorColBoundary,
        currentDraggedItemPreview, isOverForDnd,
        isEraserActive,
        activeToolForPlacement, moveCandidateItemId, isHoveredDirectly,
        r_minor, c_minor, gridSubdivision, canPlaceItemAtCoords
    ]);

    // Construct a dynamic aria-label based on the current interaction state
    // This is an example; more complex logic might be needed depending on desired verbosity
    const dynamicAriaLabel = useMemo(() => {
        let label = `${sl.gridCellRoleDescription || "Layout grid cell"} R${r_minor}C${c_minor}.`;
        if (isEraserActive && isHoveredDirectly) {
            label += ` Hovering with eraser. Click to erase.`; // Localize this phrase
        } else if (activeToolForPlacement && isHoveredDirectly) {
            label += ` Potential placement for ${activeToolForPlacement.name}. Click to place.`; // Localize
        } else if (moveCandidateItemId && isHoveredDirectly) {
            label += ` Potential move target. Click to move selected item here.`; // Localize
        }
        // Add more states if needed (e.g., DND hover)
        return label;
    }, [r_minor, c_minor, isEraserActive, activeToolForPlacement, moveCandidateItemId, isHoveredDirectly]);


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
            aria-label={dynamicAriaLabel} // Dynamically constructed label
        // title could also be set dynamically if needed for mouse users,
        // but aria-label covers screen readers.
        >
            {/* Cell content is primarily visual feedback and drop target, no direct text */}
        </div>
    );
};

export default memo(CanvasCell);