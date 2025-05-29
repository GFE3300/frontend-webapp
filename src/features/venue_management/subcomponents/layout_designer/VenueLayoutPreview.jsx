import React, { useMemo, useEffect } from 'react';

// Hooks
import useQrCodeManager from '../../hooks/useQrCodeManager'; // For QR code generation and management

// Common Components
import Icon from '../../../../components/common/Icon';

// Item Renderers (Simplified for Preview - or reuse existing if they adapt well to read-only)
// For now, we'll use basic div representations, but these could be more sophisticated.
import TableRenderer from './item_renderers/TableRenderer';
import WallRenderer from './item_renderers/WallRenderer';
import DoorRenderer from './item_renderers/DoorRenderer';
import DecorRenderer from './item_renderers/DecorRenderer';
import CounterRenderer from './item_renderers/CounterRenderer';

// Constants
import { CELL_SIZE_REM as MAJOR_CELL_SIZE_REM } from '../../constants/layoutConstants';
import { ITEM_CONFIGS, ItemTypes } from '../../constants/itemConfigs';


// Helper to get the specific renderer component
const getRendererComponent = (itemType, decorType) => {
    if (itemType === ItemTypes.PLACED_DECOR && decorType?.startsWith('counter-')) {
        return CounterRenderer;
    }
    const config = ITEM_CONFIGS[itemType];
    const rendererKey = config?.PlacedComponent;
    switch (rendererKey) {
        case 'TableRenderer': return TableRenderer;
        case 'WallRenderer': return WallRenderer;
        case 'DoorRenderer': return DoorRenderer;
        case 'DecorRenderer': return DecorRenderer;
        case 'CounterRenderer': return CounterRenderer;
        default:
            return ({ item, itemRotation }) => ( // Basic fallback preview renderer
                <div
                    className="w-full h-full border border-dashed border-neutral-400 bg-neutral-200/50 flex items-center justify-center text-neutral-500 text-xxs p-0.5 text-center"
                    style={{ transform: `rotate(${itemRotation}deg)`, transformOrigin: 'center center' }}
                    title={`${config?.displayName || itemType} (ID: ${item.id.substring(0, 5)})`}
                >
                    <span>{config?.displayName || itemType}</span>
                </div>
            );
    }
};


const VenueLayoutPreview = ({ layoutData, openAlert, isZenMode }) => {
    const { designItems, gridDimensions, kitchenArea } = layoutData;
    const { qrImageUrls, qrLoadingStates, fetchQrCodeForTable, downloadSingleQr, downloadAllQrs, getQrStatus } = useQrCodeManager(openAlert);

    const tables = useMemo(
        () => (designItems || []).filter(item => item.itemType === ItemTypes.PLACED_TABLE && item.number && !item.isProvisional),
        [designItems]
    );

    // Fetch QR codes for all valid tables when the component mounts or tables change
    useEffect(() => {
        tables.forEach(table => {
            const status = getQrStatus(table.id);
            // Fetch if not already fetched, not loading, and not skipped/errored (unless we want to retry errors)
            if (!status.url && !status.loading && status.status !== 'skipped' && status.status !== 'error') {
                fetchQrCodeForTable(table); // Default colors for now
            }
        });
    }, [tables, fetchQrCodeForTable, getQrStatus]);


    // Grid rendering logic (similar to EditorCanvas but read-only)
    const totalMinorRows = useMemo(() => gridDimensions.rows * gridDimensions.gridSubdivision, [gridDimensions]);
    const totalMinorCols = useMemo(() => gridDimensions.cols * gridDimensions.gridSubdivision, [gridDimensions]);
    const minorCellSizeRem = useMemo(() => MAJOR_CELL_SIZE_REM / gridDimensions.gridSubdivision, [gridDimensions]);

    const previewGridStyle = useMemo(() => ({
        display: 'grid',
        gridTemplateRows: `repeat(${totalMinorRows}, ${minorCellSizeRem}rem)`,
        gridTemplateColumns: `repeat(${totalMinorCols}, ${minorCellSizeRem}rem)`,
        width: `${gridDimensions.cols * MAJOR_CELL_SIZE_REM}rem`,
        height: `${gridDimensions.rows * MAJOR_CELL_SIZE_REM}rem`,
        backgroundColor: 'var(--color-background-grid-preview, #f3f4f6)', // Lighter gray for preview
        border: '1px solid var(--color-border-grid-preview, #e5e7eb)',
        borderRadius: '0.375rem', // Tailwind 'rounded-md'
        position: 'relative',
        margin: 'auto', // Center the grid
        // Add zoom transformation if needed, though preview mode might not need zoom
    }), [totalMinorRows, totalMinorCols, minorCellSizeRem, gridDimensions]);


    const handleDownloadAllQrs = () => {
        if (tables.length === 0) {
            openAlert("No Tables", "There are no numbered tables to download QR codes for.", "info");
            return;
        }
        downloadAllQrs(tables); // Pass only tables with numbers
    };


    if (!designItems) {
        return (
            <div className="flex items-center justify-center h-full p-8 text-neutral-500">
                No layout data to display. Please design your layout first.
            </div>
        );
    }

    return (
        <div className={`flex h-full ${isZenMode ? 'flex-col' : 'flex-row'} overflow-hidden bg-neutral-50 dark:bg-neutral-950`}>
            {/* Main Preview Area (Grid) */}
            <div className={`flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-auto ${isZenMode ? 'order-first' : ''}`}>
                <div style={previewGridStyle}>
                    {/* Render static minor grid lines (optional, could be a background image too) */}
                    {Array.from({ length: totalMinorRows }).flatMap((_, rIndex) =>
                        Array.from({ length: totalMinorCols }).map((_, cIndex) => {
                            const minorRow = rIndex + 1;
                            const minorCol = cIndex + 1;
                            const isMajorRBoundary = (minorRow % gridDimensions.gridSubdivision === 0 && minorRow !== totalMinorRows);
                            const isMajorCBoundary = (minorCol % gridDimensions.gridSubdivision === 0 && minorCol !== totalMinorCols);
                            return (
                                <div
                                    key={`preview-cell-${minorRow}-${minorCol}`}
                                    className={`border-neutral-200 dark:border-neutral-800/70
                                        ${isMajorRBoundary ? 'border-b-neutral-300 dark:border-b-neutral-700' : 'border-b'}
                                        ${isMajorCBoundary ? 'border-r-neutral-300 dark:border-r-neutral-700' : 'border-r'}
                                    `}
                                />
                            );
                        })
                    )}

                    {/* Render Kitchen Area if defined */}
                    {kitchenArea && (
                        <div
                            style={{
                                gridRowStart: kitchenArea.rowStart,
                                gridColumnStart: kitchenArea.colStart,
                                gridRowEnd: `span ${kitchenArea.rowEnd - kitchenArea.rowStart + 1}`,
                                gridColumnEnd: `span ${kitchenArea.colEnd - kitchenArea.colStart + 1}`,
                                zIndex: 1,
                                pointerEvents: 'none',
                            }}
                            className="bg-slate-200/70 dark:bg-slate-700/70 border-2 border-dashed border-slate-400 dark:border-slate-500 rounded-md flex items-center justify-center"
                        >
                            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Kitchen</span>
                        </div>
                    )}

                    {/* Render Placed Design Items (Read-Only) */}
                    {designItems.map(item => {
                        if (!item || !item.gridPosition) return null;
                        const Renderer = getRendererComponent(item.itemType, item.decorType);
                        return (
                            <div
                                key={item.id}
                                style={{
                                    position: 'absolute',
                                    top: `${(item.gridPosition.rowStart - 1) * minorCellSizeRem}rem`,
                                    left: `${(item.gridPosition.colStart - 1) * minorCellSizeRem}rem`,
                                    width: `${item.w_minor * minorCellSizeRem}rem`,
                                    height: `${item.h_minor * minorCellSizeRem}rem`,
                                    zIndex: 10, // Ensure items are above grid lines
                                    // transform: `rotate(${item.rotation || 0}deg)`, // Rotation handled by renderer now
                                    // transformOrigin: 'center center',
                                }}
                                className="pointer-events-none" // Items are not interactive in preview
                            >
                                <Renderer item={item} itemRotation={item.rotation || 0} /* Pass rotation */ />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Table List & QR Management Sidebar (unless in Zen mode) */}
            {!isZenMode && (
                <aside className="w-80 lg:w-96 h-full flex flex-col bg-white dark:bg-neutral-800 shadow-lg border-l border-neutral-200 dark:border-neutral-700">
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
                        <h2 className="font-montserrat font-semibold text-base text-neutral-800 dark:text-neutral-100">
                            Tables & QR Codes
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                        {tables.length > 0 ? tables.map(table => {
                            const qrStatus = getQrStatus(table.id);
                            const qrImageUrl = qrStatus.url && qrStatus.status !== 'skipped' && qrStatus.status !== 'error' ? qrStatus.url : null;
                            const isLoadingQr = qrStatus.loading;
                            const qrError = qrStatus.status === 'error';
                            const qrSkipped = qrStatus.status === 'skipped';

                            return (
                                <div key={table.id} className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-600/50">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-sm text-neutral-700 dark:text-neutral-200">
                                                Table {table.number}
                                            </h3>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {table.seats} Seats • {table.shape}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => downloadSingleQr(table)}
                                            disabled={!qrImageUrl || isLoadingQr}
                                            className="p-1.5 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            title="Download QR Code"
                                        >
                                            <Icon name="download" className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="aspect-square w-full max-w-[150px] mx-auto bg-neutral-100 dark:bg-neutral-600 rounded flex items-center justify-center">
                                        {isLoadingQr && <Icon name="progress_activity" className="w-8 h-8 text-neutral-400 animate-spin" />}
                                        {qrImageUrl && !isLoadingQr && <img src={qrImageUrl} alt={`QR Code for Table ${table.number}`} className="w-full h-full object-contain rounded" />}
                                        {qrError && !isLoadingQr && <Icon name="error" className="w-8 h-8 text-red-500" title="Error loading QR" />}
                                        {qrSkipped && !isLoadingQr && <Icon name="qr_code_scanner" className="w-8 h-8 text-neutral-400 opacity-50" title="QR Generation Offline" />}
                                        {!qrImageUrl && !isLoadingQr && !qrError && !qrSkipped && <span className="text-xs text-neutral-400">QR Pending</span>}
                                    </div>
                                    {qrSkipped && <p className="text-center text-xxs text-neutral-500 dark:text-neutral-400 mt-1">QR generation is offline.</p>}
                                </div>
                            );
                        }) : (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-10">
                                No numbered tables found in the layout. Add tables in Design Mode.
                            </p>
                        )}
                    </div>

                    {tables.length > 0 && (
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 shrink-0">
                            <button
                                onClick={handleDownloadAllQrs}
                                className="w-full flex items-center justify-center px-4 py-2.5 bg-rose-500 text-white text-sm font-medium rounded-lg shadow-md hover:bg-rose-600 transition-colors
                                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800"
                            >
                                <Icon name="collections" className="w-4 h-4 mr-2" />
                                Download All Table QRs
                            </button>
                        </div>
                    )}
                </aside>
            )}
        </div>
    );
};

export default VenueLayoutPreview;