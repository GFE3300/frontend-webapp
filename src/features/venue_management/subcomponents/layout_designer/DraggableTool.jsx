// features/venue_management/subcomponents/layout_designer/DraggableTool.jsx
import React from 'react';
import { useDrag } from 'react-dnd';
import Icon from '../../../../components/common/Icon'; // Assuming Icon component handles Material Icon names

// --- Design Guideline Variables (Tailwind classes for direct application) ---
// These should ideally be shared or imported if used by EditorToolbar as well,
// or defined locally if specific to this component's states.
// For simplicity, duplicating relevant parts here, but in a real system, consider a shared constant file.
const DRAGGABLE_TOOL_CLASSES = {
    containerBase: "flex flex-col font-montserrat items-center justify-center cursor-grab transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
    sizeNormal: "w-[72px] h-[72px] p-2 rounded-lg shadow-sm", // Slightly larger for better touch, refined padding
    sizeZen: "w-10 h-10 p-1.5 rounded-md shadow", // Smaller for Zen mode, icon only

    bgLight: "bg-neutral-50 hover:bg-neutral-100",
    bgDark: "dark:bg-neutral-700/50 dark:hover:bg-neutral-600/70",

    ringFocusLight: "focus-visible:ring-rose-500 focus-visible:ring-offset-white",
    ringFocusDark: "dark:focus-visible:ring-rose-400 dark:focus-visible:ring-offset-neutral-800",

    textNormalLight: "text-[11px] mt-1 font-medium text-neutral-600 text-center leading-tight", // Smaller, centered text
    textNormalDark: "dark:text-neutral-300",

    dragging: "opacity-60 !shadow-xl ring-2 ring-rose-500 dark:ring-rose-400 scale-95", // More pronounced dragging effect

    iconSizeNormal: "w-6 h-6", // 24px icon
    iconSizeZen: "w-5 h-5",    // 20px icon
    iconColorLight: "text-neutral-700",
    iconColorDark: "dark:text-neutral-200",
};
// --- End Design Guideline Variables ---

const DraggableTool = ({
    tool,       // Tool definition from itemConfigs.jsx
    // Expected: { name, toolItemType, createsPlacedItemType, w_major, h_major, size_identifier, category, visual (icon name) }
    itemType,   // This is tool.toolItemType, passed for useDrag type matching
    isZenMode,  // Boolean to adapt display
}) => {
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: itemType, // This matches tool.toolItemType
        item: { // This is the DND payload
            toolItemType: tool.toolItemType,
            createsPlacedItemType: tool.createsPlacedItemType,
            w_major: tool.w_major,
            h_major: tool.h_major,
            size_identifier: tool.size_identifier,
            // Include any other props from 'tool' that the drop target might need
            // For example, if defaultPropsFactory in useLayoutDesignerStateManagement
            // needs more info from the tool definition.
            // thickness_minor: tool.thickness_minor, // if applicable for walls etc.
            // decorType: tool.decorType,           // if applicable for decor
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    const containerSizeClass = isZenMode ? DRAGGABLE_TOOL_CLASSES.sizeZen : DRAGGABLE_TOOL_CLASSES.sizeNormal;
    const iconSizeClass = isZenMode ? DRAGGABLE_TOOL_CLASSES.iconSizeZen : DRAGGABLE_TOOL_CLASSES.iconSizeNormal;

    // Simplified name for display (e.g., "Square Table (1x1)" -> "Square Table")
    const displayName = tool.name.split('(')[0].trim();

    return (
        <div
            ref={dragRef}
            className={`
                ${DRAGGABLE_TOOL_CLASSES.containerBase}
                ${containerSizeClass}
                ${DRAGGABLE_TOOL_CLASSES.bgLight}
                ${DRAGGABLE_TOOL_CLASSES.bgDark}
                ${DRAGGABLE_TOOL_CLASSES.ringFocusLight}
                ${DRAGGABLE_TOOL_CLASSES.ringFocusDark}
                ${isDragging ? DRAGGABLE_TOOL_CLASSES.dragging : ''}
            `}
            title={isZenMode ? tool.name : `Drag to add ${tool.name}`} // Full name on tooltip in Zen
            aria-label={`Add ${tool.name} tool`}
            tabIndex={0} // Make it focusable
        >
            <Icon
                name={tool.visual} // Assumes tool.visual is a Material Icon name string
                className={`
                    ${iconSizeClass}
                    ${DRAGGABLE_TOOL_CLASSES.iconColorLight}
                    ${DRAGGABLE_TOOL_CLASSES.iconColorDark}
                `}
                aria-hidden="true" // Text label provides accessibility
            />

            {!isZenMode && (
                <span
                    className={`
                        ${DRAGGABLE_TOOL_CLASSES.textNormalLight}
                        ${DRAGGABLE_TOOL_CLASSES.textNormalDark}
                    `}
                >
                    {displayName}
                </span>
            )}
        </div>
    );
};

export default DraggableTool;