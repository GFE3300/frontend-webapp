import React from 'react';
import Icon from '../../../../components/common/Icon'; // Adjusted path

// Utility to construct QR data, can be passed as a prop or imported if static enough
// For simplicity, let's assume it's passed if it has dynamic parts, or imported if not.
// import { constructQrDataValue } from '../../utils/commonUtils';

const LayoutDesignerSidebar = ({
    designedTables,        // Array of table objects
    getQrStatus,           // (tableId) => { url, loading, error }
    downloadSingleQr,      // (table) => void
    downloadAllQrs,        // (tables) => void
    onUpdateTableSeats,    // (tableId, newSeatsString) => boolean (returns true on success)
    // Optional: onUpdateTableNumber, if number editing is managed here
}) => {

    const sortedTables = [...designedTables]
        .filter(t => t && t.id) // Ensure table and id exist
        .sort((a, b) => (a.number || Infinity) - (b.number || Infinity));

    const handleSeatsChange = (tableId, value) => {
        onUpdateTableSeats(tableId, value);
        // The input will re-render with the new value from designedTables if successful,
        // or revert if onUpdateTableSeats returns false and handles state reversion.
    };

    return (
        <aside className="w-80 bg-slate-100 border-r border-slate-300 flex flex-col shadow-lg fixed top-0 left-0 h-full z-20">
            <div className="p-4 border-b border-slate-300">
                <h3 className="text-xl font-semibold text-indigo-700 tracking-tight">Table Properties</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {sortedTables.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center mt-4">No tables placed on the grid yet. Drag tools onto the grid to add tables.</p>
                ) : (
                    sortedTables.map(table => {
                        const qrStatus = getQrStatus(table.id) || { url: null, loading: false, error: false }; // Default if not found

                        return (
                            <div key={table.id} className="p-3 bg-white rounded-lg shadow border border-slate-200">
                                <h4 className="font-semibold text-indigo-600 mb-2">
                                    Table {table.number ?? 'N/A'}
                                    <span className="text-xs text-gray-500 ml-1">({table.size?.replace('-', ' ') ?? 'N/A'})</span>
                                </h4>

                                {/* Seats Input */}
                                <div className="mb-2">
                                    <label htmlFor={`seats-${table.id}`} className="block text-xs font-medium text-gray-700 mb-1">Seats:</label>
                                    <input
                                        type="number"
                                        id={`seats-${table.id}`}
                                        min="0"
                                        value={table.seats ?? ''}
                                        onChange={(e) => handleSeatsChange(table.id, e.target.value)}
                                        className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                {/* QR Code Display & Download */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">QR Code:</label>
                                    <div className="flex items-center space-x-2">
                                        <div className="p-1 border border-gray-300 rounded-md inline-block bg-white w-24 h-24 flex items-center justify-center overflow-hidden">
                                            {qrStatus.loading && <Icon name="progress_activity" className="w-6 h-6 text-gray-400 animate-spin" />}
                                            {!qrStatus.loading && qrStatus.url && qrStatus.url !== 'error' && !qrStatus.error && (
                                                <img src={qrStatus.url} alt={`QR for T${table.number ?? 'N/A'}`} className="max-w-full max-h-full object-contain" />
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
                                                    <span className="text-xxs text-gray-400 block">No QR</span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => downloadSingleQr(table)}
                                            title={`Download QR for Table ${table.number ?? 'N/A'}`}
                                            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs disabled:bg-gray-300 disabled:cursor-not-allowed"
                                            disabled={qrStatus.loading || !qrStatus.url || qrStatus.error || qrStatus.url === 'error'}
                                        >
                                            <Icon name="download" className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {/* Optional: Display QR data string for debugging */}
                                    {/* <p className="text-xxs text-gray-400 mt-1 truncate" title={constructQrDataValue(table)}>
                                        Data: {constructQrDataValue(table)}
                                    </p> */}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer Action: Download All QRs */}
            <div className="p-4 border-t border-slate-300 mt-auto">
                <button
                    onClick={() => downloadAllQrs(sortedTables)}
                    disabled={sortedTables.length === 0}
                    className="w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md flex items-center justify-center text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    <Icon name="qr_code_scanner" className="w-5 h-5 mr-2" /> Download All QR Codes
                </button>
            </div>
        </aside>
    );
};

export default LayoutDesignerSidebar;