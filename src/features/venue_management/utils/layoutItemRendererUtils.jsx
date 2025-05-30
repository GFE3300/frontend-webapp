import { ItemTypes, ITEM_CONFIGS } from '../constants/itemConfigs';
import TableRenderer from '../subcomponents/layout_designer/item_renderers/TableRenderer';
import WallRenderer from '../subcomponents/layout_designer/item_renderers/WallRenderer';
import DoorRenderer from '../subcomponents/layout_designer/item_renderers/DoorRenderer';
import DecorRenderer from '../subcomponents/layout_designer/item_renderers/DecorRenderer';
import CounterRenderer from '../subcomponents/layout_designer/item_renderers/CounterRenderer';

const DefaultPreviewRenderer = ({ item, itemRotation }) => (
    <div
        className="w-full h-full border border-dashed border-neutral-400/50 bg-neutral-200/30 flex items-center justify-center text-neutral-500/80 text-[0.6rem] p-0.5 text-center"
        style={{ transform: `rotate(${itemRotation}deg)`, transformOrigin: 'center center' }}
        title={`${ITEM_CONFIGS[item.itemType]?.displayName || item.itemType} (ID: ${item.id?.substring(0, 5) || 'N/A'})`}
    >
        <span>{ITEM_CONFIGS[item.itemType]?.displayName || item.itemType}</span>
    </div>
);


export const getRendererComponent = (itemType, decorType) => {
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
        default: return DefaultPreviewRenderer; // Use a slightly different default for preview
    }
};