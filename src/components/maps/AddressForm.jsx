import React, { useState, useEffect } from 'react';
import { useMap } from './MapLoader';
import { deepEqual } from '../../utils/utils';
import { useMapContext } from './MapContextProvider';

// Static fallback list (ISO 3166-1 alpha-2)
const STATIC_COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'ES', name: 'Spain' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'IT', name: 'Italy' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'PT', name: 'Portugal' },
    { code: 'AU', name: 'Australia' },
    { code: 'BR', name: 'Brazil' },
    { code: 'JP', name: 'Japan' },
    { code: 'IN', name: 'India' },
    { code: 'MX', name: 'Mexico' },
    { code: 'CN', name: 'China' },
    { code: 'RU', name: 'Russia' },
    { code: 'ZA', name: 'South Africa' },
];

const AddressForm = ({ initialValues = {}, onChange, validationErrors = {} }) => {
    const { google } = useMap();
    const [placesApi, setPlacesApi] = useState(null);
    const [sessionToken, setSessionToken] = useState(null);
    const [localAddress, setLocalAddress] = useState(() => ({
        street: '',
        city: '',
        postalCode: '',
        country: '',
        ...initialValues // Safely merge initial values
    }));
    const [countries, setCountries] = useState(STATIC_COUNTRIES);
    const [isManualUpdate, setIsManualUpdate] = useState(false);
    const context = useMapContext();

    // Load Places API (New) and initialize session token
    useEffect(() => {
        if (!google) return;
        google.maps.importLibrary('places')
            .then((libs) => {
                setPlacesApi(libs);
                setSessionToken(new libs.AutocompleteSessionToken());
            })
            .catch(err => console.error('Places import failed', err));
    }, [google]);

    // Fetch dynamic country list via AutocompleteSuggestion
    useEffect(() => {
        if (!placesApi || !sessionToken) return;

        const fetchCountries = async () => {
            try {
                const { suggestions } = await placesApi.AutocompleteSuggestion.fetchAutocompleteSuggestions({
                    input: '',
                    sessionToken,
                    types: ['country']
                });
                const parsed = suggestions.map(({ placePrediction }) => {
                    const terms = placePrediction.terms || [];
                    const codeTerm = terms[0]?.value || '';
                    const name = terms.map(t => t.value).join(' ');
                    return {
                        code: codeTerm.slice(0, 2).toUpperCase(),
                        name
                    };
                });
                const unique = Array.from(
                    new Map(parsed.map(c => [c.code, c])).values()
                );
                unique.sort((a, b) => a.name.localeCompare(b.name));
                setCountries(unique);
            } catch (err) {
                console.error('Country autocomplete error', err);
            }
        };
        fetchCountries();
    }, [placesApi, sessionToken]);

    useEffect(() => {
        // Only reset if update was programmatic
        if (context.flags.source !== 'manual' && !deepEqual(initialValues, localAddress)) {
            setLocalAddress(prev => ({ ...prev, ...initialValues }));
            setIsManualUpdate(false); // 🟢 Allow future updates
        }
    }, [initialValues]);

    // Handle field change
    const handleChange = (field, value) => {
        setIsManualUpdate(true); // 🛑 Block overwrites
        const updated = { ...localAddress, [field]: value };
        setLocalAddress(updated);
        onChange?.(updated);
    };

    return (
        <div className="space-y-4 w-full">
            <div className="font-playfair text-lg flex flex-row items-center mb-2 font-semibold text-[var(--color-chocolate)]">
                From the oven to which door?
            </div>
            {/* Street Address */}
            <div className="relative flex flex-row space-x-4 text-sm">
                <input
                    id="street"
                    type="text"
                    value={localAddress.street}
                    placeholder='Street Address'
                    onChange={e => handleChange('street', e.target.value)}
                    className="w-full h-8 border-b-2 border-chocolate focus:outline-none focus:border-gold appearance-none px-2"
                    aria-invalid={!!validationErrors.street}
                />
                {validationErrors.street && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.street}</p>
                )}
            </div>

            <div className="relative flex flex-row space-x-4 text-sm">

                {/* City */}
                <div className="relative">
                    <input
                        id="city"
                        type="text"
                        value={localAddress.city}
                        placeholder='City'
                        onChange={e => handleChange('city', e.target.value)}
                        className="w-full h-8 border-b-2 border-chocolate focus:outline-none focus:border-gold appearance-none px-2"
                        aria-invalid={!!validationErrors.city}
                    />
                    {validationErrors.city && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.city}</p>
                    )}
                </div>

                {/* Postal Code */}
                <div className="relative flex flex-row space-x-4 text-sm">
                    <input
                        id="postalCode"
                        type="text"
                        value={localAddress.postalCode}
                        placeholder='Postal Code'
                        onChange={e => handleChange('postalCode', e.target.value)}
                        className="w-full h-8 border-b-2 border-chocolate focus:outline-none focus:border-gold appearance-none px-2"
                        aria-invalid={!!validationErrors.postalCode}
                    />
                    {validationErrors.postalCode && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.postalCode}</p>
                    )}
                </div>

            </div>

            {/* Country Selector */}
            <div className="relative">
                <select
                    id="country"
                    value={localAddress.country}
                    onChange={e => handleChange('country', e.target.value)}
                    disabled={!countries.length}
                    className="w-full h-8 border-b-2 border-chocolate focus:outline-none focus:border-gold appearance-none px-2"
                    aria-invalid={!!validationErrors.country}
                >
                    <option value="">Select a country</option>
                    {countries.map(({ code, name }) => (
                        <option key={code} value={code}>{name}</option>
                    ))}
                </select>
                {validationErrors.country && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.country}</p>
                )}
            </div>
        </div>
    );
};

export default AddressForm;
