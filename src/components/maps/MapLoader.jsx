import React, { createContext, useContext, useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

// 1. Create context for Google Maps API access
const MapContext = createContext(null);
const LIBRARIES = ['places'];

/**
 * Bakery-themed spinner component with gold accent
 */
const Spinner = () => (
    <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
        <p className="mt-4 font-playfair text-amber-700">Warming up the oven...</p>
    </div>
);

/**
 * Styled error container with retry button
 */
const ErrorState = ({ error }) => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="text-red-600 mb-4 text-lg font-inter">🍞 Oh crumbs!</div>
        <p className="text-gray-700 mb-6">{error}</p>
        <button
            onClick={() => window.location.reload()}
            className="text-white px-4 py-2 rounded font-playfair transition-colors"
        >
            Try Again
        </button>
    </div>
);

export const MapLoader = ({ children }) => {
    // 2. Load Google Maps API with environment variable
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GMAPS_API_KEY,
        libraries: LIBRARIES,
        language: 'en',
        region: 'US',
        version: 'beta',
    });

    // 3. State management for map instance
    const [map, setMap] = useState(null);
    const contextValue = { 
        isLoaded, 
        map, 
        setMap,
        google: window.google
    };

    return (
        // 4. Bakery-chic container styling
        <div className="w-full h-full relative p-6 shadow-lg">
            {/* 5. Conditional rendering based on load state */}
            {loadError ? (
                <ErrorState error="Failed to load map. Please check your connection." />
            ) : !isLoaded ? (
                <Spinner />
            ) : (
                // 6. Provide map context to children when ready
                <MapContext.Provider value={contextValue}>
                    {typeof children === 'function' ? children(contextValue) : children}
                </MapContext.Provider>
            )}
        </div>
    );
};

// 7. Context hook for child components
export const useMap = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMap must be used within a MapLoader');
    }
    return context;
};