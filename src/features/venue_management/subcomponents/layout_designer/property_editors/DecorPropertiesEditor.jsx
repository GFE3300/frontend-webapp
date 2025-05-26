// features/venue_management/subcomponents/layout_designer/property_editors/DecorPropertiesEditor.jsx
import React from 'react';

const DecorPropertiesEditor = ({
    item, // The selected decor item object
    onUpdateItemProperty, // (itemId, { property: value }) => boolean
}) => {
    if (!item) return null;

    const handleLabelChange = (e) => {
        onUpdateItemProperty(item.id, { label: e.target.value });
    };

    return (
        <div className="space-y-4 p-1">
            {/* Example: Allow editing a label for decor items */}
            <div>
                <label htmlFor={`decor-label-${item.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                    Label (Optional):
                </label>
                <input
                    type="text"
                    id={`decor-label-${item.id}`}
                    name="label"
                    value={item.label || ''}
                    onChange={handleLabelChange}
                    placeholder="e.g., Bar, Service Counter"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>


            <div className="text-xs text-gray-600 space-y-1 mt-3 pt-3 border-t">
                <p><strong>ID:</strong> {item.id.substring(0, 10)}...</p>
                <p><strong>Decor Type:</strong> {item.decorType || item.shape || 'Generic Decor'}</p>
                <p><strong>Rotation:</strong> {item.rotation}°</p>
            </div>
        </div>
    );
};

export default DecorPropertiesEditor;