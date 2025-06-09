import { useRef, useEffect, useMemo } from 'react';

export function useNumberFormatting(value, { decimals = 2, locale = 'en-US', placeholderChar = '0', formatOptions = {} }) {
    const prevRef = useRef(value);
    useEffect(() => {
        prevRef.current = value;
    }, [value]);

    const formatter = useMemo(() => {
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
            ...formatOptions
        });
    }, [locale, decimals, formatOptions]);

    const { prevChars, currentChars } = useMemo(() => {
        const formatChars = (num) => {
            if (isNaN(num)) {
                const sample = formatter.format(0);
                return Array(sample.length).fill(placeholderChar);
            }
            return formatter.format(Math.abs(num)).split('');
        };

        let prevChars = formatChars(prevRef.current);
        let currentChars = formatChars(value);

        return { prevChars, currentChars };
    }, [value, formatter, placeholderChar]);

    return { prevChars, currentChars };
}
