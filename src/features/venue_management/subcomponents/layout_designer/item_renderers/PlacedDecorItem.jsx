// features/venue_management/subcomponents/layout_designer/item_renderers/PlacedDecorItem.jsx
import React, { useCallback } from 'react';
import Icon from '../../../../../components/common/Icon'; // Adjust path as per your project

const PlacedDecorItem = ({
    item, // Decor data: { id, shape, decorType, rotation, ... }
    onUpdateItemProperty,
    // onSelectItem, // Prop available from wrapper
}) => {

    const handleRotateClick = useCallback((e) => {
        e.stopPropagation();
        if (item?.id) {
            onUpdateItemProperty(item.id, { rotation: true });
        }
    }, [item?.id, onUpdateItemProperty]);

    let content;
    let itemStyle = {
        border: '1px dashed #cbd5e0', // Tailwind's gray-300
        backgroundColor: '#f7fafc',   // Tailwind's gray-100
    };
    const title = `Decor: ${item.decorType || item.shape}`;

    switch (item.decorType) {
        case 'plant-decor':
            content = <span className="text-2xl leading-none" role="img" aria-label="plant">🪴</span>;
            itemStyle.backgroundColor = '#c6f6d5'; // Tailwind's green-200
            itemStyle.border = '1px solid #68d391'; // Tailwind's green-400
            break;
        case 'counter-2x1':
            content = <span className="text-xxs text-orange-700">Counter</span>;
            itemStyle.backgroundColor = '#fed7a9'; // Tailwind's orange-200
            itemStyle.border = '1px solid #f6ad55'; // Tailwind's orange-400
            break;
        default:
            content = <span className="text-xxs text-gray-600">{item.shape || 'Decor'}</span>;
    }

    return (
        <div
            className="w-full h-full flex items-center justify-center relative group"
            style={itemStyle}
            title={title}
        >
            {content}
            {/* Rotate button - assuming decor items are rotatable */}
            <button
                onClick={handleRotateClick}
                className="absolute top-0.5 right-0.5 p-0.5 bg-gray-400 hover:bg-gray-500 text-white rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-5"
                title={`Rotate Decor`}
            >
                <Icon name="rotate_90_degrees_cw" className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
        </div>
    );
};

export default PlacedDecorItem;