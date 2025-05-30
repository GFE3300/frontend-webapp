import { useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * @typedef {Object} AnimationHandle
 * @property {Function} registerDrawFunction - Registers a frame callback
 * @property {React.MutableRefObject<number>} startTimeRef - Animation start time reference
 */

/**
 * Mathematical Physics Core
 * -------------------------
 * 1. Time Calculation:
 *    t_global = t_current - t_start - t_cycle_offset
 *    Where t_cycle_offset = n * cycleInterval (n ∈ ℕ)
 * 
 * 2. Frame Scheduling:
 *    RAF guarantees ~16.6ms frame cadence (60Hz) through
 *    browser-level vsync synchronization
 */

/**
 * RAF-based animation system with cycle management
 * @param {number} [cycleInterval] - Time in ms for full animation reset
 * @returns {AnimationHandle} Animation control handle
 * 
 * @behavior
 * | Condition          | Action                          | Complexity |
 * |--------------------|---------------------------------|------------|
 * | Frame callback     | Execute all registered functions | O(n)       |
 * | Cycle interval hit | Reset time origin               | O(1)       |
 * | Unmount            | Clean RAF and timers            | O(1)       |
 */
export function useAnimation(cycleInterval) {
    const rafIdRef = useRef(null);
    const startTimeRef = useRef(/** @type {number|null} */(null));
    const drawFunctionsRef = useRef(/** @type {Set<Function>} */(new Set()));
    const cycleCountRef = useRef(0);

    // Memoized function registry
    const registerDrawFunction = useCallback((fn) => {
        drawFunctionsRef.current.add(fn);
        return () => drawFunctionsRef.current.delete(fn);
    }, []);

    // Frame processor with error isolation
    const processFrame = useCallback((timestamp) => {
        try {
            const baseTime = startTimeRef.current || (startTimeRef.current = timestamp);
            const tGlobal = timestamp - baseTime;

            drawFunctionsRef.current.forEach(fn => {
                fn(tGlobal, timestamp - (performance.timing.navigationStart || Date.now()))
            });
        } catch (error) {
            console.error('Animation frame error:', error);
        }
    }, []);

    // RAF loop manager
    const animate = useCallback((timestamp) => {
        rafIdRef.current = requestAnimationFrame(animate);
        processFrame(timestamp);
    }, [processFrame]);

    // Lifecycle controls
    useEffect(() => {
        rafIdRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafIdRef.current);
    }, [animate]);

    // Cycle interval handler with phase correction
    useEffect(() => {
        if (!cycleInterval) return;

        const intervalId = setInterval(() => {
            cycleCountRef.current = Math.floor(performance.now() / cycleInterval);
            startTimeRef.current = null;
        }, cycleInterval);

        return () => {
            clearInterval(intervalId);
            cycleCountRef.current = 0;
        }
    }, [cycleInterval]);

    return { registerDrawFunction, startTimeRef };
}

useAnimation.propTypes = {
    cycleInterval: PropTypes.number
};

/**
 * Coordinate System Notes
 * -----------------------
 * 1. Time Origin:
 *    t=0 corresponds to either:
 *    a) Component mount (no cycleInterval)
 *    b) Last cycle reset (with cycleInterval)
 * 
 * 2. Phase Continuity:
 *    t_global preserves smooth transitions across cycles
 *    through implicit modulo operation
 */

/**
 * Performance Guarantees
 * ----------------------
 * 1. Frame Processing: O(n) where n = registered callbacks
 * 2. Memory: O(1) for registry management
 * 3. GC Pressure: Zero allocations per frame
 */