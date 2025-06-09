import { useMemo } from 'react';

export function useDigitAnimations({ prev, current, index, cascade, cascadeDelay, easing, charSet = '0123456789' }) {
    const steps = useMemo(() => {
        if (isNaN(prev) || isNaN(current)) return [current];
        const prevNum = parseInt(prev, 10);
        const currNum = parseInt(current, 10);
        const direction = currNum >= prevNum ? 1 : -1;
        const steps = [];
        let n = prevNum;
        do {
            n = (n + direction + charSet.length) % charSet.length;
            steps.push(n.toString());
        } while (n !== currNum);
        return steps;
    }, [prev, current, charSet]);

    const delay = useMemo(() => (cascade ? index * cascadeDelay : 0), [index, cascade, cascadeDelay]);

    const easingArray = useMemo(() => {
        const presets = {
            easeOut: [0, 0, 0.58, 1],
            easeIn: [0.42, 0, 1, 1],
            linear: [0, 0, 1, 1]
        };
        if (Array.isArray(easing)) return easing;
        return presets[easing] || presets.easeOut;
    }, [easing]);

    return { steps, delay, easingArray };
}
