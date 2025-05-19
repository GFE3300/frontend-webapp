// src/features/register/hooks/useReverseGeocoder.js
import { useState, useCallback } from 'react';
import { useGoogleMapsApi } from '../maps/MapLoader'; // Ensure this path is correct

/**
 * @typedef {import('../maps/AddressForm').AddressData} AddressData
 * This assumes AddressForm.jsx exports AddressData type or it's defined globally.
 * If not, define it here:
 * typedef {object} AddressData
 * @property {string} [street]
 * @property {string} [city]
 * @property {string} [postalCode]
 * @property {string} [country]
 * @property {string} [state] // Optional: if you parse state/province
 * @property {string} [formattedAddress]
 */

/**
 * @typedef {Object} Coordinates
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {Object} UseReverseGeocoderReturn
 * @property {AddressData | null} address - The latest successfully geocoded address.
 * @property {boolean} isLoading - Current loading state of geocoding.
 * @property {string | null} error - Current error message from geocoding.
 * @property {(coords: Coordinates) => Promise<void>} geocodeCoordinates - Function to trigger reverse geocoding.
 * @property {() => void} clearGeocodingError - Function to manually clear the error state.
 */

// Placeholder for localized strings - adapt to your i18n setup
const scriptLines_Geocoder = {
    error: {
        apiNotReady: "Google Maps API or Geocoder service is not available.",
        invalidCoords: "Invalid coordinates provided for reverse geocoding.",
        noResults: "No address found for this location.",
        requestFailed: "Reverse geocoding request failed.",
        overQueryLimit: "Map request limit reached. Please try again later.",
        requestDenied: "Geocoding request denied. Check API key and permissions.",
        unknown: "An unknown error occurred during reverse geocoding."
    }
};

/**
 * Utility function to parse Google Geocoder API results into a standardized AddressData format.
 * This function is crucial for extracting meaningful address components.
 *
 * @param {google.maps.GeocoderResult[]} geocoderResults - Results from geocoder.geocode().
 * @returns {AddressData | null} A structured address object, or null if no suitable address found.
 */
export const parseGeocoderResultsToAddressData = (geocoderResults) => {
    if (!geocoderResults || geocoderResults.length === 0) return null;

    // Prioritize results that are more likely to be precise street addresses.
    // Types like 'street_address', 'premise', 'subpremise' are good indicators.
    // Fallback to broader types if precise ones aren't found.
    const result = geocoderResults.find(r =>
        r.types.includes('street_address') ||
        r.types.includes('premise') ||
        r.types.includes('route') // 'route' is often the street name
    ) || geocoderResults[0]; // Fallback to the first result if no preferred type is found

    const newAddress = {
        street: '',
        city: '',
        state: '', // For province/state
        postalCode: '',
        country: '', // Expecting country code (e.g., 'US')
        formattedAddress: result.formatted_address || '',
    };

    let streetNumber = '';
    let route = '';

    result.address_components.forEach(component => {
        const types = component.types;
        if (types.includes('street_number')) streetNumber = component.long_name;
        else if (types.includes('route')) route = component.long_name;
        else if (types.includes('locality') || types.includes('postal_town')) newAddress.city = component.long_name;
        else if (types.includes('administrative_area_level_1')) newAddress.state = component.short_name; // State/Province (short name)
        else if (types.includes('postal_code')) newAddress.postalCode = component.long_name;
        else if (types.includes('country')) newAddress.country = component.short_name; // short_name for country code
    });

    newAddress.street = `${streetNumber} ${route}`.trim();

    // Fallback for street if components didn't provide it but formatted_address exists
    if (!newAddress.street && newAddress.formattedAddress) {
        const parts = newAddress.formattedAddress.split(',');
        if (parts.length > 0) newAddress.street = parts[0].trim();
    }

    // Basic validation: ensure at least some key address parts were found
    // Adjust this condition based on what you consider a "valid" parsed address.
    if (!newAddress.street && !newAddress.city && !newAddress.country && !newAddress.formattedAddress) {
        return null; // Or return a minimal object like { formattedAddress: result.formatted_address }
    }
    if (!newAddress.formattedAddress && newAddress.street && newAddress.city && newAddress.country) {
        // Reconstruct a basic formattedAddress if Google's is missing but we have components
        newAddress.formattedAddress = `${newAddress.street}, ${newAddress.city}, ${newAddress.country}`;
    }


    return newAddress;
};


/**
 * Custom Hook for Reverse Geocoding using Google Maps Geocoding API.
 *
 * Manages the asynchronous geocoding process, including loading and error states.
 * It provides a function to trigger geocoding and exposes the resulting address,
 * loading status, and any errors.
 *
 * @returns {UseReverseGeocoderReturn}
 */
export const useReverseGeocoder = () => {
    const { google, isLoaded: isApiLoaded } = useGoogleMapsApi();
    const [address, setAddress] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const geocodeCoordinates = useCallback(async (coords) => {
        if (!isApiLoaded || !google || !google.maps?.Geocoder) {
            console.warn("useReverseGeocoder: Geocoding API or Geocoder class not available.");
            setError(scriptLines_Geocoder.error.apiNotReady);
            setIsLoading(false);
            return;
        }
        if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number' || !isFinite(coords.lat) || !isFinite(coords.lng)) {
            console.warn("useReverseGeocoder: Invalid coordinates provided for geocoding.", coords);
            setError(scriptLines_Geocoder.error.invalidCoords);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setAddress(null); // Clear previous address before new request

        const geocoder = new google.maps.Geocoder();

        try {
            const response = await new Promise((resolve) => {
                geocoder.geocode({ location: coords }, (results, status) => {
                    resolve({ results, status }); // Always resolve, handle status below
                });
            });

            const { results, status } = response;

            if (status === google.maps.GeocoderStatus.OK) {
                const parsedAddressData = parseGeocoderResultsToAddressData(results);
                if (parsedAddressData && (parsedAddressData.street || parsedAddressData.city || parsedAddressData.formattedAddress)) {
                    setAddress(parsedAddressData);
                } else {
                    console.warn("useReverseGeocoder: Geocoding status OK, but no useful address was parsed from results.", results);
                    setError(scriptLines_Geocoder.error.noResults);
                }
            } else {
                let specificErrorMessage = `${scriptLines_Geocoder.error.requestFailed} (Status: ${status})`;
                if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                    specificErrorMessage = scriptLines_Geocoder.error.noResults;
                } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                    specificErrorMessage = scriptLines_Geocoder.error.overQueryLimit;
                } else if (status === google.maps.GeocoderStatus.REQUEST_DENIED) {
                    specificErrorMessage = scriptLines_Geocoder.error.requestDenied;
                }
                console.error(`useReverseGeocoder: Geocoding API call failed with status: ${status}`);
                setError(specificErrorMessage);
            }
        } catch (e) {
            // Catches unexpected errors (e.g., network, or if the Promise wrapper itself had an issue, though unlikely now)
            console.error("useReverseGeocoder: An unexpected exception occurred during geocoding.", e);
            setError(scriptLines_Geocoder.error.unknown + (e.message ? `: ${e.message}` : ''));
        } finally {
            setIsLoading(false);
        }
    }, [isApiLoaded, google]); // Dependencies: stable once API loaded

    const clearGeocodingError = useCallback(() => {
        setError(null);
    }, []);

    return {
        address,
        isLoading,
        error,
        geocodeCoordinates,
        clearGeocodingError,
    };
};