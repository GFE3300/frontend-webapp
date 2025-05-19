import React, { createContext, useContext, useState, useCallback, useMemo, memo, useEffect } from 'react';
import PropTypes from 'prop-types';

// 1. Define the context for map display state
const MapDisplayContext = createContext(null);

/**
 * @typedef {Object} Coordinates
 * @property {number} lat - Latitude.
 * @property {number} lng - Longitude.
 */

/**
 * @typedef {Object} MapDisplayContextValue
 * @property {google.maps.Map | null} mapInstance - The actual Google Map instance.
 * @property {(map: google.maps.Map | null) => void} setMapInstance - Function to set the map instance (typically called by MapViewport).
 * @property {Coordinates | null} markerVisualPosition - The current visual position of the marker on the map.
 * @property {(coords: Coordinates | null) => void} updateMarkerVisualPosition - Function to update the marker's visual position.
 * @property {Coordinates | null} mapVisualCenter - The current visual center of the map.
 * @property {(coords: Coordinates | null) => void} updateMapVisualCenter - Function to update the map's visual center.
 */

/**
 * Default center coordinates if none are provided.
 * Choose a sensible default for your application.
 */
export const DEFAULT_MAP_CENTER = { lat: 39.8283, lng: -98.5795 }; // Center of USA

/**
 * MapDisplayContextProvider Component
 *
 * Manages and provides the state related to the visual display of the Google Map,
 * including the map instance, marker position, and map center.
 *
 * This provider should wrap components that need to interact with or display
 * these visual aspects of the map (e.g., MapViewport, Step1Location).
 * It relies on `MapLoader` to ensure the Google Maps API is available.
 *
 * @component
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components.
 * @param {Coordinates} [props.initialCenter] - Initial center for the map.
 * @param {Coordinates} [props.initialMarkerPosition] - Initial position for the marker.
 */
const MapDisplayContextProvider = memo(({ children, initialCenter, initialMarkerPosition }) => {
    const [mapInstance, setMapInstanceInternal] = useState(null);
    const [markerVisualPosition, setMarkerVisualPositionInternal] = useState(initialMarkerPosition || null);
    const [mapVisualCenter, setMapVisualCenterInternal] = useState(initialCenter || DEFAULT_MAP_CENTER);

    // Memoized callbacks to update state.
    // These ensure stable references for the context value unless the functions themselves need to change.
    const setMapInstance = useCallback((map) => {
        setMapInstanceInternal(map);
    }, []);

    const updateMarkerVisualPosition = useCallback((coords) => {
        setMarkerVisualPositionInternal(coords);
    }, []);

    const updateMapVisualCenter = useCallback((coords) => {
        setMapVisualCenterInternal(coords);
    }, []);

    // Synchronize internal state if initial props change after mount
    // This is important if the parent component (e.g., LocationPage) re-renders with new initial values
    // from formData *before* user interaction has occurred on the map.
    useEffect(() => {
        // Only update if the prop value is meaningfully different and provided
        if (initialCenter && (initialCenter.lat !== mapVisualCenter?.lat || initialCenter.lng !== mapVisualCenter?.lng)) {
            setMapVisualCenterInternal(initialCenter);
        }
    }, [initialCenter, mapVisualCenter?.lat, mapVisualCenter?.lng]); // Fine-grained dependencies for mapVisualCenter

    useEffect(() => {
        if (initialMarkerPosition === null && markerVisualPosition !== null) {
            // If prop explicitly becomes null, update internal state
            setMarkerVisualPositionInternal(null);
        } else if (initialMarkerPosition && (initialMarkerPosition.lat !== markerVisualPosition?.lat || initialMarkerPosition.lng !== markerVisualPosition?.lng)) {
            setMarkerVisualPositionInternal(initialMarkerPosition);
        }
    }, [initialMarkerPosition, markerVisualPosition?.lat, markerVisualPosition?.lng]); // Fine-grained dependencies for markerVisualPosition


    // Memoize the context value to prevent unnecessary re-renders of consumers.
    const contextValue = useMemo(() => ({
        mapInstance,
        setMapInstance,
        markerVisualPosition,
        updateMarkerVisualPosition,
        mapVisualCenter,
        updateMapVisualCenter,
    }), [
        mapInstance, setMapInstance,
        markerVisualPosition, updateMarkerVisualPosition,
        mapVisualCenter, updateMapVisualCenter
    ]);

    return (
        <MapDisplayContext.Provider value={contextValue}>
            {children}
        </MapDisplayContext.Provider>
    );
});

MapDisplayContextProvider.displayName = 'MapDisplayContextProvider';

MapDisplayContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
    initialCenter: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
    }),
    initialMarkerPosition: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
    }),
};

MapDisplayContextProvider.defaultProps = {
    initialCenter: DEFAULT_MAP_CENTER,
    initialMarkerPosition: null,
};

/**
 * Custom hook to easily consume the MapDisplayContext.
 *
 * @returns {MapDisplayContextValue} The context value.
 * @throws {Error} If used outside of a `<MapDisplayContextProvider>`.
 *
 * @example
 * const { mapInstance, markerVisualPosition, updateMarkerVisualPosition } = useMapDisplay();
 * // Use the context values to interact with the map's visual state.
 */
export const useMapDisplay = () => {
    const context = useContext(MapDisplayContext);
    if (context === null) {
        throw new Error('useMapDisplay must be used within a <MapDisplayContextProvider>.');
    }
    return context;
};

export default MapDisplayContextProvider;