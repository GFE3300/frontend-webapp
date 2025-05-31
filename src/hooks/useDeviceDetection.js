import { useState, useEffect } from 'react';

const DEFAULT_MOBILE_BREAKPOINT = 768;

export const useDeviceDetection = (breakpoint = DEFAULT_MOBILE_BREAKPOINT) => {
    const [isMobile, setIsMobile] = useState(() => {
        // Initial state calculation, ensuring window object is available
        if (typeof window !== 'undefined') {
            return window.innerWidth < breakpoint;
        }
        return false; // Default to false if window is not defined (e.g., SSR)
    });

    useEffect(() => {
        // Ensure window object is available before adding event listener
        if (typeof window === 'undefined') {
            return;
        }

        const handleResize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // Call the handler once on mount to set the correct initial state
        // in case the window size changed between the initial useState call and this effect.
        handleResize();

        window.addEventListener('resize', handleResize);

        // Cleanup function to remove the event listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [breakpoint]); // Re-run the effect if the breakpoint changes

    return { isMobile }; // Return as an object to match destructuring
};