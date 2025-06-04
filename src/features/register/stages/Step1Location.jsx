// frontend/src/features/register/stages/Step1Location.jsx
// MODIFIED: Added useState
import React, { memo, useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useDebouncedCallback } from 'use-debounce'; // For debouncing geocoding

import MapLoader, { useGoogleMapsApi } from '../maps/MapLoader'; // To ensure API is loaded for geocoding and provide MapLoader
import { useMapDisplay } from '../maps/MapDisplayContextProvider';
import { useReverseGeocoder } from '../maps/useReverseGeocoder'; // Our new hook

import MapViewport from '../maps/MapViewport';
import AddressForm from '../maps/AddressForm';
import AutocompleteInput from '../maps/AutocompleteInput';
import GeolocationButton from '../maps/GeolocationButton';
import MapDisplayContextProvider from '../maps/MapDisplayContextProvider';

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

    // NEW: Task 1.1: Define local state variables
    const [addressSource, setAddressSource] = useState('initial'); // 'initial', 'user_typed_address', 'map_interaction', 'autocomplete_selection', 'geolocation_result'
    const [isGeocodingFromMap, setIsGeocodingFromMap] = useState(false);
    // END NEW

    // Local state to track if the *user* has interacted, to prevent initial geocode if address exists (Kept from original for initial geocode logic)
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
            updateMarkerVisualPosition(null);
        }
    }, [formData?.locationCoords, updateMarkerVisualPosition, updateMapVisualCenter]);

    // Handle results from useReverseGeocoder hook
    useEffect(() => {
        if (geocodedAddress && isGeocodingFromMap) { // MODIFIED: Check isGeocodingFromMap
            // Conditionally update formData.address
            if (addressSource === 'map_interaction' || addressSource === 'geolocation_result') {
                console.log("Step1Location Effect 2: Updating formData.address from geocode result. Source:", addressSource, "New Address:", geocodedAddress);
                updateField('address', geocodedAddress);
            } else {
                console.log("Step1Location Effect 2: Geocode result received, but addressSource is", addressSource, "- NOT updating formData.address.");
            }
            setIsGeocodingFromMap(false); // MODIFIED: Reset flag
        } else if (geocodingError && isGeocodingFromMap) { // MODIFIED: Check isGeocodingFromMap
            if (addressSource === 'map_interaction' || addressSource === 'geolocation_result') {
                console.error("Step1Location Effect 2: Geocoding error after map interaction. Source:", addressSource, "Error:", geocodingError);
                // Do not clear formData.address based on error. Let user decide.
            }
            setIsGeocodingFromMap(false); // MODIFIED: Reset flag
        }
    }, [geocodedAddress, geocodingError, updateField, addressSource, isGeocodingFromMap]); // MODIFIED: Added addressSource and isGeocodingFromMap to dependencies

    // Effect 3: Initial geocode if coords exist but address doesn't (e.g., on page load with persisted coords)
    useEffect(() => {
        if (isApiLoaded && formData?.locationCoords && !formData?.address?.formattedAddress && !hasUserInteractedWithMapSource && addressSource === 'initial') {
            console.log("Step1Location Effect 3: Initial geocode triggered due to existing coords and missing address on load.");
            setIsGeocodingFromMap(true); // Assume this initial geocode is map-driven for now
            // We could introduce another addressSource like 'initial_geocode' if finer control is needed.
            // For now, treating it as if map set it.
            setAddressSource('map_interaction'); // Or a new source type e.g. 'initial_load_geocode'
            debouncedGeocode(formData.locationCoords);
            setHasUserInteractedWithMapSource(true); // Prevent re-running this initial geocode.
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isApiLoaded, formData?.locationCoords, formData?.address?.formattedAddress, addressSource]); // MODIFIED: Refined dependencies
    // hasUserInteractedWithMapSource and debouncedGeocode are stable.

    // --- Event Handlers ---

    const debouncedGeocode = useDebouncedCallback(
        (coordsToGeocode) => {
            if (isApiLoaded && isValidCoords(coordsToGeocode)) { // MODIFIED: Added isValidCoords check
                geocodeCoordinates(coordsToGeocode);
            } else {
                console.warn("Debounced geocode skipped: API not loaded or invalid coords.", coordsToGeocode);
                setIsGeocodingFromMap(false); // Reset if geocode is skipped
            }
        },
        750
    );

    // MODIFIED: Task 1.2.3
    const handleMarkerDragEnd = useCallback((coords) => {
        setHasUserInteractedWithMapSource(true);
        updateField('locationCoords', coords);
        setAddressSource('map_interaction'); // NEW
        setIsGeocodingFromMap(true);         // NEW
        clearGeocodingError();
        debouncedGeocode(coords);
    }, [updateField, debouncedGeocode, clearGeocodingError]);
    // END MODIFIED

    // MODIFIED: Task 1.2.2
    const handleGeolocationLocated = useCallback((coords) => {
        console.log("Geolocation SUCCESS - Coords:", coords);
        if (!isValidCoords(coords)) {
            console.error("Invalid coords from geolocation:", coords);
            return;
        }
        setHasUserInteractedWithMapSource(true);
        updateField('locationCoords', coords);
        // updateField('address', createEmptyAddress()); // MODIFIED: Decision - Do not clear address here, wait for geocode.
        setAddressSource('geolocation_result'); // NEW
        setIsGeocodingFromMap(true);            // NEW
        clearGeocodingError();
        debouncedGeocode(coords);
    }, [updateField, debouncedGeocode, clearGeocodingError]);
    // END MODIFIED

    // MODIFIED: Task 1.2.1
    const handlePlaceSelectedFromAutocomplete = useCallback((selection) => {
        setHasUserInteractedWithMapSource(true); // Considered a map-source interaction for simplicity.

        if (selection && selection.location && isValidCoords(selection.location)) {
            updateField('locationCoords', selection.location);
        } else {
            console.error("Invalid locationCoords from autocomplete:", selection?.location);
            // Don't update locationCoords if invalid, potentially clear it or leave as is.
            // For now, let's not clear it, user might have had a valid pin previously.
        }

        if (selection && selection.autoFormValues) {
            updateField('address', selection.autoFormValues);
        } else {
            console.error("Missing autoFormValues from autocomplete:", selection);
            // If autoFormValues are missing, don't update the address field.
        }

        setAddressSource('autocomplete_selection'); // NEW
        setIsGeocodingFromMap(false);               // NEW

        // Visual updates can still try to use selection.location
        // These are handled by Effect 1 reacting to formData.locationCoords.
        // If immediate visual update is desired before SSoT update propagates:
        // if (selection && selection.location && isValidCoords(selection.location)) {
        //     updateMarkerVisualPosition(selection.location);
        //     updateMapVisualCenter(selection.location);
        // }

        clearGeocodingError();
    }, [updateField, clearGeocodingError]); // updateMarkerVisualPosition, updateMapVisualCenter removed as Effect 1 handles it
    // END MODIFIED

    // MODIFIED: Task 1.4
    const handleAddressFormFieldChange = useCallback((fieldName, value) => {
        setHasUserInteractedWithMapSource(true);
        const newAddress = {
            ...(formData?.address || createEmptyAddress()),
            [fieldName]: value,
        };
        updateField('address', newAddress);
        setAddressSource('user_typed_address'); // NEW
        setIsGeocodingFromMap(false);           // NEW - Ensure this is false as it's not a map-driven geocode trigger
        clearGeocodingError();
    }, [formData?.address, updateField, clearGeocodingError]);
    // END MODIFIED

    const isAddressFormDisabled = isGeocodingLoading && isGeocodingFromMap; // MODIFIED: Only disable if geocoding was from map/geo

    if (!isApiLoaded) {
        return <div className="p-4 text-center text-gray-500">Loading map services...</div>;
    }

    return (
        <div className="flex flex-col gap-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:flex-grow">
                    <AutocompleteInput
                        onPlaceSelected={handlePlaceSelectedFromAutocomplete}
                        disabled={!isApiLoaded}
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

            <div>
                <label htmlFor="location-map-viewport" className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Adjust pin on map:
                </label>
                <MapViewport
                    onMarkerDragEnd={handleMarkerDragEnd}
                    isMarkerDraggable={isApiLoaded}
                />
            </div>

            {(isGeocodingLoading && isGeocodingFromMap) && <p className="text-sm text-gray-600 dark:text-neutral-400">Fetching address for pinned location...</p>}
            {geocodingError && (addressSource === 'map_interaction' || addressSource === 'geolocation_result') && (
                <p style={{ color: 'red' }} className="text-sm">{geocodingError}</p>
            )}
            <div className='mt-8'>
                <AddressForm
                    addressData={formData?.address || createEmptyAddress()}
                    onFieldChange={handleAddressFormFieldChange}
                    validationErrors={errors?.address}
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
            lat: PropTypes.number,
            lng: PropTypes.number,
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
    countryOptions: PropTypes.arrayOf(PropTypes.object),
};

Step1Location.defaultProps = {
    errors: {},
    countryOptions: undefined,
};

// Wrapper component remains the same as in the original `frontend.txt`
export default function Step1LocationWrapper(props) {
    const { formData, updateField, errors, countryOptions } = props;

    const initialCoords = formData?.locationCoords;

    const initialCenter = isValidCoords(initialCoords) ? initialCoords : undefined; // Pass undefined to let provider use default
    const initialMarkerPosition = isValidCoords(initialCoords) ? initialCoords : null;

    return (
        <MapLoader>
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

Step1LocationWrapper.propTypes = {
    formData: PropTypes.object.isRequired,
    updateField: PropTypes.func.isRequired,
    errors: PropTypes.object,
    countryOptions: PropTypes.array,
};