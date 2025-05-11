import React, { useState, useEffect } from 'react';
import { useMap } from './MapLoader';
import { useMapContext } from './MapContextProvider';
import { getCountryCodeFromName } from '../../utils/utils';

// Reusable bakery-themed spinner component
const Spinner = () => (
    <div className="flex justify-center p-2" role="status">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-500 border-t-transparent"></div>
        <span className="sr-only">Loading address...</span>
    </div>
);

// Helper to parse address components from Geocoder results
const parseAddressComponents = (results) => {
    const address = { formattedAddress: results[0].formatted_address };
    const componentMap = {
        street_number: 'street',
        route: 'street',
        locality: 'city',
        postal_code: 'postalCode',
        country: 'country'
    };



    results[0].address_components.forEach(component => {
        const countryComponent = component.types.includes('country') ? component : null;
        if (countryComponent) {
            address.country = countryComponent.short_name ||
                getCountryCodeFromName(countryComponent.long_name);
        }

        component.types.forEach(type => {
            if (componentMap[type]) {
                const key = componentMap[type];
                if (!address[key]) {
                    address[key] = component.long_name;
                } else if (key === 'street') {
                    address[key] = `${component.long_name} ${address[key]}`;
                }
            }
        });
    });

    return address;
};

const ReverseGeocodeHandler = ({ coords, onResult, children }) => {
    const { google, isLoaded } = useMap();
    const context = useMapContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!isLoaded || !coords?.lat || !coords?.lng) return;

        const geocoder = new google.maps.Geocoder();
        setLoading(true);
        setError(null);

        geocoder.geocode({ location: coords }, (results, status) => {
            setLoading(false);

            if (status === 'OK' && results?.[0]) {
                const parsedAddress = parseAddressComponents(results);
                setResult(parsedAddress);
                onResult?.(parsedAddress);
            } else {
                const errorMessage = status === 'ZERO_RESULTS'
                    ? 'No address found for this location'
                    : 'Error fetching address details';
                setError(errorMessage);
            }
        });
    }, [coords, isLoaded, google]);

    useEffect(() => {
        if (context.flags.skipNextReverseGeocode || !result || loading) return;
        const mergedAddress = {
            ...context.address,
            ...Object.fromEntries(
                Object.entries(result).filter(([_, v]) => !v)
            )
        };
        context.updateAddress(mergedAddress);
    }, [result, loading]);

    // Render prop pattern
    if (typeof children === 'function') {
        return children({ loading, error, result });
    }

    return (
        <div className="relative">
            {loading && <Spinner />}

            {error && (
                <div
                    className="text-red-600 font-inter text-sm mt-2"
                    role="alert"
                >
                    🍞 {error}
                </div>
            )}
        </div>
    );
};

export default ReverseGeocodeHandler;