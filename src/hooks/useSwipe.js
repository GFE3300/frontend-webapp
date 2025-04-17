// src/hooks/useSwipe.js
import { useEffect } from 'react';

/**
 * Enhanced swipe hook with device detection and direction awareness
 * @param {React.RefObject} ref - Target element reference
 * @param {Object} config - Configuration object
 * @param {Function} config.onSwipeUp - Called when valid upward swipe detected
 * @param {Function} config.onSwipeDown - Called when valid downward swipe detected
 * @param {number} [config.threshold=50] - Minimum pixels needed to consider it a swipe
 * @param {number} [config.directionLock=15] - Max horizontal deviation allowed for vertical swipes
 */

export default function useSwipe(ref, { onSwipeUp, onSwipeDown, threshold = 50, directionLock = 15 }) {
    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        let startY = 0;
        let startX = 0;
        let isVertical = false;

        const isMobile = () => window.matchMedia('(max-width: 640px)').matches;

        const handleTouchStart = (e) => {
            if (!isMobile()) return;

            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
            isVertical = false;
        };

        const handleTouchMove = (e) => {
            if (!isMobile()) return;

            const deltaX = e.touches[0].clientX - startX;
            const deltaY = e.touches[0].clientY - startY;

            // Lock direction after initial movement
            if (!isVertical && Math.abs(deltaY) > directionLock) {
                isVertical = true;
            }
        };

        const handleTouchEnd = (e) => {
            if (!isMobile()) return;

            const endY = e.changedTouches[0].clientY;
            const endX = e.changedTouches[0].clientX;
            const deltaY = endY - startY;
            const deltaX = endX - startX;

            // Only consider vertical swipes with minimal horizontal drift
            if (Math.abs(deltaX) > directionLock && !isVertical) return;

            if (deltaY < -threshold) {
                onSwipeUp?.();
            } else if (deltaY > threshold) {
                onSwipeDown?.();
            }
        };

        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchmove', handleTouchMove, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [ref, onSwipeUp, onSwipeDown, threshold, directionLock]);
}