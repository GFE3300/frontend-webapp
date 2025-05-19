// src/features/register/stages/LocationPage.jsx
import React, { memo } from 'react';
import PropTypes from 'prop-types';
import MapLoader from '../maps/MapLoader'; // Provides GoogleMapsApiContext
import MapDisplayContextProvider, { DEFAULT_MAP_CENTER } from '../maps/MapDisplayContextProvider'; // Provides MapDisplayContext

// The actual Step1Location component will be imported by RegistrationPage and passed here as `children` or a specific prop.
// For this file, we are setting up the providers FOR Step1Location.

/**
 * @typedef {object} Coordinates
 * @property {number} lat - Latitude.
 * @property {number} lng - Longitude.
 */

/**
 * @typedef {object} FormDataLocationPartial
 * @property {Coordinates} [locationCoords] - Coordinates from the main form state.
 * @property {object} [address] - Address object from the main form state.
 * // ... other formData fields might exist but are not directly used by LocationPage itself
 */

/**
 * LocationPage Component
 *
 * A wrapper component responsible for setting up the necessary Google Maps API
 * and map display contexts for the location selection step.
 * It takes the relevant part of the global `formData` to initialize the map's visual state.
 *
 * This component will render the main orchestrator for the location step (which is Step1Location).
 *
 * @component
 * @param {object} props
 * @param {FormDataLocationPartial} props.formData - The relevant form data for initializing the location step.
 * @param {React.ReactNode} props.children - This will be the Step1Location component passed from RegistrationPage.
 * @param {React.ReactNode} [props.mapLoadingComponent] - Optional custom component for MapLoader's loading state.
 * @param {React.ReactNode} [props.mapErrorComponent] - Optional custom component for MapLoader's error state.
 */
const LocationPage = memo(({
    formData,
    children, // This will be <Step1Location ... />
    mapLoadingComponent,
    mapErrorComponent
}) => {
    // Determine initial center and marker position from formData.
    // formData might be null or its properties undefined initially.
    const initialCoords = formData?.locationCoords;
    const initialCenter = initialCoords || DEFAULT_MAP_CENTER; // Use default if no coords in formData
    const initialMarkerPosition = initialCoords || null; // Marker is null if no coords

    return (
        <MapLoader
            loadingComponent={mapLoadingComponent}
            errorComponent={mapErrorComponent}
        >
            {/*
                MapDisplayContextProvider needs to be inside MapLoader
                because it might indirectly try to use `window.google`
                for defaults or early calculations, though its main map
                instantiation is deferred to MapViewport.
                More importantly, any component consuming MapDisplayContext
                (like MapViewport) will also likely consume GoogleMapsApiContext.
            */}
            <MapDisplayContextProvider
                initialCenter={initialCenter}
                initialMarkerPosition={initialMarkerPosition}
            >
                {/*
                    The `children` prop here is expected to be the <Step1Location /> component.
                    Step1Location will then use useGoogleMapsApi() and useMapDisplay()
                    and render MapViewport, AddressForm, AutocompleteInput, GeolocationButton.
                */}
                {children}
            </MapDisplayContextProvider>
        </MapLoader>
    );
});

LocationPage.displayName = 'LocationPage';

LocationPage.propTypes = {
    /** The Step1Location component or any other child that needs the map contexts. */
    children: PropTypes.node.isRequired,
    /** Form data containing initial location coordinates and address. */
    formData: PropTypes.shape({
        locationCoords: PropTypes.shape({
            lat: PropTypes.number.isRequired,
            lng: PropTypes.number.isRequired,
        }),
        address: PropTypes.object, // Structure of address can be more specific if needed here
    }).isRequired, // formData is essential for initialization
    mapLoadingComponent: PropTypes.node,
    mapErrorComponent: PropTypes.node,
};

export default LocationPage;