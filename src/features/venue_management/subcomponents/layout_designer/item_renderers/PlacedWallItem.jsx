// features/venue_management/subcomponents/layout_designer/item_renderers/PlacedWallItem.jsx
import React, { useCallback } from 'react';
import Icon from '../../../../../components/common/Icon'; // Adjust path as per your project

const PlacedWallItem = ({
    item, // Wall data: { id, shape, thickness_minor, rotation, ... }
    onUpdateItemProperty,
    // onSelectItem, // Prop available from wrapper
}) => {

    const handleRotateClick = useCallback((e) => {
        e.stopPropagation();
        if (item?.id) {
            onUpdateItemProperty(item.id, { rotation: true });
        }
    }, [item?.id, onUpdateItemProperty]);

    // Base style for the wall
    // The w_minor and h_minor from the item (via PlacedItemWrapper) already define its effective span.
    // thickness_minor could be used to adjust one of these if the wall is always 1 minor cell thick visually.
    // For now, assume w_minor/h_minor from the item's config and rotation handle its dimensions.
    const wallStyle = {
        backgroundColor: '#a0aec0', // Tailwind's gray-500
        border: '1px solid #718096', // Tailwind's gray-600
    };

    // The wrapper handles rotation transformation. This component renders as if rotation is 0.
    // If thickness_minor represents the actual width or height when oriented:
    // Example: If wall is always 1 minor cell thick, and its length is item.w_minor (when rotation 0)
    // const isHorizontal = item.rotation === 0 || item.rotation === 180;
    // wallStyle.height = isHorizontal ? `${item.thickness_minor * CELL_SIZE_REM_MINOR}rem` : '100%';
    // wallStyle.width = !isHorizontal ? `${item.thickness_minor * CELL_SIZE_REM_MINOR}rem` : '100%';
    // This kind of logic is complex and depends on how w_minor/h_minor are defined for walls in itemConfigs.
    // For Phase 1, we keep it simple: PlacedItemWrapper defines overall dimensions.
    // This renderer just fills that box.

    return (
        <div
            className="w-full h-full flex items-center justify-center relative group"
            style={wallStyle}
            title={`Wall: ${item.shape || 'Segment'}`}
        >
            {/* Visual distinction (optional) */}
            {/* <span className="text-xxs text-gray-700 select-none">Wall</span> */}

            {/* Rotate button - assuming walls are rotatable as per itemConfigs */}
            <button
                onClick={handleRotateClick}
                className="absolute top-0.5 right-0.5 p-0.5 bg-gray-500 hover:bg-gray-600 text-white rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-5"
                title={`Rotate Wall`}
            >
                <Icon name="rotate_90_degrees_cw" className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
        </div>
    );
};

export default PlacedWallItem;