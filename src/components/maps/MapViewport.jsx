import React, { useEffect, useRef } from 'react';
import { useMap } from './MapLoader';
import { SpoonIcon } from '../../assets/icons/spoon.js';

const MapViewport = ({
    center,
    markerPosition,
    onMarkerDragEnd,
    onCenterChanged,
    mapOptions = {}
}) => {
    const { google, isLoaded, setMap } = useMap();
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    // ✅ Create cupcake SVG DOM element
    const createCupcakeElement = () => {
        const svg = SpoonIcon;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = svg;
        wrapper.style.width = '40px';
        wrapper.style.height = '40px';
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.pointerEvents = 'auto';

        return wrapper;
    };

    // ✅ Initialize map
    useEffect(() => {
        if (!isLoaded || !containerRef.current) return;

        const map = new google.maps.Map(containerRef.current, {
            disableDefaultUI: true,
            zoom: 15,
            center: new google.maps.LatLng(center.lat, center.lng),
            mapId: import.meta.env.VITE_GMAPS_MAP_ID,
            ...mapOptions
        });

        mapRef.current = map;
        setMap(map);

        return () => {
            setMap(null);
            if (markerRef.current) {
                markerRef.current.map = null;
            }
        };
    }, [isLoaded]);

    // ✅ Create marker using `importLibrary` to guarantee access to AdvancedMarkerElement
    useEffect(() => {
        if (!google || !mapRef.current) return;

        const initializeMarker = async () => {
            const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

            const cupcake = createCupcakeElement();

            if (!markerRef.current) {
                markerRef.current = new AdvancedMarkerElement({
                    position: markerPosition,
                    map: mapRef.current,
                    content: cupcake,
                    gmpDraggable: true,
                    title: 'Delivery location'
                });

                markerRef.current.addListener('dragend', (e) => {
                    const position = markerRef.current.position;
                    onMarkerDragEnd({
                        lat: position.lat,
                        lng: position.lng
                    });
                });
            } else {
                markerRef.current.position = markerPosition;
            }
        };

        initializeMarker();
    }, [markerPosition, google, onMarkerDragEnd]);

    // ✅ Pan map on center change
    useEffect(() => {
        if (!mapRef.current || !center) return;
        mapRef.current.panTo(center);
        onCenterChanged?.(center);
    }, [center]);

    if (!isLoaded) return null;

    return (
        <div
            className="relative w-full h-[160px] rounded-xl shadow-md overflow-hidden border-2 border-[var(--color-chocolate)]"
            aria-label="Delivery location map"
            role="application"
        >
            <div
                ref={containerRef}
                className="w-full h-full focus:outline-none"
                id="delivery-map"
                tabIndex="-1"
            />
        </div>
    );
};

export default MapViewport;
