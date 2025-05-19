// src/features/register/stages/Step1Location.jsx
import React, { memo, useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useDebouncedCallback } from 'use-debounce'; // For debouncing geocoding

import { useGoogleMapsApi } from '../maps/MapLoader'; // To ensure API is loaded for geocoding
import { useMapDisplay } from '../maps/MapDisplayContextProvider';
import { useReverseGeocoder } from '../maps/useReverseGeocoder'; // Our new hook

import MapViewport from '../maps/MapViewport';
import AddressForm from '../maps/AddressForm';
import AutocompleteInput from '../maps/AutocompleteInput';
import GeolocationButton from '../maps/GeolocationButton';
import MapLoader from '../maps/MapLoader';
import MapDisplayContextProvider from '../maps/MapDisplayContextProvider';

// Placeholder for localized strings if needed for this component directly
// const scriptLines_Step1Location = { /* ... */ };

/**
 * @typedef {import('../maps/AddressForm').AddressData} AddressData
 * @typedef {import('../maps/AddressForm').CountryOption} CountryOption
 * @typedef {import('../maps/MapDisplayContextProvider').Coordinates} Coordinates
 * @typedef {import('../maps/AutocompleteInput').AutocompletePlaceSelection} AutocompletePlaceSelection
 */

/**
 * @typedef {object} Step1LocationFormData
 * @property {Coordinates} [locationCoords]
 * @property {AddressData} [address]
 * // other formData fields are not relevant here directly
 */

/**
 * Defines an empty or default address structure.
 * @returns {AddressData}
 */
const createEmptyAddress = () => ({
    street: '',
    city: '',
    postalCode: '',
    country: '',
    formattedAddress: '',
});

const isValidCoords = (coords) => {
    return coords && typeof coords.lat === 'number' && typeof coords.lng === 'number' && isFinite(coords.lat) && isFinite(coords.lng);
};

/**
 * Step1Location Component (The Orchestrator)
 *
 * Manages the user interactions for selecting a location. It integrates the map view,
 * address form, autocomplete search, and geolocation button. It updates the
 * global form state (`formData`) and commands visual updates to the map.
 *
 * @component
 * @param {object} props
 * @param {Step1LocationFormData} props.formData - Current location-related data from `useFormState`.
 * @param {(fieldName: string, value: any) => void} props.updateField - Function from `useFormState` to update global form data.
 * @param {object} [props.errors] - Validation errors for this step, specifically for `locationCoords` and `address` fields.
 * @param {CountryOption[]} [props.countryOptions] - Country options for the AddressForm dropdown.
 */
const Step1Location = memo(({ formData, updateField, errors, countryOptions }) => {
    const { isLoaded: isApiLoaded } = useGoogleMapsApi(); // Check if Google API is generally loaded
    const {
        updateMarkerVisualPosition,
        updateMapVisualCenter,
    } = useMapDisplay();

    const {
        address: geocodedAddress,
        isLoading: isGeocodingLoading,
        error: geocodingError,
        geocodeCoordinates,
        clearGeocodingError,
    } = useReverseGeocoder();

    // Local state to track if the *user* has interacted, to prevent initial geocode if address exists
    const [hasUserInteractedWithMapSource, setHasUserInteractedWithMapSource] = useState(false);

    // --- Effects for Synchronization and Initialization ---

    // Effect 1: Update visual marker and center when formData.locationCoords changes externally or on load.
    useEffect(() => {
        const coords = formData?.locationCoords;
        if (isValidCoords(coords)) {
            // console.log("Step1Location Effect 1: Updating visuals for coords:", coords);
            updateMarkerVisualPosition(coords);
            updateMapVisualCenter(coords);
        } else {
            // console.log("Step1Location Effect 1: No valid coords, clearing marker.");
            updateMarkerVisualPosition(null); // <--- POTENTIAL CULPRIT
        }
    }, [formData?.locationCoords, updateMarkerVisualPosition, updateMapVisualCenter]);

    // Effect 2: Handle results from useReverseGeocoder hook
    useEffect(() => {
        if (geocodedAddress) {
            // Only update formData's address if the geocoded one is different
            // to prevent potential loops if parsing is slightly different.
            // A deepEqual might be too strict if formattedAddress differs but components are same.
            // For now, we'll update if the geocodedAddress object itself is new.
            if (formData?.address?.formattedAddress !== geocodedAddress.formattedAddress ||
                formData?.address?.street !== geocodedAddress.street ||
                formData?.address?.city !== geocodedAddress.city) { // Add more checks if needed
                updateField('address', geocodedAddress);
            }
        } else if (geocodingError && hasUserInteractedWithMapSource) {
            // If geocoding failed *after a user interaction that triggered it*,
            // we might want to clear the address or show an error.
            // For now, AddressForm will show its fields based on formData.address
            // And Step1Location could display geocodingError if needed.
            // Clearing the address might be too destructive if user had typed something.
            // updateField('address', createEmptyAddress());
        }
    }, [geocodedAddress, geocodingError, updateField, formData?.address, hasUserInteractedWithMapSource]);


    // Effect 3: Initial geocode if coords exist but address doesn't (e.g., on page load with persisted coords)
    useEffect(() => {
        // Only run on initial mount and if API is ready
        if (isApiLoaded && formData?.locationCoords && !formData?.address && !hasUserInteractedWithMapSource) {
            // If we have coordinates but no address, and the user hasn't interacted yet to cause a geocode,
            // perform an initial geocode. This handles loading persisted state.
            debouncedGeocode(formData?.locationCoords);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isApiLoaded, formData?.locationCoords, formData?.address]); // Deliberately run once on initial relevant data
    // `hasUserInteractedWithMapSource` and `debouncedGeocode` are stable.


    // --- Event Handlers ---

    const debouncedGeocode = useDebouncedCallback(
        (coordsToGeocode) => {
            if (isApiLoaded) { // Ensure API is still loaded
                geocodeCoordinates(coordsToGeocode);
            }
        },
        750 // Debounce reverse geocoding calls (e.g., during rapid marker dragging)
    );

    const handleMarkerDragEnd = useCallback((coords) => {
        setHasUserInteractedWithMapSource(true);
        updateField('locationCoords', coords); // Update SSoT first
        // Visual update already handled by Effect 1 reacting to formData.locationCoords change
        // or could be called here for immediate feedback: updateMarkerVisualPosition(coords);
        clearGeocodingError(); // Clear any previous geocoding error
        debouncedGeocode(coords);
    }, [updateField, debouncedGeocode, clearGeocodingError]);

    const handleGeolocationLocated = useCallback((coords) => {
        console.log("Geolocation SUCCESS - Coords:", coords); // Log received coords
        if (!isValidCoords(coords)) { // Assuming you have isValidCoords helper
            console.error("Invalid coords from geolocation:", coords);
            // Potentially set an error state for the user
            return;
        }

        setHasUserInteractedWithMapSource(true);
        updateField('locationCoords', coords);
        updateField('address', createEmptyAddress());
        clearGeocodingError();
        debouncedGeocode(coords);
    }, [updateField, debouncedGeocode, clearGeocodingError]);

    const handlePlaceSelectedFromAutocomplete = useCallback((selection) => {
        setHasUserInteractedWithMapSource(true);

        if (selection && selection.location) {
            updateField('locationCoords', selection.location);
        } else {
            console.error("Invalid locationCoords from autocomplete:", selection?.location);
        }

        if (selection && selection.autoFormValues) {
            updateField('address', selection.autoFormValues);
        } else {
            console.error("Missing autoFormValues from autocomplete:", selection);
        }

        // Visual updates can still try to use selection.location
        if (selection && selection.location) {
            updateMarkerVisualPosition(selection.location);
            updateMapVisualCenter(selection.location);
        }

        clearGeocodingError();
    }, [updateField, clearGeocodingError, updateMarkerVisualPosition, updateMapVisualCenter]);

    const handleAddressFormFieldChange = useCallback((fieldName, value) => {
        setHasUserInteractedWithMapSource(true); // Manual address input is a map-related interaction
        const newAddress = {
            ...(formData?.address || createEmptyAddress()),
            [fieldName]: value,
        };
        updateField('address', newAddress);

        // When user types an address, the link to current map coordinates is less certain.
        // Option: Clear locationCoords if address is manually changed significantly?
        // updateField('locationCoords', null);
        // This would remove the marker. For now, let's keep marker as is.
        // If address changes, clear any geocoding error, as user is now overriding.
        clearGeocodingError();
    }, [formData?.address, updateField, clearGeocodingError]);

    // Determine if AddressForm should be disabled (e.g., during geocoding after a map interaction)
    // Can be refined: perhaps only disable if geocoding was triggered by map/geo, not autocomplete.
    const isAddressFormDisabled = isGeocodingLoading;


    // --- Render ---
    // Add a general loading state for the whole map section if API is not ready
    if (!isApiLoaded) {
        return <div className="p-4 text-center text-gray-500">Loading map services...</div>;
    }

    return (
        <div className="flex flex-col gap-y-4"> {/* Outer container for the location step UI */}
            {/* Top section: Autocomplete and Geolocation Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:flex-grow">
                    <AutocompleteInput
                        onPlaceSelected={handlePlaceSelectedFromAutocomplete}
                        // initialInputValue={formData.address?.formattedAddress || ''} // Can prefill if desired
                        disabled={!isApiLoaded} // Disable if API not ready
                    />
                </div>
                <div className="flex-shrink-0">
                    <GeolocationButton
                        onLocate={handleGeolocationLocated}
                        onError={(err) => console.warn("Geolocation Error in Step1:", err.message)}
                        disabled={!isApiLoaded}
                    />
                </div>
            </div>

            {/* Middle section: Map Viewport */}
            <div>
                {/* Label for MapViewport (consider accessibility and styling) */}
                <label htmlFor="location-map-viewport" className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Adjust pin on map:
                </label>
                <MapViewport
                    // mapOptions={{}} // Pass any custom map options
                    onMarkerDragEnd={handleMarkerDragEnd}
                    // onMapIdle={/* handle map idle if needed */}
                    isMarkerDraggable={isApiLoaded} // Only allow drag if API ready
                // The MapViewport reads markerVisualPosition and mapVisualCenter from MapDisplayContext,
                // which are updated based on formData.locationCoords by Effect 1.
                />
            </div>


            {/* Bottom section: Address Form */}
            <div className='mt-8'>
                <AddressForm
                    addressData={formData?.address || createEmptyAddress()}
                    onFieldChange={handleAddressFormFieldChange}
                    validationErrors={errors?.address} // Pass specific address errors
                    countryOptions={countryOptions}
                    disabled={isAddressFormDisabled || !isApiLoaded}
                />
            </div>
        </div>
    );
});

Step1Location.displayName = 'Step1Location';

Step1Location.propTypes = {
    formData: PropTypes.shape({
        locationCoords: PropTypes.shape({
            lat: PropTypes.number, // Not isRequired, can be null
            lng: PropTypes.number, // Not isRequired, can be null
        }),
        address: PropTypes.shape({
            street: PropTypes.string,
            city: PropTypes.string,
            postalCode: PropTypes.string,
            country: PropTypes.string,
            formattedAddress: PropTypes.string,
        }),
    }).isRequired,
    updateField: PropTypes.func.isRequired,
    errors: PropTypes.object,
    countryOptions: PropTypes.arrayOf(PropTypes.object), // More specific shape if available
};

Step1Location.defaultProps = {
    errors: {},
    countryOptions: undefined, // Let AddressForm use its default if not provided
};

export default function Step1LocationWrapper(props) {
    const { formData, updateField, errors, countryOptions } = props;

    const initialCoords = formData?.locationCoords;
    const initialCenter = initialCoords || undefined;
    const initialMarkerPosition = initialCoords || null;

    return (
        <MapLoader /* pass mapLoadingComponent, mapErrorComponent from props if needed */ >
            <MapDisplayContextProvider
                initialCenter={initialCenter}
                initialMarkerPosition={initialMarkerPosition}
            >
                <Step1Location
                    formData={formData}
                    updateField={updateField}
                    errors={errors}
                    countryOptions={countryOptions}
                />
            </MapDisplayContextProvider>
        </MapLoader>
    );
}

// Add prop types for Step1LocationWrapper
Step1LocationWrapper.propTypes = {
    formData: PropTypes.object.isRequired,
    updateField: PropTypes.func.isRequired,
    errors: PropTypes.object,
    countryOptions: PropTypes.array,
};
