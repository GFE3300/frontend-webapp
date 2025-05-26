// features/venue_management/subcomponents/layout_designer/property_editors/TablePropertiesEditor.jsx
import React from 'react';
import Icon from '../../../../../components/common/Icon'; // Adjust path as necessary
import { ITEM_CONFIGS } from '../../../constants/itemConfigs'; // To check canHaveQr

const TablePropertiesEditor = ({
    item, // The selected table item object
    onUpdateItemProperty, // (itemId, { property: value }) => boolean
    getQrStatus,          // (itemId) => { url, loading, error }
    downloadSingleQr,     // (itemObject) => void
}) => {
    if (!item) return null;

    const handleSeatsChange = (e) => {
        const value = e.target.value;
        // Pass the raw string. Validation (e.g., must be number, >= 0) happens in useLayoutDesignerStateManagement
        onUpdateItemProperty(item.id, { seats: value === '' ? null : value });
    };

    const qrStatus = getQrStatus ? getQrStatus(item.id) : { url: null, loading: false, error: false };
    const itemConfig = ITEM_CONFIGS[item.itemType];

    return (
        <div className="space-y-4 p-1">
            <div>
                <label htmlFor={`seats-${item.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                    Number of Seats:
                </label>
                <input
                    type="text" // Using text to allow empty string, hook will parse/validate
                    id={`seats-${item.id}`}
                    name="seats"
                    value={item.seats ?? ''} // Handle null/undefined by showing empty string
                    onChange={handleSeatsChange}
                    placeholder="e.g., 4"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            {itemConfig?.canHaveQr && getQrStatus && downloadSingleQr && (
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">QR Code:</label>
                    <div className="flex items-center space-x-2">
                        <div className="p-1 border border-gray-300 rounded-md inline-block bg-white w-24 h-24 flex items-center justify-center overflow-hidden">
                            {qrStatus.loading && <Icon name="progress_activity" className="w-6 h-6 text-gray-400 animate-spin" />}
                            {!qrStatus.loading && qrStatus.url && qrStatus.url !== 'error' && !qrStatus.error && (
                                <img src={qrStatus.url} alt={`QR for Table ${item.number ?? item.id.substring(0, 5)}`} className="max-w-full max-h-full object-contain" />
                            )}
                            {!qrStatus.loading && (qrStatus.error || qrStatus.url === 'error') && (
                                <div className="text-center">
                                    <Icon name="error" className="w-6 h-6 text-red-400 mx-auto" />
                                    <span className="text-xxs text-red-500 block">Error</span>
                                </div>
                            )}
                            {!qrStatus.loading && !qrStatus.url && !qrStatus.error && qrStatus.url !== 'error' && (
                                <div className="text-center">
                                    <Icon name="qr_code_2" className="w-6 h-6 text-gray-300 mx-auto" />
                                    <span className="text-xxs text-gray-400 block">No QR (Set T.Number)</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => downloadSingleQr(item)}
                            title={`Download QR for Table ${item.number ?? item.id.substring(0, 5)}`}
                            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={qrStatus.loading || !qrStatus.url || qrStatus.error || qrStatus.url === 'error' || !item.number}
                        >
                            <Icon name="download" className="w-4 h-4" />
                        </button>
                    </div>
                    {!item.number && <p className="text-xxs text-amber-600 mt-1">Set a table number to generate its QR code.</p>}
                </div>
            )}

            {/* Display other read-only info if desired */}
            <div className="text-xs text-gray-600 space-y-1 mt-3 pt-3 border-t">
                <p><strong>ID:</strong> {item.id.substring(0, 10)}...</p>
                <p><strong>Shape:</strong> {item.shape}</p>
                <p><strong>Rotation:</strong> {item.rotation}°</p>
            </div>
        </div>
    );
};

export default TablePropertiesEditor;