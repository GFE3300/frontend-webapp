// src/features/register/maps/MapViewport.jsx
import React, { useEffect, useRef, memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useGoogleMapsApi } from './MapLoader';
// Import DEFAULT_MAP_CENTER correctly
import { useMapDisplay, DEFAULT_MAP_CENTER } from './MapDisplayContextProvider';

/**
 * @typedef {Object} Coordinates
 * @property {number} lat - Latitude.
 * @property {number} lng - Longitude.
 */

const DEFAULT_MAP_OPTIONS_BASE = { // Base options without center/zoom, those are dynamic
    disableDefaultUI: true,
    mapId: import.meta.env.VITE_GMAPS_MAP_ID,
    gestureHandling: 'cooperative',
};

const DEFAULT_ZOOM = 15; // Define default zoom separately

const isValidCoords = (coords) => {
    return coords && typeof coords.lat === 'number' && typeof coords.lng === 'number' && isFinite(coords.lat) && isFinite(coords.lng);
};

const MapViewport = memo(({
    mapContainerClassName,
    mapContainerStyle,
    mapOptions, // User-provided overrides (can include center, zoom)
    onMarkerDragEnd,
    onMapIdle,
    markerTitle = 'Selected Location',
    isMarkerDraggable = true,
}) => {
    const { google, isLoaded: isApiLoaded } = useGoogleMapsApi();
    const {
        mapInstance,
        setMapInstance,
        markerVisualPosition,
        mapVisualCenter, // This comes from MapDisplayContext, initialized by formData.locationCoords or DEFAULT_MAP_CENTER
        updateMapVisualCenter,
    } = useMapDisplay();

    const mapContainerRef = useRef(null);
    const markerRef = useRef(null);
    const [AdvancedMarkerElementClass, setAdvancedMarkerElementClass] = useState(null);

    useEffect(() => {
        if (isApiLoaded && google && google.maps && !AdvancedMarkerElementClass) {
            google.maps.importLibrary('marker')
                .then((markerLibrary) => {
                    setAdvancedMarkerElementClass(() => markerLibrary.AdvancedMarkerElement);
                })
                .catch(e => console.error("Failed to load marker library:", e));
        }
    }, [isApiLoaded, google, AdvancedMarkerElementClass]);

    // 1. Initialize Map Instance
    useEffect(() => {
        if (!isApiLoaded || !google || !mapContainerRef.current || mapInstance || !AdvancedMarkerElementClass) {
            return;
        }

        // Determine the final center and zoom for map initialization
        let finalCenter;
        let finalZoom;

        // Priority for center:
        // 1. mapVisualCenter from context (if valid) - this reflects formData or user interaction
        // 2. mapOptions.center from props (if valid) - direct override for this instance
        // 3. DEFAULT_MAP_CENTER (global default)
        if (isValidCoords(mapVisualCenter)) {
            finalCenter = mapVisualCenter;
        } else if (mapOptions && isValidCoords(mapOptions.center)) {
            finalCenter = mapOptions.center;
        } else {
            finalCenter = DEFAULT_MAP_CENTER; // Use the imported default
        }

        // Priority for zoom:
        // 1. mapOptions.zoom from props (if valid number)
        // 2. DEFAULT_ZOOM
        if (mapOptions && typeof mapOptions.zoom === 'number' && isFinite(mapOptions.zoom)) {
            finalZoom = mapOptions.zoom;
        } else {
            finalZoom = DEFAULT_ZOOM;
        }

        const combinedMapOptions = {
            ...DEFAULT_MAP_OPTIONS_BASE, // Start with base defaults (no center/zoom)
            ...mapOptions, // Apply prop-based mapOptions (could override mapId, gestureHandling, etc.)
            center: finalCenter, // Set the determined center
            zoom: finalZoom,     // Set the determined zoom
        };

        // This log should now always show a valid 'center'
        // console.log("MapViewport Init - Combined Options:", JSON.stringify(combinedMapOptions));


        // This defensive check should ideally not be needed if the logic above is sound
        if (!isValidCoords(combinedMapOptions.center)) {
            // This would indicate a flaw in the finalCenter determination logic
            console.error("Map Viewport: CRITICAL - Invalid center for map initialization even after fallbacks.", combinedMapOptions.center);
            combinedMapOptions.center = DEFAULT_MAP_CENTER; // Absolute last resort
        }

        const newMap = new google.maps.Map(mapContainerRef.current, combinedMapOptions);
        setMapInstance(newMap);

    }, [isApiLoaded, google, mapOptions, setMapInstance, mapInstance, mapVisualCenter, AdvancedMarkerElementClass]); // mapVisualCenter is key here

    // 2. Update Map Center when `mapVisualCenter` from context changes (e.g. driven by Step1Location)
    useEffect(() => {
        if (mapInstance && mapVisualCenter) {
            if (isValidCoords(mapVisualCenter)) {
                const currentMapCenter = mapInstance.getCenter();
                // Check if update is actually needed to prevent unnecessary pans
                if (currentMapCenter &&
                    (Math.abs(currentMapCenter.lat() - mapVisualCenter.lat) > 0.000001 || // Epsilon for float comparison
                        Math.abs(currentMapCenter.lng() - mapVisualCenter.lng) > 0.000001)) {
                    mapInstance.panTo(mapVisualCenter);
                }
            } else {
                // console.warn("MapViewport: mapVisualCenter from context became invalid. Not panning.", mapVisualCenter);
            }
        }
    }, [mapInstance, mapVisualCenter]);

    // 3. Initialize and Update Marker
    useEffect(() => {
        if (!mapInstance || !google || !AdvancedMarkerElementClass) {
            if (markerRef.current) {
                markerRef.current.map = null;
                markerRef.current = null;
            }
            return;
        }

        if (isValidCoords(markerVisualPosition)) {
            if (!markerRef.current) {
                markerRef.current = new AdvancedMarkerElementClass({
                    map: mapInstance,
                    position: markerVisualPosition,
                    title: markerTitle,
                    gmpDraggable: isMarkerDraggable,
                });

                if (isMarkerDraggable && onMarkerDragEnd) {
                    markerRef.current.addListener('dragend', (event) => {
                        if (event.latLng && typeof event.latLng.lat === 'function' && typeof event.latLng.lng === 'function') {
                            onMarkerDragEnd({ lat: event.latLng.lat(), lng: event.latLng.lng() });
                        } else if (markerRef.current?.position && isValidCoords(markerRef.current.position)) {
                            const pos = markerRef.current.position;
                            onMarkerDragEnd({ lat: pos.lat, lng: pos.lng });
                        } else {
                            console.warn("Marker dragend: Could not determine new position.");
                        }
                    });
                }
            } else {
                if (isValidCoords(markerVisualPosition) &&
                    (markerRef.current.position?.lat !== markerVisualPosition.lat || markerRef.current.position?.lng !== markerVisualPosition.lng)) {
                    markerRef.current.position = markerVisualPosition;
                }
                if (markerRef.current.gmpDraggable !== isMarkerDraggable) {
                    markerRef.current.gmpDraggable = isMarkerDraggable;
                }
            }
        } else {
            if (markerRef.current) {
                markerRef.current.map = null;
                markerRef.current = null;
            }
        }
    }, [mapInstance, google, markerVisualPosition, markerTitle, isMarkerDraggable, onMarkerDragEnd, AdvancedMarkerElementClass]);

    // 4. Handle Map Idle Event
    const handleMapIdle = useCallback(() => {
        if (mapInstance && onMapIdle) {
            const center = mapInstance.getCenter();
            const zoom = mapInstance.getZoom();
            if (center && typeof center.lat === 'function' && typeof center.lng === 'function') { // Ensure center is valid LatLng object
                const newCenterCoords = { lat: center.lat(), lng: center.lng() };
                onMapIdle(newCenterCoords, zoom);

                const currentContextCenter = mapVisualCenter;
                if (!isValidCoords(currentContextCenter) ||
                    Math.abs(newCenterCoords.lat - currentContextCenter.lat) > 0.000001 ||
                    Math.abs(newCenterCoords.lng - currentContextCenter.lng) > 0.000001) {
                    updateMapVisualCenter(newCenterCoords);
                }
            }
        }
    }, [mapInstance, onMapIdle, updateMapVisualCenter, mapVisualCenter]);

    useEffect(() => {
        if (mapInstance && onMapIdle && google && google.maps && google.maps.event) {
            const idleListener = mapInstance.addListener('idle', handleMapIdle);
            return () => {
                google.maps.event.removeListener(idleListener);
            };
        }
    }, [mapInstance, onMapIdle, handleMapIdle, google]);

    if (!isApiLoaded || !google || (isApiLoaded && google && !AdvancedMarkerElementClass)) {
        const message = !isApiLoaded || !google ? "Loading map API..." : "Loading map components...";
        return (
            <div className={mapContainerClassName || "default-map-viewport-container rounded-2xl overflow-hidden"}
                style={mapContainerStyle || { width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p className="text-sm text-gray-500 dark:text-neutral-400">{message}</p>
            </div>
        );
    }

    return (
        <div
            ref={mapContainerRef}
            className={mapContainerClassName || "default-map-viewport-container rounded-2xl overflow-hidden"}
            style={mapContainerStyle || { width: '100%', height: '400px' }}
            role="application"
            aria-label="Location selection map"
        />
    );
});

MapViewport.displayName = 'MapViewport';
MapViewport.propTypes = {
    mapContainerClassName: PropTypes.string,
    mapContainerStyle: PropTypes.object,
    mapOptions: PropTypes.object,
    onMarkerDragEnd: PropTypes.func,
    onMapIdle: PropTypes.func,
    markerTitle: PropTypes.string,
    isMarkerDraggable: PropTypes.bool,
};

export default MapViewport;