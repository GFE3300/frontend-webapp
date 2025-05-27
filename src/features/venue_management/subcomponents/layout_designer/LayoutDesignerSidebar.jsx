// features/venue_management/subcomponents/layout_designer/LayoutDesignerSidebar.jsx
import React from 'react';
import Icon from '../../../../components/common/Icon';
import { ITEM_CONFIGS, ItemTypes } from '../../constants/itemConfigs'; // Import ITEM_CONFIGS and ItemTypes

// Import all specific property editors
import TablePropertiesEditor from './property_editors/TablePropertiesEditor';
import WallPropertiesEditor from './property_editors/WallPropertiesEditor';
import DoorPropertiesEditor from './property_editors/DoorPropertiesEditor';
import DecorPropertiesEditor from './property_editors/DecorPropertiesEditor';

// Fallback component if no specific editor is found
const DefaultPropertiesEditor = ({ item }) => (
    <div className="p-3 bg-white rounded-lg shadow border border-slate-200">
        <h4 className="font-semibold text-gray-700 mb-2">
            Properties for: {item?.shape || item?.itemType || 'Selected Item'}
        </h4>
        <p className="text-sm text-gray-500">
            No specific editor configured for this item type ({item?.itemType}).
        </p>
        <pre className="text-xs bg-gray-50 p-2 rounded-md mt-2 overflow-auto">
            {JSON.stringify(item, null, 2)}
        </pre>
    </div>
);


const LayoutDesignerSidebar = ({
    designItems,          // Array of all design item objects
    selectedItemId,       // ID of the currently selected item
    onUpdateItemProperties, // Generic: (itemId, { property: value }) => boolean

    // QR related props, primarily for tables, but passed generically
    getQrStatus,          // (itemId) => { url, loading, error }
    downloadSingleQr,     // (itemObject) => void
    downloadAllQrs,       // (arrayOfItemObjects) => void
}) => {

    const selectedItem = designItems.find(item => item.id === selectedItemId);

    // --- Component Dispatch Logic for Sidebar Editor ---
    let SpecificEditorComponent = DefaultPropertiesEditor; // Fallback
    let editorKey = null;

    if (selectedItem && selectedItem.itemType && ITEM_CONFIGS[selectedItem.itemType]) {
        editorKey = ITEM_CONFIGS[selectedItem.itemType].SidebarEditorComponent;
    }

    switch (editorKey) {
        case 'TablePropertiesEditor':
            SpecificEditorComponent = TablePropertiesEditor;
            break;
        case 'WallPropertiesEditor':
            SpecificEditorComponent = WallPropertiesEditor;
            break;
        case 'DoorPropertiesEditor':
            SpecificEditorComponent = DoorPropertiesEditor;
            break;
        case 'DecorPropertiesEditor':
            SpecificEditorComponent = DecorPropertiesEditor;
            break;
        // No default case needed here, as SpecificEditorComponent is already DefaultPropertiesEditor
    }

    const handleDownloadAllQrs = () => {
        const itemsEligibleForQr = designItems.filter(item => {
            const config = ITEM_CONFIGS[item.itemType];
            if (!config || !config.canHaveQr) return false;
            // Specifically for tables, ensure they have a number to be valid for QR
            if (item.itemType === ItemTypes.PLACED_TABLE && (typeof item.number !== 'number' || item.number <= 0)) {
                return false;
            }
            return true;
        });
        if (itemsEligibleForQr.length > 0) {
            downloadAllQrs(itemsEligibleForQr);
        } else {
            // Optionally, inform the user if no items are eligible (e.g., via an alert)
            console.log("No items eligible for QR code download.");
        }
    };

    const canDownloadAnyQr = designItems.some(item => {
        const config = ITEM_CONFIGS[item.itemType];
        if (!config || !config.canHaveQr) return false;
        if (item.itemType === ItemTypes.PLACED_TABLE && (typeof item.number !== 'number' || item.number <= 0)) {
            return false;
        }
        return true;
    });

    return (
        <aside className="w-80 bg-slate-100 border-r border-slate-300 flex flex-col shadow-lg fixed top-0 left-0 h-full z-20">
            <div className="p-4 border-b border-slate-300">
                <h3 className="text-xl font-semibold text-indigo-700 tracking-tight">
                    {selectedItem && ITEM_CONFIGS[selectedItem.itemType]
                        ? `${ITEM_CONFIGS[selectedItem.itemType].displayName} Properties`
                        : 'Item Properties'}
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedItem ? (
                    <SpecificEditorComponent
                        item={selectedItem}
                        onUpdateItemProperty={onUpdateItemProperties}
                        // Pass QR props if the specific editor needs them (e.g., TablePropertiesEditor)
                        // Other editors will simply ignore these props if not destructured.
                        getQrStatus={getQrStatus}
                        downloadSingleQr={downloadSingleQr} // downloadSingleQr expects the item object
                    />
                ) : (
                    <p className="text-sm text-gray-500 text-center mt-4">
                        {designItems.length > 0
                            ? 'Select an item on the grid to see its properties.'
                            : 'No items placed. Drag tools onto the grid to add items.'}
                    </p>
                )}
            </div>

            {/* Footer Action: Download All QRs */}
            {/* Only show if there are any design items and at least one type can have QR */}
            {designItems.length > 0 && Object.values(ITEM_CONFIGS).some(config => config.canHaveQr) && (
                <div className="p-4 border-t border-slate-300 mt-auto">
                    <button
                        onClick={handleDownloadAllQrs}
                        disabled={!canDownloadAnyQr}
                        className="w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md flex items-center justify-center text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <Icon name="qr_code_scanner" className="w-5 h-5 mr-2" /> Download All Valid QRs
                    </button>
                </div>
            )}
        </aside>
    );
};

export default LayoutDesignerSidebar;