import {
    computeBarPoints,
    computeVectors,
    enrichVectors
} from '../../GraphGenerator';

export const calculateEnrichedVectors = (data, size, peakValue) => {
    if (!size?.width || data.length < 2) return [];

    const units = {
        x: size.width / (data.length - 1),
        y: size.height / peakValue,
    };

    return data.flatMap((_, i) => {
        const pts = computeBarPoints(i, data, units, size.height);
        const rawVectors = computeVectors(pts);
        return enrichVectors(rawVectors);
    });
};

export const calculateDualVectors = (customerData, size) => {
    if (!customerData?.length || !size?.width) return { customerVectors: [] };

    const divisor = Math.max(customerData.length - 1, 1);
    const safeWidth = size.width || 1;

    return customerData.map((value, index) => ({
        x: (index / divisor) * safeWidth,
        y: size.height - (value * size.height / (Math.max(...customerData) || 1))
    }));
};