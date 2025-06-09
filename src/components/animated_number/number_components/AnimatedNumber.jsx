import React, {
    forwardRef,
    useState,
    useRef,
    useEffect,
    useMemo,
    useImperativeHandle,
} from 'react';
import PropTypes from 'prop-types';
import { useReducedMotion } from 'framer-motion';
import AnimatedDigit from '../digit_components/AnimatedDigit';
import { useNumberFormatting } from '../hooks/useNumberFormatting';

/**
 * AnimatedNumber
 * Orchestrates a series of AnimatedDigits to display a full number,
 * handling localization, throttling, RTL direction, and accessibility.
 */
const AnimatedNumber = forwardRef(({
    // Core formatting props
    value,
    decimals = 2,
    formatOptions = {},
    locale = 'en-US',
    placeholderChar = '0',

    // Animation props
    duration = 0.5,
    easing = 'easeOut',        // can be string or array
    cascade = false,
    cascadeDelay = 0.03,
    minUpdateInterval = 0,
    onAnimationStart = () => { },
    onAnimationComplete = () => { },

    // Digit styling & behavior
    digitWidth = '1ch',
    digitHeight = '1em',
    ghostOpacity = 0.15,
    incrementColor = 'inherit',
    decrementColor = 'inherit',
    baseColor = 'inherit',
    charSet = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', ',', '-'],
    mode = 'roll',
    announceFormatter,

    // Container styling
    className = '',
}, ref) => {
    // State for displayed value (allows throttling)
    const [displayValue, setDisplayValue] = useState(value);
    const updateTimer = useRef(null);

    // Throttle updates to avoid janky high-frequency changes
    useEffect(() => {
        if (minUpdateInterval > 0) {
            clearTimeout(updateTimer.current);
            updateTimer.current = setTimeout(() => setDisplayValue(value), minUpdateInterval);
        } else {
            setDisplayValue(value);
        }
        return () => clearTimeout(updateTimer.current);
    }, [value, minUpdateInterval]);

    // Format number into prev/current char arrays
    const { prevChars, currentChars } = useNumberFormatting(displayValue, {
        decimals,
        locale,
        placeholderChar,
        formatOptions
    });

    // Accessibility: generate the announcement string
    const announce = announceFormatter || ((v) => new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        ...formatOptions
    }).format(v));

    // Detect reduced motion preference (SSR-safe)
    const reducedMotion = useReducedMotion();

    // Animation lifecycle callbacks
    const completeTimer = useRef(null);
    useEffect(() => {
        onAnimationStart(displayValue);
        // total animation time in ms = (max cascade delay + duration) * 1000
        const maxDelay = cascade ? (currentChars.length - 1) * cascadeDelay : 0;
        const totalMs = (maxDelay + duration) * 1000;
        clearTimeout(completeTimer.current);
        completeTimer.current = setTimeout(() => onAnimationComplete(displayValue), totalMs);
        return () => clearTimeout(completeTimer.current);
    }, [displayValue, cascade, cascadeDelay, duration, currentChars.length, onAnimationStart, onAnimationComplete]);

    // Expose imperative controls to parent via ref
    useImperativeHandle(ref, () => ({
        pause: () => {
            clearTimeout(updateTimer.current);
            clearTimeout(completeTimer.current);
        },
        resume: () => setDisplayValue(value),
        refresh: () => setDisplayValue(value),
    }), [value]);

    // Memoize AnimatedDigit instances for performance
    const digits = useMemo(
        () => currentChars.map((char, i) => (
            <AnimatedDigit
                key={`${i}:${char}`}
                prev={prevChars[i]}
                current={char}
                index={i}
                duration={duration}
                easing={easing}
                cascade={cascade}
                cascadeDelay={cascadeDelay}
                digitWidth={digitWidth}
                digitHeight={digitHeight}
                ghostOpacity={ghostOpacity}
                incrementColor={incrementColor}
                decrementColor={decrementColor}
                baseColor={baseColor}
                charSet={charSet}
                mode={mode}
                reducedMotion={reducedMotion}
            />
        )),
        [prevChars, currentChars, duration, easing, cascade, cascadeDelay,
            digitWidth, digitHeight, ghostOpacity, incrementColor, decrementColor,
            baseColor, charSet, mode, reducedMotion]
    );

    // Determine text direction for locales (basic RTL check)
    const isRTL = useMemo(
        () => ['ar', 'he', 'fa', 'ur'].some((r) => locale.startsWith(r)),
        [locale]
    );

    return (
        <div
            className={`${className} flex items-center justify-center overflow-hidden`}
            role="text"
            aria-label={announce(displayValue)}
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            <div aria-live="polite" className="sr-only">
                {announce(displayValue)}
            </div>
            {digits}
        </div>
    );
});

AnimatedNumber.displayName = 'AnimatedNumber';

AnimatedNumber.propTypes = {
    value: PropTypes.number.isRequired,
    decimals: PropTypes.number,
    formatOptions: PropTypes.object,
    locale: PropTypes.string,
    placeholderChar: PropTypes.string,
    duration: PropTypes.number,
    easing: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.number)]),
    cascade: PropTypes.bool,
    cascadeDelay: PropTypes.number,
    minUpdateInterval: PropTypes.number,
    onAnimationStart: PropTypes.func,
    onAnimationComplete: PropTypes.func,
    digitWidth: PropTypes.string,
    digitHeight: PropTypes.string,
    ghostOpacity: PropTypes.number,
    incrementColor: PropTypes.string,
    decrementColor: PropTypes.string,
    baseColor: PropTypes.string,
    charSet: PropTypes.arrayOf(PropTypes.string),
    mode: PropTypes.oneOf(['roll', 'flip']),
    announceFormatter: PropTypes.func,
    className: PropTypes.string,
};

export default AnimatedNumber;
