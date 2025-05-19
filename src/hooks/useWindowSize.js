import { useState, useEffect } from 'react';

/**
 * useWindowSize
 *
 * Returns the current window width and height, updating on resize.
 *
 * @returns {{ width: number, height: number }}
 */
export default function useWindowSize() {
    // Initialize state with undefined so server-side rendering doesn't break
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });

    useEffect(() => {
        // Handler to call on window resize
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Call handler once to set initial size
        handleResize();

        // Clean up listener on unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty array ensures effect runs once on mount and cleanup on unmount

    return windowSize;
}
