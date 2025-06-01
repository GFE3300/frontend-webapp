import React from 'react';
import { useDrag } from 'react-dnd';
import Icon from '../../../../components/common/Icon';

// Localization
import slRaw, { interpolate } from '../../utils/script_lines.js'; // Adjust path
const sl = slRaw.venueManagement.draggableTool;

// Design Guideline Variables (Copied from original, no changes here)
const DRAGGABLE_TOOL_CLASSES = {
    containerBase: "flex flex-col font-montserrat items-center justify-center cursor-grab transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
    sizeNormal: "w-[72px] h-[72px] p-2 rounded-lg shadow-sm",
    sizeZen: "w-10 h-10 p-1.5 rounded-md shadow",
    bgLight: "bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200",
    bgDark: "dark:bg-neutral-700/50 dark:hover:bg-neutral-600/70 dark:active:bg-neutral-600",
    ringFocusLight: "focus-visible:ring-rose-500 focus-visible:ring-offset-white",
    ringFocusDark: "dark:focus-visible:ring-rose-400 dark:focus-visible:ring-offset-neutral-800",
    textNormalLight: "text-[11px] mt-1 font-medium text-neutral-600 text-center leading-tight select-none",
    textNormalDark: "dark:text-neutral-300",
    dragging: "opacity-60 !shadow-xl ring-2 ring-rose-500 dark:ring-rose-400 scale-95",
    activeForPlacementLight: "!bg-sky-100 dark:!bg-sky-700/50 ring-2 ring-sky-500 dark:ring-sky-400 scale-95",
    // activeForPlacementDark: "dark:!bg-sky-600/70", // Covered by above
    iconSizeNormal: "w-6 h-6",
    iconSizeZen: "w-5 h-5",
    iconColorLight: "text-neutral-700",
    iconColorDark: "dark:text-neutral-200",
};
// --- End Design Guideline Variables ---

const DraggableTool = ({
    tool, // tool.name is now localized from itemConfigs.jsx
    itemType,
    onToolClick,
    isActiveForPlacement,
    isZenMode,
}) => {
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: itemType,
        item: { // These properties are internal for DND, not directly user-facing text
            toolItemType: tool.toolItemType,
            createsPlacedItemType: tool.createsPlacedItemType,
            w_major: tool.w_major,
            h_major: tool.h_major,
            size_identifier: tool.size_identifier,
            label: tool.label, // This label might be for the *placed item*, not the tool itself
            decorType: tool.decorType,
            thickness_minor: tool.thickness_minor,
        },
        canDrag: () => !isActiveForPlacement,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [itemType, tool, isActiveForPlacement]);

    const containerSizeClass = isZenMode ? DRAGGABLE_TOOL_CLASSES.sizeZen : DRAGGABLE_TOOL_CLASSES.sizeNormal;
    const iconSizeClass = isZenMode ? DRAGGABLE_TOOL_CLASSES.iconSizeZen : DRAGGABLE_TOOL_CLASSES.iconSizeNormal;

    // tool.name is already localized from itemConfigs.jsx
    // If tool.name contains "(...)", this part might not be localized yet unless itemConfigs.jsx handles it.
    // For display, we often want just the primary name.
    const displayName = tool.name.split('(')[0].trim(); // This uses the already localized tool.name

    const handleClick = (e) => {
        if (onToolClick) {
            onToolClick(tool);
        }
    };

    let combinedClasses = `
        ${DRAGGABLE_TOOL_CLASSES.containerBase}
        ${containerSizeClass}
        ${DRAGGABLE_TOOL_CLASSES.bgLight}
        ${DRAGGABLE_TOOL_CLASSES.bgDark}
        ${DRAGGABLE_TOOL_CLASSES.ringFocusLight}
        ${DRAGGABLE_TOOL_CLASSES.ringFocusDark}
    `;

    if (isDragging) {
        combinedClasses += ` ${DRAGGABLE_TOOL_CLASSES.dragging}`;
    } else if (isActiveForPlacement) {
        combinedClasses += ` ${DRAGGABLE_TOOL_CLASSES.activeForPlacementLight}`;
        combinedClasses = combinedClasses.replace('cursor-grab', 'cursor-pointer');
    }

    const titleText = isActiveForPlacement
        ? interpolate(sl.tooltipActivePlacement || "Tool '{toolName}' active. Click a cell to place.", { toolName: tool.name })
        : (isZenMode
            ? interpolate(sl.tooltipDefaultZenMode || "{toolName}", { toolName: tool.name })
            : interpolate(sl.tooltipDefaultFullMode || "Click to select, or Drag to add {toolName}", { toolName: tool.name })
        );

    const ariaLabelText = isActiveForPlacement
        ? interpolate(sl.ariaLabelActivePlacement || "{toolName} tool. Currently active for placement.", { toolName: tool.name })
        : interpolate(sl.ariaLabelDefault || "{toolName} tool. Click to select or drag to add.", { toolName: tool.name });

    return (
        <div
            ref={dragRef}
            onClick={handleClick}
            className={combinedClasses}
            title={titleText}
            aria-label={ariaLabelText}
            tabIndex={0}
            role="button"
            aria-pressed={isActiveForPlacement}
        >
            <Icon
                name={tool.visual}
                className={`
                    ${iconSizeClass}
                    ${DRAGGABLE_TOOL_CLASSES.iconColorLight}
                    ${DRAGGABLE_TOOL_CLASSES.iconColorDark}
                    pointer-events-none 
                `}
                aria-hidden="true"
                style={{ fontSize: isZenMode ? '1.25rem' : '1.5rem' }}
            />

            {!isZenMode && (
                <span
                    className={`
                        ${DRAGGABLE_TOOL_CLASSES.textNormalLight}
                        ${DRAGGABLE_TOOL_CLASSES.textNormalDark}
                         pointer-events-none
                    `}
                >
                    {displayName} {/* Uses the (potentially trimmed) localized tool.name */}
                </span>
            )}
        </div>
    );
};

export default DraggableTool;