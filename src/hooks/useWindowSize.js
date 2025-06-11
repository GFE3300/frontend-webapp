import { useState, useEffect } from 'react';

/**
 * A custom React hook that tracks the browser window's dimensions.
 * It provides a real-time width and height, debouncing the updates for performance.
 *
 * @returns {{width: number, height: number}} An object containing the current window width and height.
 */
export const useWindowSize = () => {
    // Initialize state with current window size, or defaults for SSR environments.
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

    useEffect(() => {
        // Handler to call on window resize
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Call handler right away so state gets updated with initial window size
        handleResize();

        // Cleanup function to remove the event listener
        // This is crucial to prevent memory leaks when the component unmounts.
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty array ensures effect is only run on mount and unmount

    return windowSize;
};

export default useWindowSize;