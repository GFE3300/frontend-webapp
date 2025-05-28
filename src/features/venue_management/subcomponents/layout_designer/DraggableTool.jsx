// features/venue_management/subcomponents/layout_designer/DraggableTool.jsx
import React from 'react';
import { useDrag } from 'react-dnd';
import Icon from '../../../../components/common/Icon'; // Standard Icon component

// Design Guideline Variables
const DRAGGABLE_TOOL_CLASSES = {
    containerBase: "flex flex-col font-montserrat items-center justify-center cursor-grab transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
    sizeNormal: "w-[72px] h-[72px] p-2 rounded-lg shadow-sm",
    sizeZen: "w-10 h-10 p-1.5 rounded-md shadow",

    bgLight: "bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200", // Added active state
    bgDark: "dark:bg-neutral-700/50 dark:hover:bg-neutral-600/70 dark:active:bg-neutral-600", // Added active state

    ringFocusLight: "focus-visible:ring-rose-500 focus-visible:ring-offset-white",
    ringFocusDark: "dark:focus-visible:ring-rose-400 dark:focus-visible:ring-offset-neutral-800",

    textNormalLight: "text-[11px] mt-1 font-medium text-neutral-600 text-center leading-tight select-none", // Added select-none
    textNormalDark: "dark:text-neutral-300",

    dragging: "opacity-60 !shadow-xl ring-2 ring-rose-500 dark:ring-rose-400 scale-95",

    iconSizeNormal: "w-6 h-6", // 24px icon
    iconSizeZen: "w-5 h-5",    // 20px icon
    iconColorLight: "text-neutral-700",
    iconColorDark: "dark:text-neutral-200",
};

const DraggableTool = ({
    tool,       // Tool definition from itemConfigs.jsx
    itemType,   // This is tool.toolItemType, passed for useDrag type matching
    isZenMode,  // Boolean to adapt display
}) => {
    // The useDrag hook abstracts backend differences.
    // The `item` object here is the payload that gets passed on drop.
    const [{ isDragging }, dragRef, previewRef] = useDrag(() => ({
        type: itemType, // This should match tool.toolItemType
        item: { // This is the DND payload for when the tool is dropped onto a CanvasCell
            toolItemType: tool.toolItemType,
            createsPlacedItemType: tool.createsPlacedItemType, // Used by LayoutEditor to determine what to create
            w_major: tool.w_major,
            h_major: tool.h_major,
            size_identifier: tool.size_identifier,
            // Pass any other necessary properties from the tool definition
            // that useLayoutDesignerStateManagement's generateNewItemFromTool might need.
            label: tool.label, // e.g., for counters
            decorType: tool.decorType, // e.g., for decor items like 'plant' or 'rug'
            thickness_minor: tool.thickness_minor, // e.g., for walls
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
        // Optional: end(item, monitor) could be used to clear a custom drag preview if one were used globally,
        // but for simple tools, default previews are often sufficient.
    }));

    // Apply the drag source ref to the draggable element.
    // The previewRef can be used to attach to a custom drag preview element if needed.
    // For now, we let react-dnd handle the default preview generation.
    // dragRef(previewRef(outermostDivRef)); // If you wanted the div itself to be the preview source explicitly.
    // For simple cases, just dragRef is fine and react-dnd uses the element it's attached to.

    const containerSizeClass = isZenMode ? DRAGGABLE_TOOL_CLASSES.sizeZen : DRAGGABLE_TOOL_CLASSES.sizeNormal;
    const iconSizeClass = isZenMode ? DRAGGABLE_TOOL_CLASSES.iconSizeZen : DRAGGABLE_TOOL_CLASSES.iconSizeNormal;

    const displayName = tool.name.split('(')[0].trim(); // Simplified name for display

    return (
        <div
            ref={dragRef} // Apply the drag source ref here
            className={`
                ${DRAGGABLE_TOOL_CLASSES.containerBase}
                ${containerSizeClass}
                ${DRAGGABLE_TOOL_CLASSES.bgLight}
                ${DRAGGABLE_TOOL_CLASSES.bgDark}
                ${DRAGGABLE_TOOL_CLASSES.ringFocusLight}
                ${DRAGGABLE_TOOL_CLASSES.ringFocusDark}
                ${isDragging ? DRAGGABLE_TOOL_CLASSES.dragging : ''}
            `}
            title={isZenMode ? tool.name : `Drag to add ${tool.name}`}
            aria-label={`Add ${tool.name} tool`}
            tabIndex={0} // Make it focusable for keyboard navigation (though DND is primary interaction)
            role="button" // Semantically, it acts like a button that initiates a drag
        >
            <Icon
                name={tool.visual} // Material Icon name string
                className={`
                    ${iconSizeClass}
                    ${DRAGGABLE_TOOL_CLASSES.iconColorLight}
                    ${DRAGGABLE_TOOL_CLASSES.iconColorDark}
                    pointer-events-none  /* Ensure icon doesn't interfere with drag events on parent */
                `}
                aria-hidden="true"
            />

            {!isZenMode && (
                <span
                    className={`
                        ${DRAGGABLE_TOOL_CLASSES.textNormalLight}
                        ${DRAGGABLE_TOOL_CLASSES.textNormalDark}
                         pointer-events-none /* Ensure text doesn't interfere */
                    `}
                >
                    {displayName}
                </span>
            )}
        </div>
    );
};

export default DraggableTool;