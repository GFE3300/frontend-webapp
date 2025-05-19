import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function deepEqual(a, b) {
    if (a === b) return true;

    if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null) {
        return false;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (let key of keysA) {
        if (!keysB.includes(key)) return false;
        if (typeof a[key] === 'object' && !deepEqual(a[key], b[key])) {
            return false;
        } else if (a[key] !== b[key]) {
            return false;
        }
    }

    return true;
}

export const getCountryCodeFromName = (name) => {
    // Static list must mirror AddressForm's STATIC_COUNTRIES
    const COUNTRY_NAME_TO_CODE = {
        'United States': 'US',
        'Spain': 'ES',
        'France': 'FR',
        'Germany': 'DE',
        'Italy': 'IT',
        'United Kingdom': 'GB',
        'Canada': 'CA',
        'Portugal': 'PT',
        'Australia': 'AU',
        'Brazil': 'BR',
        'Japan': 'JP',
        'India': 'IN',
        'Mexico': 'MX',
        'China': 'CN',
        'Russia': 'RU',
        'South Africa': 'ZA'
    };

    // Case-insensitive lookup with fallbacks
    const normalizedInput = name?.trim().toLowerCase();
    const entry = Object.entries(COUNTRY_NAME_TO_CODE).find(
        ([countryName]) => countryName.toLowerCase() === normalizedInput
    );

    return entry ? entry[1] : ''; // Return code or empty string
};