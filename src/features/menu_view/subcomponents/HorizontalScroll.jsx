// frontend/src/features/menu_view/subcomponents/HorizontalScroll.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

function HorizontalScroll({ children, className = "" }) {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
    const shouldReduceMotion = useReducedMotion();

    // Memoized function to calculate drag constraints.
    // Relies on refs, so it doesn't need external dependencies.
    const calculateConstraints = useCallback(() => {
        if (containerRef.current && contentRef.current) {
            const containerNode = containerRef.current;
            const contentNode = contentRef.current;

            const containerVisibleWidth = containerNode.clientWidth;
            // scrollWidth includes padding of the contentNode and the width of its content (including gaps from space-x)
            const contentTotalWidth = contentNode.scrollWidth;

            // The right constraint is the negative difference if content is wider, or 0.
            const rightConstraint = Math.min(0, containerVisibleWidth - contentTotalWidth);

            // console.log(
            //     `[HorizontalScroll DEBUG] Time: ${new Date().toLocaleTimeString()}.${String(new Date().getMilliseconds()).padStart(3, '0')}`,
            //     `containerVisibleWidth: ${containerVisibleWidth}, contentTotalWidth: ${contentTotalWidth}, rightConstraint: ${rightConstraint}`
            // );

            setDragConstraints(prev => {
                // Only update state if constraints actually changed to prevent unnecessary re-renders
                if (prev.right !== rightConstraint || prev.left !== 0) {
                    return { left: 0, right: rightConstraint };
                }
                return prev;
            });
        }
    }, []); // Empty dependency array as it only uses refs and stable setters

    // Effect to setup ResizeObservers and initial calculation.
    useEffect(() => {
        // Initial calculation on mount.
        // requestAnimationFrame ensures layout is stable before the first calculation.
        const animationFrameId = requestAnimationFrame(calculateConstraints);

        const observers = [];
        const containerNode = containerRef.current;
        const contentNode = contentRef.current;

        // Observe container for size changes (e.g., window resize)
        if (containerNode) {
            const containerObserver = new ResizeObserver(calculateConstraints);
            containerObserver.observe(containerNode);
            observers.push(containerObserver);
        }
        // Observe content for size changes (e.g., items loading, images resizing content)
        if (contentNode) {
            const contentObserver = new ResizeObserver(calculateConstraints);
            contentObserver.observe(contentNode);
            observers.push(contentObserver);
        }

        // Recalculate on window resize as a fallback / general case
        window.addEventListener('resize', calculateConstraints);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', calculateConstraints);
            observers.forEach(obs => obs.disconnect());
        };
    }, [calculateConstraints]); // calculateConstraints is stable due to useCallback([])

    // Recalculate constraints if children prop changes, as this directly impacts contentWidth.
    useEffect(() => {
        calculateConstraints();
    }, [children, calculateConstraints]);


    // dragTransition for a more natural "swipe" feel
    const dragTransitionConfig = shouldReduceMotion
        ? { duration: 0.01 } // Essentially disable animation for reduced motion
        : { power: 0.12, timeConstant: 280, bounceStiffness: 250, bounceDamping: 25 }; // Adjusted for a slightly softer stop

    return (
        <div
            ref={containerRef}
            className={`overflow-x-hidden cursor-grab active:cursor-grabbing ${className}`}
            style={{ minWidth: 0 }} // Prevents flex item from shrinking parent in some cases
        >
            <motion.div
                ref={contentRef}
                className="flex items-start space-x-4 pb-4 pl-4 pr-4" // Keeps existing padding & spacing
                drag="x"
                dragConstraints={dragConstraints}
                dragMomentum={!shouldReduceMotion} // Enable momentum if not reduced motion
                dragTransition={dragTransitionConfig}
            >
                {children}
            </motion.div>
        </div>
    );
}

export default HorizontalScroll;