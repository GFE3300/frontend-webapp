// features/venue_management/subcomponents/layout_designer/property_editors/DecorPropertiesEditor.jsx
import React from 'react';

const DecorPropertiesEditor = ({
    item,
    onUpdateItemProperty,
    // gridSubdivision, // <-- Potentially needed if calculating units display here
}) => {
    if (!item) return null;

    const handleLabelChange = (e) => {
        onUpdateItemProperty(item.id, { label: e.target.value });
    };

    const isCounter = item.decorType && item.decorType.startsWith('counter-');

    // For displaying current length units, we need a consistent way to get base unit size.
    // This logic should ideally mirror what's in useLayoutDesignerStateManagement or be derived from item's base properties.
    // For simplicity, let's assume item.length_units is now reliably stored on the item.
    const currentLengthUnits = item.length_units || 1;


    const handleLengthChange = (e) => {
        const newLength = e.target.value; // Pass as string, let hook parse
        if (newLength === '' || (!isNaN(parseInt(newLength, 10)) && parseInt(newLength, 10) > 0)) {
            onUpdateItemProperty(item.id, { length: newLength === '' ? '1' : newLength }); // Send 'length' prop
        } else if (newLength !== '' && parseInt(newLength, 10) <= 0) {
            // Optionally show an inline error or rely on hook's alert
            onUpdateItemProperty(item.id, { length: '1' }); // Reset to 1 if invalid
        }
    };


    return (
        <div className="space-y-4 p-1">
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

            {isCounter && (
                <div>
                    <label htmlFor={`counter-length-${item.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                        Length (Units):
                    </label>
                    <input
                        type="number"
                        id={`counter-length-${item.id}`}
                        name="length_units"
                        value={currentLengthUnits} // Display from item.length_units
                        onChange={handleLengthChange}
                        min="1"
                        placeholder="e.g., 2"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            )}

            <div className="text-xs text-gray-600 space-y-1 mt-3 pt-3 border-t">
                <p><strong>ID:</strong> {item.id.substring(0, 10)}...</p>
                <p><strong>Decor Type:</strong> {item.decorType || item.shape || 'Generic Decor'}</p>
                <p><strong>Rotation:</strong> {item.rotation}°</p>
                {isCounter && (
                    <>
                        <p><strong>Stored Length Units:</strong> {item.length_units || 'N/A'}</p>
                        <p><strong>Actual w_minor:</strong> {item.w_minor}</p>
                        <p><strong>Actual h_minor:</strong> {item.h_minor}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default DecorPropertiesEditor;