// features/venue_management/subcomponents/layout_designer/property_editors/DoorPropertiesEditor.jsx
import React from 'react';

const DoorPropertiesEditor = ({
    item, // The selected door item object
    onUpdateItemProperty, // (itemId, { property: value }) => boolean
}) => {
    if (!item) return null;

    const handleSwingChange = (e) => {
        onUpdateItemProperty(item.id, { swingDirection: e.target.value });
    };

    const handleOpenStateChange = (e) => {
        onUpdateItemProperty(item.id, { isOpen: e.target.checked });
    };

    return (
        <div className="space-y-4 p-1">
            <div>
                <label htmlFor={`door-swing-${item.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                    Swing Direction:
                </label>
                <select
                    id={`door-swing-${item.id}`}
                    name="swingDirection"
                    value={item.swingDirection || 'left'}
                    onChange={handleSwingChange}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="left">Left Swing</option>
                    <option value="right">Right Swing</option>
                    {/* Add more options if needed e.g., 'double', 'sliding' in future */}
                </select>
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id={`door-open-${item.id}`}
                    name="isOpen"
                    checked={!!item.isOpen}
                    onChange={handleOpenStateChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor={`door-open-${item.id}`} className="ml-2 block text-xs font-medium text-gray-700">
                    Visually Open
                </label>
            </div>

            <div className="text-xs text-gray-600 space-y-1 mt-3 pt-3 border-t">
                <p><strong>ID:</strong> {item.id.substring(0, 10)}...</p>
                <p><strong>Type:</strong> {item.shape || 'Standard Door'}</p>
                <p><strong>Rotation:</strong> {item.rotation}°</p>
            </div>
        </div>
    );
};

export default DoorPropertiesEditor;