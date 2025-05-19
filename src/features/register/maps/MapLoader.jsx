import React, { createContext, useContext, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import { useJsApiLoader } from '@react-google-maps/api';

// 1. Define the context for Google Maps API access
const GoogleMapsApiContext = createContext(null);

// Configuration for the Google Maps API loader
// These should remain consistent with your project's needs.
const GOOGLE_MAPS_LIBRARIES = ['places']; // Only load what's necessary
const API_VERSION = 'beta'; // Or 'weekly', 'quarterly', specific version
const API_LANGUAGE = 'en'; // Or dynamically set based on user preferences
const API_REGION = 'US';   // Or dynamically set

/**
 * @typedef {Object} GoogleMapsApiContextValue
 * @property {object|null} google - The global Google Maps API object (window.google).
 * @property {boolean} isLoaded - True if the Google Maps API has successfully loaded.
 * @property {Error|null} loadError - An error object if the API failed to load.
 */

/**
 * MapLoader Component
 *
 * Responsible for loading the Google Maps JavaScript API.
 * It provides the `google` object, `isLoaded` status, and `loadError`
 * via the `GoogleMapsApiContext` to its children.
 *
 * This component should wrap any part of the application that needs
 * to interact with the Google Maps API.
 *
 * @component
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components that will consume the context.
 * @param {React.ReactNode} [props.loadingComponent] - Optional component to display while loading.
 * @param {React.ReactNode} [props.errorComponent] - Optional component to display on load error.
 */
const MapLoader = memo(({ children, loadingComponent, errorComponent }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script', // Keep a consistent ID
        googleMapsApiKey: import.meta.env.VITE_GMAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES,
        language: API_LANGUAGE,
        region: API_REGION,
        version: API_VERSION,
        // Other options like `preventGoogleFontsLoading: true` can be added if needed
    });

    // Memoize the context value to prevent unnecessary re-renders of consumers
    // The `google` object from `window.google` is stable once loaded.
    const contextValue = useMemo(() => ({
        google: isLoaded && !loadError ? window.google : null,
        isLoaded: isLoaded && !loadError, // Only truly loaded if no error
        loadError,
    }), [isLoaded, loadError]);

    if (loadError) {
        console.error("Google Maps API failed to load:", loadError);
        return errorComponent || (
            <div role="alert" style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
                <p>Error loading Google Maps.</p>
                <p>Please check your internet connection or API key configuration.</p>
                {/* Consider adding a retry mechanism or more detailed error info for developers */}
            </div>
        );
    }

    if (!isLoaded) {
        return loadingComponent || (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Loading map services...</p>
                {/* Basic spinner or skeleton loader */}
            </div>
        );
    }

    return (
        <GoogleMapsApiContext.Provider value={contextValue}>
            {children}
        </GoogleMapsApiContext.Provider>
    );
});

MapLoader.displayName = 'MapLoader';

MapLoader.propTypes = {
    children: PropTypes.node.isRequired,
    loadingComponent: PropTypes.node,
    errorComponent: PropTypes.node,
};

MapLoader.defaultProps = {
    loadingComponent: null, // Consumers can provide their own styled components
    errorComponent: null,   // Consumers can provide their own styled components
};

/**
 * Custom hook to easily consume the GoogleMapsApiContext.
 *
 * @returns {GoogleMapsApiContextValue} The context value.
 * @throws {Error} If used outside of a `<MapLoader>` provider.
 *
 * @example
 * const { google, isLoaded, loadError } = useGoogleMapsApi();
 * if (!isLoaded) return <p>Loading...</p>;
 * if (loadError) return <p>Error loading map.</p>;
 * // Now you can use the `google` object
 */
export const useGoogleMapsApi = () => {
    const context = useContext(GoogleMapsApiContext);
    if (context === null) {
        throw new Error('useGoogleMapsApi must be used within a <MapLoader> provider.');
    }
    return context;
};

export default MapLoader;