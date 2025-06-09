import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
    computeBarPoints,
    computeVectors,
    enrichVectors,
    drawVectors,
    drawCurves,
    drawDashedCurve
} from './GraphGenerator';

/**
 * Animated graph visualization component with dynamic data support
 * @component
 * @param {Object} props - Component properties
 * @param {Object} props.size - Container dimensions { width: number, height: number }
 * @param {number[]} props.graphBars - Array of metric values to visualize
 * @param {'default'|'dashed'} [props.design='default'] - Visual style variant
 * @param {boolean} [props.showVectors=false] - Debug mode for vector visualization
 * @param {number} [props.animationDuration=800] - Transition duration in milliseconds
 * @param {boolean} [props.reduce=false] - Data reduction flag for secondary views
 * @returns {JSX.Element} Canvas element with animated graph visualization
 */
export function GraphGeneratorAnimated({
    size = { width: 1000, height: 300 },
    graphBars = [5, 1, 3, 4, 2, 6, 1, 1, 3, 4, 5, 6],
    design = 'default',
    showVectors = false,
    animationDuration = 800,
    reduce = false
}) {
    // ---------------------------
    // Refs & State Management
    // ---------------------------
    const canvasRef = useRef(null);
    const animationFrame = useRef(null);
    const prevGraphBars = useRef(graphBars);
    const [currentBars, setCurrentBars] = useState(graphBars);
    const dpr = window.devicePixelRatio || 1;

    // ---------------------------
    // Data Processing & Memoization
    // ---------------------------

    /** 
     * Applies reduction transform if enabled 
     * @private
     */
    const processedBars = useMemo(() => (
        reduce ? graphBars.map(x => x * 0.5) : [...graphBars]
    ), [graphBars, reduce]);

    /** 
     * Detects meaningful data changes and updates state 
     * @private
     */
    useEffect(() => {
        if (prevGraphBars.current !== graphBars) {
            setCurrentBars(processedBars);
            prevGraphBars.current = graphBars;
        }
    }, [graphBars, processedBars]);

    // ---------------------------
    // Vector Calculations
    // ---------------------------

    /** 
     * Normalizes values to container height with fallback 
     * @private
     */
    const graphVectors = useMemo(() => {
        const maxValue = Math.max(...currentBars);
        return maxValue > size.height
            ? currentBars.map(x => (x / maxValue) * size.height)
            : [...currentBars];
    }, [currentBars, size.height]);

    // ---------------------------
    // Coordinate System Setup
    // ---------------------------

    /** 
     * Calculates visualization units based on current data 
     * @private
     */
    const units = useMemo(() => ({
        x: size.width / (graphVectors.length - 1 || 1), // Prevent division by zero
        y: 0.5 * size.height / (Math.max(...graphVectors) || 1) // Fallback for empty data
    }), [size.width, size.height, graphVectors]);

    // ---------------------------
    // Drawing Utilities
    // ---------------------------

    /** 
     * Main rendering routine for canvas updates 
     * @param {CanvasRenderingContext2D} ctx - Drawing context
     * @param {number[]} scaledBars - Current animation values
     * @private
     */
    const drawFrame = useCallback((ctx, scaledBars) => {
        // 1. Clear previous frame
        ctx.clearRect(0, 0, size.width, size.height);

        // 2. Generate visualization vectors
        const enriched = scaledBars.flatMap((_, i) => {
            const pts = computeBarPoints(i, scaledBars, units, size.height);
            return enrichVectors(computeVectors(pts));
        });

        // 3. Execute drawing operations
        if (showVectors) drawVectors(ctx, enriched);
        design === 'default'
            ? drawCurves(ctx, enriched, units, size)
            : drawDashedCurve(ctx, enriched, units, size);
    }, [units, size, showVectors, design]);

    // ---------------------------
    // Animation System
    // ---------------------------

    /** 
     * Manages canvas setup and animation lifecycle 
     * @private
     */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 1. Configure canvas dimensions
        canvas.width = size.width * dpr;
        canvas.height = size.height * dpr;
        canvas.style.width = `${size.width}px`;
        canvas.style.height = `${size.height}px`;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        // 2. Animation state variables
        let startTime = null;
        let progressBars = graphVectors.map(() => 0);

        /** 
         * Animation frame handler with spring physics 
         * @private
         */
        const animate = timestamp => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const t = Math.min(elapsed / animationDuration, 1);

            // 3. Interpolate values using spring-like animation
            progressBars = graphVectors.map((target, i) =>
                progressBars[i] + (target - progressBars[i]) * 0.1
            );

            // 4. Render current state
            drawFrame(ctx, progressBars);

            // 5. Continue animation until completion
            if (t < 1 || progressBars.some((v, i) =>
                Math.abs(v - graphVectors[i]) > 0.1)) {
                animationFrame.current = requestAnimationFrame(animate);
            }
        };

        // 6. Start new animation sequence
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = requestAnimationFrame(animate);

        return () => {
            // 7. Cleanup: Cancel pending animation frames
            cancelAnimationFrame(animationFrame.current);
        };
    }, [graphVectors, size, design, units, dpr, animationDuration, drawFrame]);

    return <canvas ref={canvasRef} className="animated-graph" />;
}

GraphGeneratorAnimated.propTypes = {
    size: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    graphBars: PropTypes.arrayOf(PropTypes.number),
    design: PropTypes.oneOf(['default', 'dashed']),
    showVectors: PropTypes.bool,
    animationDuration: PropTypes.number,
    reduce: PropTypes.bool
};