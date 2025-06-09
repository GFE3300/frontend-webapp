import { useState, useEffect, useRef } from 'react';

function useThrottledValue(input, interval = 100) {
    const [throttled, setThrottled] = useState(input);
    const lastRef = useRef(Date.now());
    const timerRef = useRef();

    useEffect(() => {
        const now = Date.now();
        const elapsed = now - lastRef.current;

        if (elapsed >= interval) {
            // Enough time has passed: update immediately
            lastRef.current = now;
            setThrottled(input);
        } else {
            // Schedule a one-off update when the remaining time has passed
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                lastRef.current = Date.now();
                setThrottled(input);
            }, interval - elapsed);
        }

        // Cleanup on unmount/input change
        return () => clearTimeout(timerRef.current);
    }, [input, interval]);

    return throttled;
}

export default useThrottledValue;  