export const deepEqual = (a, b) =>
    JSON.stringify(a) === JSON.stringify(b);

// utils.js
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