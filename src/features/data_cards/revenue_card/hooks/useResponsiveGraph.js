import { useState, useLayoutEffect } from 'react';
import useResizeObserver from '@react-hook/resize-observer';

export const useResponsiveGraph = (containerRef) => {
    const [size, setSize] = useState({ width: 0, height: 200 });
    const containerEl = containerRef?.current;

    // 1. Use library's optimized observer
    useResizeObserver(containerEl, (entry) => {
        const newWidth = Math.min(entry.contentRect.width, 1152);
        const newHeight = Math.min(newWidth * 0.6, 200);
        setSize(s => (
            (s.width === newWidth && s.height === newHeight)
                ? s
                : { width: newWidth, height: newHeight }
        ));
    });

    // 2. Initial measurement for SSR/SSG hydration
    useLayoutEffect(() => {
        if (!containerEl) return;
        const { width } = containerEl.getBoundingClientRect();
        const initialWidth = Math.min(width, 1152);
        setSize({ width: initialWidth, height: Math.min(initialWidth * 0.6, 200) });
    }, [containerEl]); 

    return size;
};