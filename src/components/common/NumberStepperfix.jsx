import React, { useRef, useEffect, useCallback } from 'react';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

const PRESS_AND_HOLD_INTERVAL_MS = 200; // Speed for press-and-hold
const GHOST_CLICK_GUARD_MS = 400;    // How long after a touchstart to ignore mousedown

export default function NumberStepper({
    label,
    min,
    max,
    value,
    onChange,
    labelClassName = 'text-gray-800 text-sm font-semibold',
}) {
    const intervalRef = useRef(null);
    // This ref, when true, indicates that a touch event has just processed
    // and any mousedown events within GHOST_CLICK_GUARD_MS should be ignored.
    const touchActiveGuardRef = useRef(false);
    const touchActiveGuardTimerRef = useRef(null);

    // Refs for props to use in callbacks, avoiding stale closures
    const valueRef = useRef(value);
    useEffect(() => { valueRef.current = value; }, [value]);
    const minRef = useRef(min);
    useEffect(() => { minRef.current = min; }, [min]);
    const maxRef = useRef(max);
    useEffect(() => { maxRef.current = max; }, [max]);
    const onChangeRef = useRef(onChange);
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

    const performChange = useCallback((delta) => {
        let currentValue = valueRef.current;
        let nextValue = currentValue + delta;
        if (nextValue < minRef.current) nextValue = minRef.current;
        if (nextValue > maxRef.current) nextValue = maxRef.current;

        if (nextValue !== currentValue) {
            // console.log(`performChange: value=${currentValue} -> ${nextValue} (delta: ${delta})`);
            onChangeRef.current(nextValue);
            return true; // Indicates a change was made
        }
        // console.log(`performChange: NO CHANGE (value=${currentValue}, delta=${delta})`);
        return false; // No change made
    }, []); // Uses refs

    const stopInterval = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const handleInteractionStart = useCallback((delta, event) => {
        // console.log(`--- InteractionStart: type=${event.type}, touchActiveGuard=${touchActiveGuardRef.current}`);

        if (event.type === 'mousedown' && touchActiveGuardRef.current) {
            // If this is a mousedown and the touch guard is active, ignore this event.
            // console.log("Mousedown IGNORED (touch guard active)");
            event.preventDefault();
            return;
        }

        if (event.type === 'touchstart') {
            event.preventDefault(); // CRUCIAL: Prevent ghost mousedown, scroll, etc.
            touchActiveGuardRef.current = true;
            // console.log("Touchstart: Guard ACTIVE");

            // Clear any existing timer for the guard
            if (touchActiveGuardTimerRef.current) {
                clearTimeout(touchActiveGuardTimerRef.current);
            }
            // Set a new timer to deactivate the guard
            touchActiveGuardTimerRef.current = setTimeout(() => {
                touchActiveGuardRef.current = false;
                // console.log("Guard TIMEOUT: Guard INACTIVE");
            }, GHOST_CLICK_GUARD_MS);
        }

        // Boundary check
        const currentVal = valueRef.current;
        const currentMin = minRef.current;
        const currentMax = maxRef.current;
        if ((delta < 0 && currentVal <= currentMin) || (delta > 0 && currentVal >= currentMax)) {
            // console.log("Boundary hit on start.");
            // If it's a touchstart that hit a boundary, the guard is already active
            // and will deactivate via its timer.
            return;
        }
        
        performChange(delta); // Perform the first change immediately
        stopInterval();       // Clear any existing interval (safety)

        // Setup interval for press-and-hold
        let accumulatedStep = delta;
        intervalRef.current = setInterval(() => {
            const changed = performChange(accumulatedStep);
            if (!changed) { // Hit boundary or no change possible
                stopInterval();
                return;
            }
            // Accelerate step for press-and-hold
            if (Math.abs(accumulatedStep) < Math.abs(delta * 4)) {
                accumulatedStep += delta;
            } else {
                accumulatedStep = delta * 4; // Cap acceleration
            }
        }, PRESS_AND_HOLD_INTERVAL_MS);

    }, [performChange, stopInterval]);

    const handleInteractionEnd = useCallback((event) => {
        // console.log(`--- InteractionEnd: type=${event?.type}`);
        stopInterval();
        // The touchActiveGuardRef is managed by its own timer set in touchstart.
        // If a touchend happens, the guard might still be active for a short while
        // to catch any immediate ghost mousedown.
    }, [stopInterval]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopInterval();
            if (touchActiveGuardTimerRef.current) {
                clearTimeout(touchActiveGuardTimerRef.current);
            }
        };
    }, [stopInterval]);

    const isDecrementDisabled = value <= min;
    const isIncrementDisabled = value >= max;

    // Helper to create event handlers for buttons
    const getButtonEventHandlers = (delta, isDisabled) => ({
        onMouseDown: (e) => !isDisabled && handleInteractionStart(delta, e),
        onMouseUp: (e) => handleInteractionEnd(e),
        onMouseLeave: (e) => handleInteractionEnd(e), // End if mouse leaves while pressed
        onTouchStart: (e) => !isDisabled && handleInteractionStart(delta, e),
        onTouchEnd: (e) => handleInteractionEnd(e),
        onTouchCancel: (e) => handleInteractionEnd(e), // End if touch is cancelled
    });

    return (
        <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } }}
        >
            <motion.label
                className={`block font-montserrat mb-1 ${labelClassName}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.1 } }}
            >
                {label}
            </motion.label>

            <motion.div
                className="inline-flex w-full h-10 px-2 items-center justify-between border border-neutral-200 dark:border-neutral-800 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-200 shadow-xl"
            >
                {/* Decrement Button */}
                <motion.button
                    type="button"
                    className={`
                        w-6 h-6 flex items-center justify-center rounded-full inset-shadow-sm inset-shadow-neutral-300 dark:inset-shadow-neutral-600
                        ${isDecrementDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-neutral-100 dark:hover:bg-neutral-600'}
                        transition duration-200 ease-in-out`}
                    {...getButtonEventHandlers(-1, isDecrementDisabled)}
                    disabled={isDecrementDisabled}
                    whileTap={{ scale: !isDecrementDisabled ? 0.8 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <Icon name="remove" className={'w-4 h-4 text-neutral-800 dark:text-neutral-600 hover:dark:text-neutral-200'} style={{ fontSize: '16px' }} />
                </motion.button>

                {/* Value Display */}
                <div className="w-14 text-center font-mono text-sm relative">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={value}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                            className="absolute font-montserrat inset-0 flex items-center justify-center font-medium text-neutral-600 dark:text-neutral-600"
                        >
                            {value.toString().padStart(2, '0')}
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* Increment Button */}
                <motion.button
                    type="button"
                    className={`
                        w-6 h-6 flex items-center justify-center rounded-full inset-shadow-sm inset-shadow-neutral-300 dark:inset-shadow-neutral-600
                        ${isIncrementDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-neutral-100 dark:hover:bg-neutral-600'}
                        transition duration-200 ease-in-out`}
                    {...getButtonEventHandlers(1, isIncrementDisabled)}
                    disabled={isIncrementDisabled}
                    whileTap={{ scale: !isIncrementDisabled ? 0.8 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <Icon name="add" className={'w-4 h-4 text-neutral-800 dark:text-neutral-600 hover:dark:text-neutral-200'} style={{ fontSize: '16px' }} />
                </motion.button>
            </motion.div>
        </motion.div>
    );
}