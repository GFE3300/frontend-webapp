import React, { useEffect, useRef, memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useGoogleMapsApi } from './MapLoader';
import { useMapDisplay, DEFAULT_MAP_CENTER } from './MapDisplayContextProvider';
// MODIFICATION: Import the centralized script lines
import { scriptLines_Registration as scriptLines } from '../utils/script_lines';

/**
 * @typedef {Object} Coordinates
 * @property {number} lat - Latitude.
 * @property {number} lng - Longitude.
 */

const DEFAULT_MAP_OPTIONS_BASE = {
    disableDefaultUI: true,
    mapId: import.meta.env.VITE_GMAPS_MAP_ID,
    gestureHandling: 'cooperative',
};

const DEFAULT_ZOOM = 15;

const isValidCoords = (coords) => {
    return coords && typeof coords.lat === 'number' && typeof coords.lng === 'number' && isFinite(coords.lat) && isFinite(coords.lng);
};

const MapViewport = memo(({
    mapContainerClassName,
    mapContainerStyle,
    mapOptions,
    onMarkerDragEnd,
    onMapIdle,
    // MODIFICATION: Default value now comes from script lines
    markerTitle = scriptLines.mapViewport.markerTitle,
    isMarkerDraggable = true,
}) => {
    const { google, isLoaded: isApiLoaded } = useGoogleMapsApi();
    const {
        mapInstance,
        setMapInstance,
        markerVisualPosition,
        mapVisualCenter,
        updateMapVisualCenter,
    } = useMapDisplay();

    const mapContainerRef = useRef(null);
    const markerRef = useRef(null);
    const [AdvancedMarkerElementClass, setAdvancedMarkerElementClass] = useState(null);

    // ... (All useEffect hooks and logic remain the same) ...

    useEffect(() => {
        if (isApiLoaded && google && google.maps && !AdvancedMarkerElementClass) {
            google.maps.importLibrary('marker')
                .then((markerLibrary) => {
                    setAdvancedMarkerElementClass(() => markerLibrary.AdvancedMarkerElement);
                })
                .catch(e => console.error("Failed to load marker library:", e));
        }
    }, [isApiLoaded, google, AdvancedMarkerElementClass]);

    useEffect(() => {
        if (!isApiLoaded || !google || !mapContainerRef.current || mapInstance || !AdvancedMarkerElementClass) {
            return;
        }

        let finalCenter;
        let finalZoom;
        
        if (isValidCoords(mapVisualCenter)) {
            finalCenter = mapVisualCenter;
        } else if (mapOptions && isValidCoords(mapOptions.center)) {
            finalCenter = mapOptions.center;
        } else {
            finalCenter = DEFAULT_MAP_CENTER;
        }
        
        if (mapOptions && typeof mapOptions.zoom === 'number' && isFinite(mapOptions.zoom)) {
            finalZoom = mapOptions.zoom;
        } else {
            finalZoom = DEFAULT_ZOOM;
        }

        const combinedMapOptions = {
            ...DEFAULT_MAP_OPTIONS_BASE,
            ...mapOptions,
            center: finalCenter,
            zoom: finalZoom,
        };
        
        if (!isValidCoords(combinedMapOptions.center)) {
            console.error("Map Viewport: CRITICAL - Invalid center for map initialization even after fallbacks.", combinedMapOptions.center);
            combinedMapOptions.center = DEFAULT_MAP_CENTER;
        }

        const newMap = new google.maps.Map(mapContainerRef.current, combinedMapOptions);
        setMapInstance(newMap);

    }, [isApiLoaded, google, mapOptions, setMapInstance, mapInstance, mapVisualCenter, AdvancedMarkerElementClass]);

    useEffect(() => {
        if (mapInstance && mapVisualCenter) {
            if (isValidCoords(mapVisualCenter)) {
                const currentMapCenter = mapInstance.getCenter();
                if (currentMapCenter &&
                    (Math.abs(currentMapCenter.lat() - mapVisualCenter.lat) > 0.000001 ||
                        Math.abs(currentMapCenter.lng() - mapVisualCenter.lng) > 0.000001)) {
                    mapInstance.panTo(mapVisualCenter);
                }
            }
        }
    }, [mapInstance, mapVisualCenter]);

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

    const handleMapIdle = useCallback(() => {
        if (mapInstance && onMapIdle) {
            const center = mapInstance.getCenter();
            const zoom = mapInstance.getZoom();
            if (center && typeof center.lat === 'function' && typeof center.lng === 'function') {
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
        // MODIFICATION: Loading message now comes from script lines
        const message = !isApiLoaded || !google ? scriptLines.mapViewport.loading.api : scriptLines.mapViewport.loading.components;
        return (
            <div className={mapContainerClassName || "default-map-viewport-container rounded-2xl overflow-hidden"}
                style={mapContainerStyle || { width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p className="text-sm text-gray-500 dark:text-neutral-400">{message}</p>
            </div>
        );
    }

    return (
        <div
            ref={mapContainerRef}
            className={mapContainerClassName || "default-map-viewport-container rounded-2xl overflow-hidden"}
            style={mapContainerStyle || { width: '100%', height: '300px' }}
            role="application"
            // MODIFICATION: ARIA label now comes from script lines
            aria-label={scriptLines.mapViewport.aria.map}
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