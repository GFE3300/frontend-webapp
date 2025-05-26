import React from 'react';
import { useDrag } from 'react-dnd';

// ItemTypes would typically be imported from a constants file, e.g., '../../utils/layoutConstants'
// For now, we assume itemType prop is passed correctly structured.

const DraggableGenericTool = ({ tool, itemType }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: itemType, // This should match the accept type in DroppableGridCell
        item: { type: tool.type, w: tool.w, h: tool.h, size: tool.size, itemType: itemType /* may not be needed if type implies it */ },
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }));

    return (
        <div
            ref={drag}
            className={`p-2 border rounded-xl flex flex-col items-center cursor-grab transition-all shadow-sm ${isDragging ? 'opacity-50 ring-2 ring-indigo-400' : 'bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700'
                }`}
            title={`Drag to add ${tool.name}`}
        >
            {tool.visual}
            <span className="text-xs mt-1 text-gray-600">{tool.name}</span>
        </div>
    );
};

export default DraggableGenericTool;