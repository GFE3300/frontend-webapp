// features/venue_management/subcomponents/layout_designer/property_editors/WallPropertiesEditor.jsx
import React from 'react';

const WallPropertiesEditor = ({
    item, // The selected wall item object
    onUpdateItemProperty, // (itemId, { property: value }) => boolean
}) => {
    if (!item) return null;

    const handleThicknessChange = (e) => {
        const value = e.target.value;
        onUpdateItemProperty(item.id, { thickness_minor: value === '' ? null : parseInt(value, 10) || 1 });
    };

    // In Phase 2, if walls become resizable, you might add length/width displays or inputs here.
    // For now, length/width are primarily determined by their w_major/h_major from the tool & grid placement.

    return (
        <div className="space-y-4 p-1">
            <div>
                <label htmlFor={`wall-thickness-${item.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                    Wall Thickness (in minor cells):
                </label>
                <input
                    type="number"
                    id={`wall-thickness-${item.id}`}
                    name="thickness_minor"
                    value={item.thickness_minor ?? 1} // Default to 1 if not set
                    onChange={handleThicknessChange}
                    min="1" // Wall thickness should be at least 1 minor cell
                    max="4" // Arbitrary max, depends on your gridSubdivision logic
                    placeholder="e.g., 1"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            <div className="text-xs text-gray-600 space-y-1 mt-3 pt-3 border-t">
                <p><strong>ID:</strong> {item.id.substring(0, 10)}...</p>
                <p><strong>Shape/Type:</strong> {item.shape || 'Wall Segment'}</p>
                <p><strong>Rotation:</strong> {item.rotation}°</p>
                {/* Display effective length/width based on w_minor, h_minor and rotation */}
                <p><strong>Base W (minor):</strong> {item.w_minor}</p>
                <p><strong>Base H (minor):</strong> {item.h_minor}</p>
            </div>
        </div>
    );
};

export default WallPropertiesEditor;