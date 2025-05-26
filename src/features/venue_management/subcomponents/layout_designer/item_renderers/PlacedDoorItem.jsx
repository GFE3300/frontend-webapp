// features/venue_management/subcomponents/layout_designer/item_renderers/PlacedDoorItem.jsx
import React, { useCallback } from 'react';
import Icon from '../../../../../components/common/Icon'; // Adjust path as per your project

const PlacedDoorItem = ({
    item, // Door data: { id, shape, swingDirection, isOpen, rotation, ... }
    onUpdateItemProperty,
    // onSelectItem, // Prop available from wrapper
}) => {

    const handleRotateClick = useCallback((e) => { // Doors might rotate to align with walls
        e.stopPropagation();
        if (item?.id) {
            onUpdateItemProperty(item.id, { rotation: true });
        }
    }, [item?.id, onUpdateItemProperty]);

    // Simplified visual for a door
    // The PlacedItemWrapper handles the main rotation.
    // Swing direction and open state can be visualized here relative to the door's local orientation.
    const doorPanelStyle = {
        position: 'absolute',
        backgroundColor: '#a0522d', // Sienna
        border: '1px solid #8b4513', // SaddleBrown
        width: item.rotation === 90 || item.rotation === 270 ? '15%' : '80%', // Thinner if vertical in local space
        height: item.rotation === 90 || item.rotation === 270 ? '80%' : '15%', // Shorter if horizontal in local space
        // Position based on swing:
        left: (item.rotation === 0 || item.rotation === 180) ? (item.swingDirection === 'left' ? '5%' : 'auto') : 'center',
        right: (item.rotation === 0 || item.rotation === 180) ? (item.swingDirection === 'right' ? '5%' : 'auto') : 'auto',
        top: (item.rotation === 90 || item.rotation === 270) ? (item.swingDirection === 'left' /* assuming left=top for vertical */ ? '5%' : 'auto') : 'center', // Adjust logic for vertical swing
        bottom: (item.rotation === 90 || item.rotation === 270) ? (item.swingDirection === 'right' /* assuming right=bottom for vertical */ ? '5%' : 'auto') : 'auto',
        transformOrigin: item.swingDirection === 'left' ? 'left center' : 'right center', // Simplified
        // transform: item.isOpen ? (item.swingDirection === 'left' ? 'rotateY(-70deg)' : 'rotateY(70deg)') : 'none', // 3D effect
        transition: 'transform 0.3s ease',
    };
    if (item.rotation === 90 || item.rotation === 270) { // Vertical door in local space
        doorPanelStyle.transformOrigin = item.swingDirection === 'left' ? 'center top' : 'center bottom';
        // doorPanelStyle.transform = item.isOpen ? (item.swingDirection === 'left' ? 'rotateX(70deg)' : 'rotateX(-70deg)') : 'none';
    }


    return (
        <div
            className="w-full h-full border-2 border-transparent relative group" // Transparent border for spacing, or door frame
            title={`Door: ${item.shape}, Swing: ${item.swingDirection}`}
        >
            {/* Door Frame (optional visual) */}
            <div className="absolute inset-0 border border-gray-400"></div>
            {/* Door Panel */}
            <div style={doorPanelStyle}></div>

            {/* Rotate button - assuming doors are rotatable as per itemConfigs */}
            <button
                onClick={handleRotateClick}
                className="absolute top-0.5 right-0.5 p-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-5"
                title={`Rotate Door`}
            >
                <Icon name="rotate_90_degrees_cw" className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
        </div>
    );
};

export default PlacedDoorItem;