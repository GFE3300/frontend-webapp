// features/venue_management/subcomponents/layout_designer/TablePropertiesSidebar.jsx
import React from 'react';
import TablePropertyEntry from './TablePropertyEntry';
import Icon from '../../../../components/common/Icon'; // Adjust path as necessary

const TablePropertiesSidebar = ({
    designedTables,
    getQrStatus,
    onUpdateTableSeats,
    // onUpdateTableNumber, // Handled by PlacedItem
    onDownloadSingleQr,
    onDownloadAllQrs,
    // fetchQrCodeForTable // This is usually triggered internally or by PlacedItem/LayoutDesigner logic
}) => {
    const validTables = designedTables.filter(t => t && t.id);

    return (
        <aside className="w-80 bg-slate-100 border-r border-slate-300 flex flex-col shadow-lg fixed top-0 left-0 h-full z-20">
            <div className="p-4 border-b border-slate-300">
                <h3 className="text-xl font-semibold text-indigo-700 tracking-tight">Table Properties</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {validTables.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center mt-4">No tables placed on the grid yet.</p>
                ) : (
                    validTables
                        .sort((a, b) => (a.number || Infinity) - (b.number || Infinity))
                        .map(table => (
                            <TablePropertyEntry
                                key={table.id}
                                table={table}
                                qrStatus={getQrStatus(table.id)}
                                onUpdateTableSeats={onUpdateTableSeats}
                                onDownloadSingleQr={onDownloadSingleQr}
                            />
                        ))
                )}
            </div>
            <div className="p-4 border-t border-slate-300 mt-auto">
                <button
                    onClick={() => onDownloadAllQrs(designedTables)}
                    disabled={validTables.length === 0}
                    className="w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md flex items-center justify-center text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed">
                    <Icon name="qr_code_scanner" className="w-5 h-5 mr-2" /> Download All QR Codes
                </button>
            </div>
        </aside>
    );
};

export default TablePropertiesSidebar;