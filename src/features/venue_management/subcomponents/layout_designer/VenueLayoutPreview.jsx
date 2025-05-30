import React, { useMemo, useEffect, useCallback } from 'react'; // Added useCallback

// Hooks
import useQrCodeManager from '../../hooks/useQrCodeManager';

// Common Components
import Icon from '../../../../components/common/Icon';

// Item Renderers
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
    // Check if it's a counter disguised as decor
    if (itemType === ItemTypes.PLACED_DECOR && decorType?.startsWith('counter-')) {
        return CounterRenderer;
    }
    // Check if it's a specific decor type that should use CounterRenderer
    // This might be redundant if decorType 'counter-something' implies ItemTypes.PLACED_COUNTER
    // but good as a safeguard if decorType is the primary differentiator for some counters.
    // Actual itemType PLACED_COUNTER will also map to CounterRenderer.

    const config = ITEM_CONFIGS[itemType];
    const rendererKey = config?.PlacedComponent;
    switch (rendererKey) {
        case 'TableRenderer': return TableRenderer;
        case 'WallRenderer': return WallRenderer;
        case 'DoorRenderer': return DoorRenderer;
        case 'DecorRenderer': return DecorRenderer;
        case 'CounterRenderer': return CounterRenderer;
        default:
            return ({ item, itemRotation }) => (
                <div
                    className="w-full h-full border border-dashed border-neutral-400 bg-neutral-200/50 flex items-center justify-center text-neutral-500 text-xxs p-0.5 text-center"
                    style={{ transform: `rotate(${itemRotation}deg)`, transformOrigin: 'center center' }}
                    title={`${config?.displayName || itemType} (ID: ${item.id?.substring(0, 5) || 'N/A'})`}
                >
                    <span>{config?.displayName || itemType}</span>
                </div>
            );
    }
};


const VenueLayoutPreview = ({ layoutData, openAlert, isZenMode }) => {
    // layoutData.designItems are now expected to be in FRONTEND format
    // layoutData.gridDimensions is { rows, cols, gridSubdivision }
    const { designItems, gridDimensions } = layoutData || { designItems: [], gridDimensions: {} };

    const {
        fetchQrCodeForTable,
        downloadSingleQr,
        downloadAllQrs,
        getQrStatus
    } = useQrCodeManager(openAlert);

    // Filter for tables that are valid for QR codes (have a number and are not provisional)
    // These items are already in frontend format.
    const tablesForQr = useMemo(
        () => (designItems || []).filter(item =>
            item.itemType === ItemTypes.PLACED_TABLE &&
            item.number &&
            !item.isProvisional
        ),
        [designItems]
    );

    // Fetch QR codes for all valid tables when the component mounts or tablesForQr change
    useEffect(() => {
        if (tablesForQr.length > 0) {
            tablesForQr.forEach(table => {
                const status = getQrStatus(table.id); // table.id is the frontend item ID
                if (!status.url && !status.loading && status.status !== 'skipped' && status.status !== 'error') {
                    fetchQrCodeForTable(table); // fetchQrCodeForTable expects a frontend-formatted table object
                }
            });
        }
    }, [tablesForQr, fetchQrCodeForTable, getQrStatus]);


    const totalMinorRows = useMemo(() => (gridDimensions.rows || 0) * (gridDimensions.gridSubdivision || 1), [gridDimensions]);
    const totalMinorCols = useMemo(() => (gridDimensions.cols || 0) * (gridDimensions.gridSubdivision || 1), [gridDimensions]);
    const minorCellSizeRem = useMemo(() => MAJOR_CELL_SIZE_REM / (gridDimensions.gridSubdivision || 1), [gridDimensions]);

    const previewGridStyle = useMemo(() => ({
        display: 'grid',
        gridTemplateRows: `repeat(${totalMinorRows}, ${minorCellSizeRem}rem)`,
        gridTemplateColumns: `repeat(${totalMinorCols}, ${minorCellSizeRem}rem)`,
        width: `${(gridDimensions.cols || 0) * MAJOR_CELL_SIZE_REM}rem`,
        height: `${(gridDimensions.rows || 0) * MAJOR_CELL_SIZE_REM}rem`,
        backgroundColor: 'var(--color-background-grid-preview, #f9fafb)', // Tailwind gray-50
        border: '1px solid var(--color-border-grid-preview, #e5e7eb)', // Tailwind gray-200
        borderRadius: '0.375rem',
        position: 'relative',
        margin: 'auto',
    }), [totalMinorRows, totalMinorCols, minorCellSizeRem, gridDimensions]);


    const handleDownloadAllQrs = useCallback(() => {
        if (tablesForQr.length === 0) {
            openAlert("No Tables", "There are no numbered tables to download QR codes for.", "info");
            return;
        }
        downloadAllQrs(tablesForQr); // Pass frontend-formatted tables
    }, [tablesForQr, downloadAllQrs, openAlert]);


    if (!designItems || !gridDimensions.rows || !gridDimensions.cols) {
        return (
            <div className="flex items-center justify-center h-full p-8 text-neutral-500 dark:text-neutral-400">
                No layout data to display or grid dimensions are invalid. Please design your layout first.
            </div>
        );
    }

    return (
        <div className={`flex h-full ${isZenMode ? 'flex-col' : 'flex-row'} overflow-hidden bg-neutral-100 dark:bg-neutral-900`}>
            <div className={`flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-auto ${isZenMode ? 'order-first' : ''}`}>
                <div style={previewGridStyle}>
                    {Array.from({ length: totalMinorRows }).flatMap((_, rIndex) =>
                        Array.from({ length: totalMinorCols }).map((_, cIndex) => {
                            const minorRow = rIndex + 1;
                            const minorCol = cIndex + 1;
                            const isMajorRBoundary = (minorRow % (gridDimensions.gridSubdivision || 1) === 0 && minorRow !== totalMinorRows);
                            const isMajorCBoundary = (minorCol % (gridDimensions.gridSubdivision || 1) === 0 && minorCol !== totalMinorCols);
                            return (
                                <div
                                    key={`preview-cell-${minorRow}-${minorCol}`}
                                    className={`border-neutral-200 dark:border-neutral-700/50
                                        ${isMajorRBoundary ? 'border-b-neutral-300 dark:border-b-neutral-600' : 'border-b'}
                                        ${isMajorCBoundary ? 'border-r-neutral-300 dark:border-r-neutral-600' : 'border-r'}
                                    `}
                                />
                            );
                        })
                    )}

                    {/* Render Kitchen Area if defined - assuming layoutData.kitchenArea exists and is frontend compatible */}
                    {/* This part needs to ensure kitchenArea coordinates are compatible with the grid system */}
                    {layoutData.kitchenArea && (
                        <div
                            style={{
                                gridRowStart: layoutData.kitchenArea.rowStart, // Assuming these are minor cell units
                                gridColumnStart: layoutData.kitchenArea.colStart,
                                gridRowEnd: `span ${layoutData.kitchenArea.rowEnd - layoutData.kitchenArea.rowStart + 1}`,
                                gridColumnEnd: `span ${layoutData.kitchenArea.colEnd - layoutData.kitchenArea.colStart + 1}`,
                                zIndex: 1,
                                pointerEvents: 'none',
                            }}
                            className="bg-slate-200/70 dark:bg-slate-700/70 border-2 border-dashed border-slate-400 dark:border-slate-500 rounded-md flex items-center justify-center"
                        >
                            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Kitchen</span>
                        </div>
                    )}

                    {designItems.map(item => { // designItems are now in frontend format
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
                                    zIndex: item.layer || 10, // Use item's layer, default to 10
                                }}
                                className="pointer-events-none"
                            >
                                <Renderer item={item} itemRotation={item.rotation || 0} isSelected={false} /* Preview items are not "selected" */ />
                            </div>
                        );
                    })}
                </div>
            </div>

            {!isZenMode && (
                <aside className="w-80 lg:w-96 h-full flex flex-col bg-white dark:bg-neutral-800 shadow-lg border-l border-neutral-200 dark:border-neutral-700">
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
                        <h2 className="font-montserrat font-semibold text-base text-neutral-800 dark:text-neutral-100">
                            Tables & QR Codes
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                        {tablesForQr.length > 0 ? tablesForQr.map(table => {
                            const qrStatus = getQrStatus(table.id); // Use frontend item ID
                            const qrImageUrl = qrStatus.url; // Already null if not a blob URL
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
                                                {table.seats || 'N/A'} Seats • {table.shape}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => downloadSingleQr(table)} // Pass frontend table object
                                            disabled={!qrImageUrl || isLoadingQr}
                                            className="p-1.5 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            title="Download QR Code"
                                        >
                                            <Icon name="download" className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="aspect-square w-full max-w-[150px] mx-auto bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center overflow-hidden">
                                        {isLoadingQr && <Icon name="progress_activity" className="w-8 h-8 text-neutral-400 dark:text-neutral-500 animate-spin" />}
                                        {qrImageUrl && !isLoadingQr && <img src={qrImageUrl} alt={`QR Code for Table ${table.number}`} className="w-full h-full object-contain" />}
                                        {qrError && !isLoadingQr && <Icon name="error" className="w-8 h-8 text-red-500" title="Error loading QR" />}
                                        {qrSkipped && !isLoadingQr && <Icon name="qr_code_scanner" className="w-8 h-8 text-neutral-400 dark:text-neutral-500 opacity-50" title="QR Generation Offline" />}
                                        {!qrImageUrl && !isLoadingQr && !qrError && !qrSkipped && <span className="text-xs text-neutral-400 dark:text-neutral-500">QR Pending</span>}
                                    </div>
                                    {qrError && <p className="text-center text-xxs text-red-500 dark:text-red-400 mt-1">Could not load QR.</p>}
                                    {qrSkipped && <p className="text-center text-xxs text-neutral-500 dark:text-neutral-400 mt-1">QR generation is unavailable.</p>}
                                </div>
                            );
                        }) : (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-10">
                                No numbered tables found in the layout. Add tables in Design Mode.
                            </p>
                        )}
                    </div>

                    {tablesForQr.length > 0 && (
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 shrink-0">
                            <button
                                onClick={handleDownloadAllQrs} // Uses tablesForQr (frontend format)
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