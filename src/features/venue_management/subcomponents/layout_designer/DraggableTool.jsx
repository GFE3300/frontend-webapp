import React from 'react';
import { useDrag } from 'react-dnd';
import Icon from '../../../../components/common/Icon';

// Design Guideline Variables
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

    dragging: "opacity-60 !shadow-xl ring-2 ring-rose-500 dark:ring-rose-400 scale-95", // DND dragging style

    // << NEW: Style for when tool is active for click-placement >>
    activeForPlacementLight: "!bg-sky-100 dark:!bg-sky-700/50 ring-2 ring-sky-500 dark:ring-sky-400 scale-95",
    activeForPlacementDark: "dark:!bg-sky-600/70", // Combined with above or specific if needed

    iconSizeNormal: "w-6 h-6",
    iconSizeZen: "w-5 h-5",
    iconColorLight: "text-neutral-700",
    iconColorDark: "dark:text-neutral-200",
};

const DraggableTool = ({
    tool,
    itemType,   // DND item type (tool.toolItemType)
    onToolClick, // << NEW PROP: Callback for click-to-place selection
    isActiveForPlacement, // << NEW PROP: Boolean, true if this tool is active for click-placement
    isZenMode,
}) => {
    const [{ isDragging }, dragRef] = useDrag(() => ({ // Removed previewRef as it's not explicitly used for custom preview
        type: itemType,
        item: {
            toolItemType: tool.toolItemType,
            createsPlacedItemType: tool.createsPlacedItemType,
            w_major: tool.w_major,
            h_major: tool.h_major,
            size_identifier: tool.size_identifier,
            label: tool.label,
            decorType: tool.decorType,
            thickness_minor: tool.thickness_minor,
        },
        canDrag: () => !isActiveForPlacement, // << MODIFIED: Don't allow DND drag if tool is active for click-placement
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [itemType, tool, isActiveForPlacement]); // Added isActiveForPlacement to dependencies

    const containerSizeClass = isZenMode ? DRAGGABLE_TOOL_CLASSES.sizeZen : DRAGGABLE_TOOL_CLASSES.sizeNormal;
    const iconSizeClass = isZenMode ? DRAGGABLE_TOOL_CLASSES.iconSizeZen : DRAGGABLE_TOOL_CLASSES.iconSizeNormal;
    const displayName = tool.name.split('(')[0].trim();

    const handleClick = (e) => {
        // Prevent DND from interfering if it's just a click for selection
        // e.preventDefault(); // Might not be necessary if canDrag handles it
        
        if (onToolClick) {
            onToolClick(tool); // Pass the full tool definition
        }
    };

    // Combine classes
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
        // If you have specific dark mode active styles not covered by the light one:
        // combinedClasses += ` ${DRAGGABLE_TOOL_CLASSES.activeForPlacementDark}`;
        // The cursor should probably be 'pointer' or 'default' if active, not 'grab'
        combinedClasses = combinedClasses.replace('cursor-grab', 'cursor-pointer');
    }


    return (
        <div
            ref={dragRef}
            onClick={handleClick} // << ADDED onClick handler
            className={combinedClasses}
            title={isActiveForPlacement ? `Tool '${tool.name}' active. Click a cell to place.` : (isZenMode ? tool.name : `Click to select, or Drag to add ${tool.name}`)}
            aria-label={`${tool.name} tool. ${isActiveForPlacement ? 'Currently active for placement.' : 'Click to select or drag to add.'}`}
            tabIndex={0}
            role="button"
            aria-pressed={isActiveForPlacement} // Indicate if it's the active tool
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
                    {displayName}
                </span>
            )}
        </div>
    );
};

export default DraggableTool;