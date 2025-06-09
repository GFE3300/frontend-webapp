import React, { forwardRef, useImperativeHandle, memo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import StaticChar from './StaticChar';
import { useDigitAnimations } from '../hooks/useDigitAnimations';

/**
 * AnimatedDigit
 * Renders a single digit (or symbol) slot, animating transitions between
 * prev and current characters via rolling or flipping, with optional cascade,
 * ghost preview, and color/scale accent.
 */
const AnimatedDigit = forwardRef(({
    prev,
    current,
    index,
    duration,
    easing,
    cascade,
    cascadeDelay,
    digitWidth = '1ch',
    digitHeight = '1em',
    mode = 'roll',
    ghostOpacity = 0.15,
    incrementColor = 'inherit',
    decrementColor = 'inherit',
    baseColor = 'inherit',
    charSet,
    reducedMotion: forcedReduced = false,
}, ref) => {
    const prefersReduced = useReducedMotion();
    const reducedMotion = forcedReduced || prefersReduced;

    const { steps, delay, easingArray } = useDigitAnimations({
        prev, current, index, cascade, cascadeDelay, easing, charSet
    });

    useImperativeHandle(ref, () => ({
        pause: () => console.warn('pause() not implemented'),
        resume: () => console.warn('resume() not implemented'),
    }), []);

    // Reduced-motion fallback
    if (reducedMotion) {
        return (
            <span
                className="inline-block"
                style={{ width: digitWidth, height: digitHeight }}
            >
                {current}
            </span>
        );
    }

    // Always render ghost + AnimatePresence so mounts/unmounts animate
    const isSymbol = isNaN(prev) || isNaN(current);
    const direction = !isNaN(prev) && !isNaN(current)
        ? Math.sign(parseInt(current, 10) - parseInt(prev, 10))
        : 0;
    const accent = direction >= 0 ? incrementColor : decrementColor;

    return (
        <div
            className="relative flex items-center justify-center"
            style={{ width: digitWidth, height: digitHeight }}
            aria-hidden="true"
        >
            {/* Ghost preview layer */}
            <span
                className="absolute w-full text-center"
                style={{ opacity: ghostOpacity, color: baseColor }}
            >
                {current}
            </span>

            {isSymbol ? (
                <StaticChar char={current} />
            ) : (
                <AnimatePresence initial={false}>
                    {steps.map((num, i) => {
                        // Restore original roll vs flip transforms
                        const initial = mode === 'flip'
                            ? { rotateX: 90 }
                            : { y: `${i * 100}%` };

                        const animate = mode === 'flip'
                            ? { rotateX: 0 }
                            : { y: `${(i - steps.length + 1) * 100}%` };

                        const exit = mode === 'flip'
                            ? { rotateX: -90 }
                            : { y: '-100%' };

                        return (
                            <motion.span
                                key={`${num}-${i}`}
                                className="absolute w-full text-center"
                                initial={{ ...initial, scale: 1, color: baseColor }}
                                animate={{
                                    ...animate,
                                    scale: [1, 1.1, 1],
                                    color: [baseColor, accent, baseColor],
                                }}
                                exit={exit}
                                transition={{
                                    duration,
                                    delay,
                                    ease: easingArray,
                                    times: mode === 'flip' ? [0, 0.5, 1] : undefined
                                }}
                                style={mode === 'flip'
                                    ? { backfaceVisibility: 'hidden' }
                                    : undefined
                                }
                            >
                                {num}
                            </motion.span>
                        );
                    })}
                </AnimatePresence>
            )}
        </div>
    );
});

AnimatedDigit.displayName = 'AnimatedDigit';

function areEqual(prevProps, nextProps) {
    const keys = [
        'prev', 'current', 'duration', 'easing', 'cascade',
        'cascadeDelay', 'digitWidth', 'digitHeight', 'mode',
        'ghostOpacity', 'incrementColor', 'decrementColor', 'baseColor',
        'reducedMotion', 'index'
    ];
    for (const key of keys) {
        if (prevProps[key] !== nextProps[key]) return false;
    }
    if (prevProps.charSet.length !== nextProps.charSet.length) return false;
    for (let i = 0; i < prevProps.charSet.length; i++) {
        if (prevProps.charSet[i] !== nextProps.charSet[i]) return false;
    }
    return true;
}

const MemoizedAnimatedDigit = memo(AnimatedDigit, areEqual);

MemoizedAnimatedDigit.propTypes = {
    prev: PropTypes.string.isRequired,
    current: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    duration: PropTypes.number,
    easing: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.number)
    ]),
    cascade: PropTypes.bool,
    cascadeDelay: PropTypes.number,
    digitWidth: PropTypes.string,
    digitHeight: PropTypes.string,
    mode: PropTypes.oneOf(['roll', 'flip']),
    ghostOpacity: PropTypes.number,
    incrementColor: PropTypes.string,
    decrementColor: PropTypes.string,
    baseColor: PropTypes.string,
    charSet: PropTypes.arrayOf(PropTypes.string).isRequired,
    reducedMotion: PropTypes.bool,
};

export default MemoizedAnimatedDigit;
