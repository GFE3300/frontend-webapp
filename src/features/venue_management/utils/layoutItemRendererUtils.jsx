// features/venue_management/utils/layoutItemRendererUtils.jsx
import { ItemTypes, ITEM_CONFIGS } from '../constants/itemConfigs'; // ITEM_CONFIGS is already localized
import TableRenderer from '../subcomponents/layout_designer/item_renderers/TableRenderer';
import WallRenderer from '../subcomponents/layout_designer/item_renderers/WallRenderer';
import DoorRenderer from '../subcomponents/layout_designer/item_renderers/DoorRenderer';
import DecorRenderer from '../subcomponents/layout_designer/item_renderers/DecorRenderer';
import CounterRenderer from '../subcomponents/layout_designer/item_renderers/CounterRenderer';

// Localization
import slRaw, { interpolate } from './script_lines.js'; // Path relative to this file
const sl = slRaw.venueManagement.layoutItemRendererUtils;

const DefaultPreviewRenderer = ({ item }) => { // itemRotation removed as PlacedItem handles it
    const itemName = ITEM_CONFIGS[item.itemType]?.displayName || item.itemType || (sl.defaultPreviewRendererContentFallback || "Item");
    const itemIdShort = item.id?.substring(0, 5) || (sl.itemIdShortFallback || "N/A");
    const titleText = interpolate(sl.defaultPreviewRendererTitlePattern || "{itemName} (ID: {itemIdShort})", { itemName, itemIdShort });

    return (
        <div
            className="w-full h-full border border-dashed border-neutral-400/50 bg-neutral-200/30 flex items-center justify-center text-neutral-500/80 text-[0.6rem] p-0.5 text-center"
            title={titleText}
        >
            <span>{itemName}</span>
        </div>
    );
};


export const getRendererComponent = (itemType, decorType) => {
    // This function's logic doesn't change, it just returns components.
    // The components themselves are being localized.
    if (itemType === ItemTypes.PLACED_DECOR && decorType?.startsWith('counter-')) {
        return CounterRenderer;
    }
    const config = ITEM_CONFIGS[itemType]; // ITEM_CONFIGS is already localized
    const rendererKey = config?.PlacedComponent;
    switch (rendererKey) {
        case 'TableRenderer': return TableRenderer;
        case 'WallRenderer': return WallRenderer;
        case 'DoorRenderer': return DoorRenderer;
        case 'DecorRenderer': return DecorRenderer;
        case 'CounterRenderer': return CounterRenderer;
        default: return DefaultPreviewRenderer;
    }
};