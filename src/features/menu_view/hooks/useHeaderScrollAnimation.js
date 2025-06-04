import { useState, useEffect } from 'react';
import { useScroll, useReducedMotion } from 'framer-motion';

const DEFAULT_HEADER_ANIMATION_DURATION = 0.3; // seconds

/**
 * Custom hook to manage the scroll-based hide/reveal animation for a header element.
 *
 * @param {number} scrollThreshold - The scroll distance (in px) after which the header starts to hide.
 * @param {number} [animationDuration=0.3] - Duration of the hide/reveal animation in seconds.
 * @returns {{
 *  headerTargetY: string, // Target 'y' position for the header ('0%' or '-100%')
 *  headerTransition: object // Framer Motion transition object
 * }}
 */
export const useHeaderScrollAnimation = (scrollThreshold, animationDuration = DEFAULT_HEADER_ANIMATION_DURATION) => {
    const { scrollY } = useScroll();
    const shouldReduceMotion = useReducedMotion();

    const [isScrollingDown, setIsScrollingDown] = useState(false);
    const [prevScrollY, setPrevScrollY] = useState(0);

    useEffect(() => {
        // Store the unsubscribe function
        const unsubscribeScrollY = scrollY.onChange((latest) => {
            if (latest > prevScrollY && latest > scrollThreshold) {
                setIsScrollingDown(true);
            } else if (latest < prevScrollY) {
                setIsScrollingDown(false);
            }
            setPrevScrollY(latest);
        });

        // Cleanup function to unsubscribe
        return () => {
            unsubscribeScrollY();
        };
    }, [scrollY, prevScrollY, scrollThreshold]);

    const headerTargetY = (shouldReduceMotion || !(isScrollingDown && scrollY.get() > scrollThreshold))
        ? "0%"  // Show header
        : "-100%"; // Hide header

    const headerTransition = shouldReduceMotion
        ? { type: "tween", duration: 0.01, ease: "linear" } // Virtually instant for reduced motion
        : { type: "tween", ease: "easeInOut", duration: animationDuration };

    return {
        headerTargetY,
        headerTransition,
    };
};