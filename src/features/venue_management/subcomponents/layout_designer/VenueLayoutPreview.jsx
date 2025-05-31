import React, { useMemo, useEffect, useCallback, useRef, useState } from 'react';
import Icon from '../../../../components/common/Icon';
import useQrCodeManager from '../../hooks/useQrCodeManager';
import { ITEM_CONFIGS, ItemTypes } from '../../constants/itemConfigs';
import { CELL_SIZE_REM as MAJOR_CELL_SIZE_REM, DEFAULT_GRID_SUBDIVISION } from '../../constants/layoutConstants';
import { getRendererComponent } from '../../utils/layoutItemRendererUtils';
import { useDeviceDetection } from '../../../../hooks/useDeviceDetection';
import { Weight } from 'lucide-react';

const DEBUG_MODE = import.meta.env.NODE_ENV === 'development';
const logDebug = (...args) => { if (DEBUG_MODE) { /* console.log("[VenueLayoutPreview DEBUG]", ...args); */ } };


const VenueLayoutPreview = ({ layoutData, openAlert, isZenMode }) => {
    const { designItems = [], gridDimensions = {} } = layoutData || {};
    const { rows = 0, cols = 0, gridSubdivision = DEFAULT_GRID_SUBDIVISION } = gridDimensions;

    const { isMobile } = useDeviceDetection(640); // Use the hook
    const [highlightedQrItemId, setHighlightedQrItemId] = useState(null);
    const qrListRef = useRef(null);

    const { fetchQrCodeForTable, downloadSingleQr, downloadAllQrs, getQrStatus } = useQrCodeManager(openAlert);

    const tablesForQr = useMemo(
        () => designItems.filter(item =>
            item.itemType === ItemTypes.PLACED_TABLE && item.number && !item.isProvisional
        ).sort((a, b) => (a.number || 0) - (b.number || 0)),
        [designItems]
    );

    useEffect(() => {
        if (tablesForQr.length > 0) {
            tablesForQr.forEach(table => {
                const status = getQrStatus(table.id);
                if (!status.url && !status.loading && status.status !== 'skipped' && status.status !== 'error') {
                    fetchQrCodeForTable(table);
                }
            });
        }
    }, [tablesForQr, getQrStatus, fetchQrCodeForTable]);


    const handleTableItemClickInGrid = useCallback((tableItem) => {
        logDebug(`Table ${tableItem.number} (ID: ${tableItem.id}) clicked in preview grid.`);
        if (isMobile && qrListRef.current) { // On mobile, scroll the QR list into view
            qrListRef.current.parentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        const targetElementId = `qr-item-${tableItem.id}`;
        const targetElement = qrListRef.current?.querySelector(`#${targetElementId}`);

        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedQrItemId(tableItem.id);
            setTimeout(() => setHighlightedQrItemId(null), 2500);
        } else {
            logDebug(`QR item element with ID ${targetElementId} not found in sidebar.`);
        }
    }, [isMobile]);

    const totalMinorRows = useMemo(() => rows * gridSubdivision, [rows, gridSubdivision]);
    const totalMinorCols = useMemo(() => cols * gridSubdivision, [cols, gridSubdivision]);
    const minorCellSizeRem = useMemo(() => MAJOR_CELL_SIZE_REM / gridSubdivision, [gridSubdivision]);

    // Determine zoom level based on device
    const effectiveZoomLevel = useMemo(() => {
        if (isMobile) return 0.4; // Smaller scale for mobile
        return 1.0; // Default scale for desktop
    }, [isMobile]);

    const previewGridStyle = useMemo(() => ({
        display: 'grid',
        gridTemplateRows: `repeat(${totalMinorRows}, ${minorCellSizeRem}rem)`,
        gridTemplateColumns: `repeat(${totalMinorCols}, ${minorCellSizeRem}rem)`,
        width: `${cols * MAJOR_CELL_SIZE_REM}rem`,
        height: `${rows * MAJOR_CELL_SIZE_REM}rem`,
        backgroundColor: 'var(--color-background-grid-preview, hsl(220 10% 98%))',
        border: '1px solid var(--color-border-grid-preview, hsl(220 10% 92%))',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.03), 0 1px 2px -1px rgba(0,0,0,0.03)',
        position: 'relative',
        margin: 'auto', // Keep centered for desktop
        transform: `scale(${effectiveZoomLevel})`, // Apply effective zoom
        transformOrigin: 'center center', // Scale from center for mobile top alignment
    }), [totalMinorRows, totalMinorCols, minorCellSizeRem, rows, cols, effectiveZoomLevel]);

    const handleDownloadAllQrsClick = useCallback(() => {
        if (tablesForQr.length === 0) {
            openAlert("No Tables", "There are no numbered tables to download QR codes for.", "info");
            return;
        }
        downloadAllQrs(tablesForQr);
    }, [tablesForQr, downloadAllQrs, openAlert]);

    if (!designItems || !rows || !cols) {
        return (
            <div className="flex flex-col font-montserrat items-center justify-center h-full p-8 text-neutral-500 dark:text-neutral-400 text-center">
                <Icon name="table_restaurant" className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mb-4" style={{ fontSize: '4rem' }} />
                <p className="font-semibold text-lg mb-2">Layout Preview Unavailable</p>
                <p>It seems there's no layout data to display, or grid dimensions are invalid. <br />Please design your layout in 'Design Mode' first.</p>
            </div>
        );
    }

    // Responsive classes for the main flex container
    const mainFlexContainerClasses = `
        flex h-full overflow-hidden
        ${isZenMode || isMobile ? 'flex-col' : 'flex-row'}
    `;

    // Responsive classes for the grid container
    const gridContainerClasses = `
        flex items-center justify-center overflow-auto
        ${isZenMode ? 'flex-1 p-4 md:p-6' : (isMobile ? 'h-auto p-4 pt-8' : 'flex-1 p-4 md:p-6')} 
    `; // Added pt-8 for mobile to push grid down slightly from header

    // Responsive classes for the QR aside
    const qrAsideClasses = `
        ${isZenMode ? 'hidden' : ''}
        ${isMobile ? 'w-full h-auto max-h-[60vh] min-h-[200px]' : 'w-72 lg:w-80 xl:w-[22rem] h-full'}
        flex flex-col 
        bg-white dark:bg-neutral-800 px-3 py-6
        border border-neutral-200/80 dark:border-neutral-700/60 shadow-lg
        rounded-4xl font-montserrat
        ${isMobile ? 'border-t mt-4' : 'border-l'} 
    `;


    return (
        <div className={mainFlexContainerClasses}>
            <div className={gridContainerClasses}>
                {/* On mobile, to ensure the scaled grid is at the top of its flex item, 
                    we wrap it and use flex-start alignment for the parent.
                    The grid itself uses transform-origin: center center to scale appropriately.
                */}
                <div className={`flex ${isMobile ? 'justify-center items-start w-full' : 'justify-center items-center'}`}>
                    <div style={previewGridStyle}>
                        {/* Grid Background Cells */}
                        {Array.from({ length: totalMinorRows }).flatMap((_, rIndex) =>
                            Array.from({ length: totalMinorCols }).map((_, cIndex) => {
                                const minorRow = rIndex + 1;
                                const minorCol = cIndex + 1;
                                const isMajorRBoundary = (minorRow % gridSubdivision === 0 && minorRow !== totalMinorRows);
                                const isMajorCBoundary = (minorCol % gridSubdivision === 0 && minorCol !== totalMinorCols);
                                return (
                                    <div
                                        key={`preview-cell-${minorRow}-${minorCol}`}
                                        className={`
                                          border-neutral-200/70 dark:border-neutral-700/40
                                          ${isMajorRBoundary ? 'border-b-neutral-300/70 dark:border-b-neutral-600/50' : 'border-b'}
                                          ${isMajorCBoundary ? 'border-r-neutral-300/70 dark:border-r-neutral-600/50' : 'border-r'}
                                      `}
                                    />
                                );
                            })
                        )}
                        {/* Placed Items */}
                        {designItems.map(item => {
                            if (!item?.gridPosition) return null;
                            const Renderer = getRendererComponent(item.itemType, item.decorType);
                            const isClickableTable = item.itemType === ItemTypes.PLACED_TABLE && item.number && !item.isProvisional;
                            return (
                                <div
                                    key={item.id}
                                    style={{
                                        position: 'absolute',
                                        top: `${(item.gridPosition.rowStart - 1) * minorCellSizeRem}rem`,
                                        left: `${(item.gridPosition.colStart - 1) * minorCellSizeRem}rem`,
                                        width: `${item.w_minor * minorCellSizeRem}rem`,
                                        height: `${item.h_minor * minorCellSizeRem}rem`,
                                        zIndex: item.layer || 10,
                                        cursor: isClickableTable ? 'pointer' : 'default',
                                    }}
                                    className={`transition-all duration-150 ease-in-out 
                                      ${isClickableTable ? 'group hover:ring-2 hover:ring-rose-500 dark:hover:ring-rose-400 hover:shadow-md rounded-sm md:rounded-lg' : ''}` // smaller rounding on mobile preview items
                                    }
                                    onClick={isClickableTable ? () => handleTableItemClickInGrid(item) : undefined}
                                    title={isClickableTable ? `Table ${item.number} - Click to see QR in sidebar` : (ITEM_CONFIGS[item.itemType]?.displayName || item.itemType)}
                                >
                                    <Renderer item={item} itemRotation={item.rotation || 0} isSelected={false} isPreviewMode={true} zoomLevel={effectiveZoomLevel} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <aside className={qrAsideClasses}>
                <div className="px-3.5 pb-4 border-b border-neutral-200/80 dark:border-neutral-700/60 shrink-0 flex items-center space-x-2">
                    <Icon name="qr_code_2" className="w-6 h-6 text-rose-500 dark:text-rose-400" />
                    <h2 className="font-montserrat font-semibold text-sm text-neutral-700 dark:text-neutral-100">
                        Table QR Codes
                    </h2>
                </div>

                <div ref={qrListRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scroll-smooth">
                    {tablesForQr.length > 0 ? tablesForQr.map(table => {
                        const qrStatus = getQrStatus(table.id);
                        const isHighlighted = table.id === highlightedQrItemId;
                        return (
                            <div
                                key={table.id}
                                id={`qr-item-${table.id}`}
                                className={`p-3 rounded-lg shadow-sm transition-all duration-300 ease-in-out
                                            bg-white dark:bg-neutral-700/50 
                                            border border-neutral-200/80 dark:border-neutral-600/50
                                            hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-500
                                            ${isHighlighted ? 'ring-2 ring-rose-500 dark:ring-rose-400 scale-[1.01] bg-rose-50/50 dark:bg-rose-500/10' : ''}`}
                            >
                                <div className="flex justify-between items-center mb-1.5">
                                    <div>
                                        <h3 className="font-semibold text-[0.8rem] text-neutral-700 dark:text-neutral-200">
                                            Table {table.number}
                                        </h3>
                                        <p className="text-[0.65rem] text-neutral-500 dark:text-neutral-400">
                                            {table.seats || 'N/A'} Seats • {table.shape}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => downloadSingleQr(table)}
                                        disabled={!qrStatus.url || qrStatus.loading || qrStatus.status === 'skipped' || qrStatus.status === 'error'}
                                        className="p-1 w-6 h-6 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        title="Download QR Code"
                                    >
                                        <Icon name="download" className="w-4 h-4" style={{ fontSize: '1rem' }} variations={{ fill: 0, weight: 600, opz:  }}/>
                                    </button>
                                </div>
                                <div className="aspect-square w-full max-w-[120px] mx-auto bg-neutral-100 dark:bg-neutral-600/40 rounded-md flex items-center justify-center overflow-hidden my-1">
                                    {qrStatus.loading && <Icon name="progress_activity" className="w-6 h-6 text-neutral-400 dark:text-neutral-500 animate-spin" />}
                                    {qrStatus.url && !qrStatus.loading && <img src={qrStatus.url} alt={`QR Code for Table ${table.number}`} className="w-full h-full object-contain p-1" />}
                                    {qrStatus.status === 'error' && !qrStatus.loading && <Icon name="error_outline" className="w-6 h-6 text-red-500" title="Error loading QR" />}
                                    {qrStatus.status === 'skipped' && !qrStatus.loading && <Icon name="qr_code" className="w-6 h-6 text-neutral-400 dark:text-neutral-500 opacity-60" title="QR Generation Offline" />}
                                    {!qrStatus.url && !qrStatus.loading && qrStatus.status !== 'error' && qrStatus.status !== 'skipped' && <span className="text-[0.65rem] text-neutral-400 dark:text-neutral-500 p-1">QR Pending</span>}
                                </div>
                                {qrStatus.status === 'error' && <p className="text-center text-[0.65rem] text-red-500 dark:text-red-400 mt-0.5">Could not load.</p>}
                                {qrStatus.status === 'skipped' && <p className="text-center text-[0.65rem] text-neutral-500 dark:text-neutral-400 mt-0.5">Unavailable.</p>}
                            </div>
                        );
                    }) : (
                        <div className="text-center text-neutral-400 dark:text-neutral-500 py-10 px-3">
                            <Icon name="no_food" className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-3 mx-auto" />
                            <p className="font-medium text-sm mb-1">No Tables for QR Codes</p>
                            <p className="text-xs">Switch to 'Design Mode' to add tables to your layout and assign them numbers.</p>
                        </div>
                    )}
                </div>

                {tablesForQr.length > 0 && (
                    <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-700/60 shrink-0">
                        <button
                            onClick={handleDownloadAllQrsClick}
                            className="w-full flex items-center justify-center px-3 py-2 bg-rose-500 text-white text-xs font-medium rounded-md shadow hover:bg-rose-600 transition-colors
                                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800"
                        >
                            <Icon name="file_download" className="w-4 h-4 mr-1.5" style={{ fontSize: '1rem' }} />
                            Download All QRs
                        </button>
                    </div>
                )}
            </aside>
        </div>
    );
};

export default VenueLayoutPreview;