// src/components/HorizontalScrollContainer.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

function HorizontalScroll({ children, className = "" }) {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

    const calculateConstraints = useCallback(() => {
        if (containerRef.current && contentRef.current) {
            const containerNode = containerRef.current;
            const contentNode = contentRef.current;

            const containerVisibleWidth = containerNode.clientWidth;
            const contentTotalWidth = contentNode.scrollWidth;

            const newDebug = {
                timestamp: new Date().toLocaleTimeString(),
                containerClientWidth: containerVisibleWidth,
                contentScrollWidth: contentTotalWidth,
                containerPadding: `${getComputedStyle(containerNode).paddingLeft} ${getComputedStyle(containerNode).paddingRight}`,
                contentPadding: `${getComputedStyle(contentNode).paddingLeft} ${getComputedStyle(contentNode).paddingRight}`,
                calculatedRight: Math.min(0, containerVisibleWidth - contentTotalWidth),
            };

            const rightConstraint = Math.min(0, containerVisibleWidth - contentTotalWidth);

            setDragConstraints(prev => {
                if (prev.right !== rightConstraint || prev.left !== 0) {
                    return { left: 0, right: rightConstraint };
                }
                return prev;
            });
        }
    }, []); // Memoizada, sin dependencias externas directas (usa refs)

    useEffect(() => {
        const animationFrameId = requestAnimationFrame(calculateConstraints);

        const observers = [];
        if (containerRef.current) {
            const obs = new ResizeObserver(calculateConstraints);
            obs.observe(containerRef.current);
            observers.push(obs);
        }
        if (contentRef.current) {
            const obs = new ResizeObserver(calculateConstraints);
            obs.observe(contentRef.current);
            observers.push(obs);
            // Opcional: si los hijos directos cambian de tamaño sin afectar el scrollWidth
        }

        window.addEventListener('resize', calculateConstraints); // Para cambios de viewport

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', calculateConstraints);
            observers.forEach(obs => obs.disconnect());
        };
    }, [children, calculateConstraints]);

    useEffect(() => {
        if(children) { // Solo si hay children
            const timerId = setTimeout(calculateConstraints, 50); // Pequeño delay
            return () => clearTimeout(timerId);
        }
    }, [children, calculateConstraints]);


    return (
        <>
            <div
                ref={containerRef}
                className={`overflow-x-hidden cursor-grab active:cursor-grabbing ${className}`}
                style={{ minWidth: 0 }}
            >
                <motion.div
                    ref={contentRef}
                    className="flex items-start space-x-4 pb-4 pl-4 pr-4"
                    drag="x"
                    dragConstraints={dragConstraints}
                >
                    {children}
                </motion.div>
            </div>
        </>
    );
}

export default HorizontalScroll;