import React, { useRef, useState, useLayoutEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Link } from 'react-router-dom';

// Import the existing, tested renderers from the venue management feature
import TableRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/TableRenderer';
import WallRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/WallRenderer';
import DoorRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/DoorRenderer';
import DecorRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/DecorRenderer';
import CounterRenderer from '../../venue_management/subcomponents/layout_designer/item_renderers/CounterRenderer';

// Import the refined overlay component
import TableStatusOverlay from './TableStatusOverlay';

// Import i18n text
import { scriptLines_liveOrders } from '../utils/script_lines';

const itemRenderers = {
    'placedTable': TableRenderer,
    'placedWall': WallRenderer,
    'placedDoor': DoorRenderer,
    'placedDecor': DecorRenderer,
    'placedCounter': CounterRenderer,
};

/**
 * Renders the static venue layout and overlays live table status information on top.
 * This component is now fully responsive and scales its content to fit the container.
 * @param {{
 *   layoutData: object,
 *   liveDataMap: Object.<string, object>,
 *   onSelectTable: (layoutItemId: string) => void
 * }} props
 */
const VenueLayoutDisplay = ({ layoutData, liveDataMap, onSelectTable }) => {
    const { user } = useAuth();
    const containerRef = useRef(null);
    // --- REFINED: Default cell size is just an initial value ---
    const [scaledCellSize, setScaledCellSize] = useState(16);

    if (!layoutData || !layoutData.items || layoutData.items.length === 0) {
        const canConfigure = user?.role === 'ADMIN' || user?.role === 'MANAGER';
        return (
            <div className="flex items-center justify-center h-full p-4 text-center text-gray-500 dark:text-gray-400">
                <div>
                    <p className="font-semibold">{scriptLines_liveOrders.noLayoutConfiguredTitle}</p>
                    <p className="text-sm mt-2">{scriptLines_liveOrders.noLayoutConfiguredBody}</p>
                    {canConfigure && (
                        <Link to="/dashboard/business/venue-designer" className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline">
                            Go to Venue Designer
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    const { grid_rows, grid_cols, grid_subdivision } = layoutData;

    // --- NEW: Adaptive scaling with ResizeObserver ---
    useLayoutEffect(() => {
        const calculateSize = (entries) => {
            if (!containerRef.current) return;

            const entry = entries[0];
            const { width, height } = entry.contentRect;

            // p-4 on the container is 1rem (16px) per side -> 32px total
            const padding = 32;
            const availableWidth = width - padding;
            const availableHeight = height - padding;

            if (grid_cols > 0 && grid_rows > 0) {
                const cellSizeFromWidth = availableWidth / grid_cols;
                const cellSizeFromHeight = availableHeight / grid_rows;

                // Use the smaller of the two to maintain aspect ratio and fit within the container
                const newCellSize = Math.floor(Math.min(cellSizeFromWidth, cellSizeFromHeight));
                setScaledCellSize(newCellSize > 0 ? newCellSize : 1); // Ensure size is at least 1px
            }
        };

        const resizeObserver = new ResizeObserver(calculateSize);
        const currentRef = containerRef.current;
        if (currentRef) {
            resizeObserver.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                resizeObserver.unobserve(currentRef);
            }
        };
    }, [grid_cols, grid_rows]); // Rerun effect if the grid dimensions change

    // --- REFINED: Grid style now uses dynamic values for responsive rendering ---
    const gridStyle = {
        display: 'grid',
        gridTemplateRows: `repeat(${grid_rows * grid_subdivision}, ${scaledCellSize / grid_subdivision}px)`,
        gridTemplateColumns: `repeat(${grid_cols * grid_subdivision}, ${scaledCellSize / grid_subdivision}px)`,
        position: 'relative',
        width: `${grid_cols * scaledCellSize}px`,
        height: `${grid_rows * scaledCellSize}px`,
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg overflow-hidden"
        >
            <div style={gridStyle}>
                {layoutData.items.map(item => {
                    const Renderer = itemRenderers[item.item_type];
                    if (!Renderer) return null;

                    const itemStyle = {
                        gridColumnStart: item.grid_col_start,
                        gridColumnEnd: `span ${item.w_minor}`,
                        gridRowStart: item.grid_row_start,
                        gridRowEnd: `span ${item.h_minor}`,
                        position: 'relative', // Necessary for the absolute overlay
                    };

                    const isTable = item.item_type === 'placedTable';
                    const tableLiveData = isTable ? liveDataMap[item.id] : null;

                    return (
                        <div key={item.id} style={itemStyle}>
                            <Renderer item={item} cellSize={scaledCellSize} isPreview={true} />
                            {isTable && (
                                <TableStatusOverlay
                                    tableStaticData={item}
                                    tableLiveData={tableLiveData}
                                    onSelect={() => onSelectTable(item.id)}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VenueLayoutDisplay;