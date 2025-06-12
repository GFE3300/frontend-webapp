import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash/debounce';
import { useGoogleMapsApi } from './MapLoader';
import Icon from '../../../components/common/Icon';
import { InputField } from '../subcomponents';
import { scriptLines_Registration as scriptLines } from '../utils/script_lines';

/**
 * @typedef {import('./AddressForm').AddressData} AddressData
 */
/**
 * @typedef {Object} AutocompletePlaceSelection
 * @property {string} placeId
 * @property {string} name // displayName
 * @property {string} address // formattedAddress
 * @property {{ lat: number, lng: number }} location
 * @property {google.maps.places.AddressComponent[]} components
 * @property {AddressData} autoFormValues
 */

const dropdownAnimations = {
    initial: { opacity: 0, y: -10, maxHeight: 0 },
    animate: { opacity: 1, y: 0, maxHeight: '240px', transition: { type: 'spring', stiffness: 300, damping: 25 } },
    exit: { opacity: 0, y: -5, maxHeight: 0, transition: { duration: 0.2 } }
};

const highlightClientSide = (text, query) => {
    if (!text || !query) return { __html: text || '' };
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return {
        __html: parts.map((part, index) =>
            regex.test(part) ? `<strong class="font-semibold text-primary-600 dark:text-primary-400" key="${index}">${part}</strong>` : part
        ).join(''),
    };
};

const AutocompleteInput = memo(({
    onPlaceSelected,
    initialInputValue = '',
    inputClassName,
    searchByTextOptions = {},
    disabled = false,
}) => {
    const { google, isLoaded: isApiLoaded } = useGoogleMapsApi();
    const [inputValue, setInputValue] = useState(initialInputValue);
    const [suggestions, setSuggestions] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    const [error, setError] = useState(null);

    const inputActualRef = useRef(null);
    const dropdownRef = useRef(null);

    const setInputRef = useCallback((node) => {
        if (node) inputActualRef.current = node;
    }, []);

    useEffect(() => {
        if (isApiLoaded && google && google.maps && google.maps.places) {
            setError(null);
        } else if (isApiLoaded && (!google || !google.maps || !google.maps.places)) {
            // MODIFICATION: Use centralized script lines
            console.error(scriptLines.autocompleteInput.error.placesLibraryNotLoaded);
            setError(scriptLines.autocompleteInput.error.placesLibraryNotLoaded);
        }
    }, [isApiLoaded, google]);

    const fetchSuggestions = useCallback(
        debounce(async (inputVal) => {
            if (!inputVal || !isApiLoaded || !google || !google.maps.places || !google.maps.places.Place) {
                setSuggestions([]);
                setIsLoading(false);
                if (isApiLoaded && (!google || !google.maps.places)) {
                    // MODIFICATION: Use centralized script lines
                    setError(scriptLines.autocompleteInput.error.placesLibraryNotLoaded);
                }
                return;
            }
            setIsLoading(true);
            setError(null);

            const request = {
                textQuery: inputVal,
                fields: ['id', 'displayName', 'formattedAddress', 'location', 'types', 'iconBackgroundColor'],
                language: 'en',
                ...searchByTextOptions,
            };

            try {
                const { places } = await google.maps.places.Place.searchByText(request);
                setSuggestions(places || []);
            } catch (e) {
                console.error('Place.searchByText error:', e);
                // MODIFICATION: Use centralized script lines
                setError(scriptLines.autocompleteInput.error.searchByTextError);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, 400),
        [isApiLoaded, google, searchByTextOptions]
    );

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        setActiveIndex(-1);
        if (value.trim().length >= 3) {
            fetchSuggestions(value);
        } else {
            setSuggestions([]);
            setIsLoading(false);
            fetchSuggestions.cancel();
        }
    };

    const handleSelectSuggestion = useCallback(async (placeSuggestion) => {
        if (!google || !google.maps.places || !placeSuggestion.id) return;

        const displayValue = placeSuggestion.displayName || placeSuggestion.formattedAddress || '';
        setInputValue(displayValue);
        setSuggestions([]);
        setIsFetchingDetails(true);
        setError(null);

        try {
            const placeInstance = new google.maps.places.Place({ id: placeSuggestion.id });
            await placeInstance.fetchFields({
                fields: ['id', 'displayName', 'formattedAddress', 'location', 'addressComponents'],
            });

            if (!placeInstance.location || !placeInstance.addressComponents) {
                throw new Error("Incomplete place details received.");
            }

            const location = placeInstance.location;
            const addressComponents = placeInstance.addressComponents;
            const autoFormValues = {};
            let streetParts = { number: '', route: '' };

            addressComponents.forEach(component => {
                if (component.types.includes('street_number')) streetParts.number = component.longText;
                else if (component.types.includes('route')) streetParts.route = component.longText;
                else if (component.types.includes('locality') || component.types.includes('postal_town')) autoFormValues.city = component.longText;
                else if (component.types.includes('administrative_area_level_1')) autoFormValues.state = component.shortText;
                else if (component.types.includes('postal_code')) autoFormValues.postalCode = component.longText;
                else if (component.types.includes('country')) autoFormValues.country = component.shortText;
            });
            autoFormValues.street = `${streetParts.number} ${streetParts.route}`.trim();
            if (!autoFormValues.street && placeInstance.formattedAddress) {
                autoFormValues.street = placeInstance.formattedAddress.split(',')[0].trim();
            }

            const finalAutoFormValues = {
                street: autoFormValues.street || '',
                city: autoFormValues.city || '',
                postalCode: autoFormValues.postalCode || '',
                country: autoFormValues.country || '',
                formattedAddress: placeInstance.formattedAddress || ''
            };

            onPlaceSelected({
                placeId: placeInstance.id,
                name: placeInstance.displayName || '',
                address: placeInstance.formattedAddress || '',
                location: { lat: location.lat, lng: location.lng },
                components: addressComponents,
                autoFormValues: finalAutoFormValues,
            });

        } catch (e) {
            console.error('Place details fetchFields error on selection:', e);
            // MODIFICATION: Use centralized script lines
            setError(scriptLines.autocompleteInput.error.fetchDetailsFailed);
        } finally {
            setIsFetchingDetails(false);
        }
    }, [google, onPlaceSelected]);

    const containerRef = useRef(null);

    const handleKeyDown = useCallback((e) => {
        if (disabled) return;

        const { key } = e;
        const numSuggestions = suggestions.length;

        if (numSuggestions === 0 && !['Escape', 'Tab'].includes(key)) return;

        switch (key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % numSuggestions);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + numSuggestions) % numSuggestions);
                break;
            case 'Enter':
                if (activeIndex >= 0) {
                    e.preventDefault();
                    handleSelectSuggestion(suggestions[activeIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setSuggestions([]);
                break;
            case 'Tab':
                setSuggestions([]); // Close suggestions on Tab out
                break;
            default:
                break;
        }
    }, [disabled, suggestions, activeIndex, handleSelectSuggestion]);

    // Effect to handle clicks outside the component to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        };

        if (suggestions.length > 0) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [suggestions]);

    // Effect to scroll the active suggestion into view during keyboard navigation
    useEffect(() => {
        if (activeIndex >= 0 && dropdownRef.current) {
            const activeElement = dropdownRef.current.children[activeIndex];
            if (activeElement) {
                activeElement.scrollIntoView({
                    block: 'nearest',
                });
            }
        }
    }, [activeIndex]);

    const isEffectivelyDisabled = disabled || !isApiLoaded || !google || !google.maps.places || !google.maps.places.Place;

    let statusIcon = <Icon name="search" className="w-6 h-6 text-gray-400 dark:text-neutral-500" />;
    if (isLoading) {
        statusIcon = <Icon name="progress_activity" className="animate-spin w-6 h-6 text-primary-500 dark:text-primary-400" />;
    } else if (isFetchingDetails) {
        statusIcon = <Icon name="progress_activity" className="animate-spin w-6 h-6 text-secondary-500 dark:text-secondary-400" />;
    }

    const getSuggestionSecondaryText = (place) => {
        if (!place.formattedAddress || !place.displayName) return '';
        let secondary = place.formattedAddress.replace(place.displayName, '').trim();
        if (secondary.startsWith(',')) secondary = secondary.substring(1).trim();
        return secondary || place.formattedAddress;
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <InputField
                ref={setInputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                // MODIFICATION: Use centralized script lines
                label={scriptLines.autocompleteInput.label}
                className={inputClassName || "w-full"}
                placeholder={scriptLines.autocompleteInput.placeholder}
                disabled={isEffectivelyDisabled}
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={suggestions.length > 0}
                aria-controls="autocomplete-suggestions-list"
                aria-activedescendant={activeIndex >= 0 ? `suggestion-item-${activeIndex}` : undefined}
            />
            <div className="absolute top-0 right-0 h-full flex items-center pr-3 pointer-events-none">
                {statusIcon}
            </div>

            <AnimatePresence>
                {(suggestions.length > 0 && inputValue.trim().length >= 3) && (
                    <motion.ul
                        {...dropdownAnimations}
                        ref={dropdownRef}
                        id="autocomplete-suggestions-list"
                        role="listbox"
                        // MODIFICATION: Use centralized script lines
                        aria-label={scriptLines.autocompleteInput.aria.addressSuggestions}
                        className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border-2 border-rose-200 dark:border-neutral-700 rounded-lg shadow-xl overflow-y-auto max-h-64"
                    >
                        {suggestions.map((place, idx) => (
                            <motion.li
                                key={place.id || `suggestion-${idx}`}
                                id={`suggestion-item-${idx}`}
                                role="option"
                                aria-selected={idx === activeIndex}
                                className={`px-4 py-3 cursor-pointer group ${idx === activeIndex ? 'bg-primary-50 dark:bg-primary-700/30' : 'hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
                                onClick={() => handleSelectSuggestion(place)}
                                onMouseEnter={() => setActiveIndex(idx)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center bg-rose-100 dark:bg-neutral-700 group-hover:bg-rose-200 dark:group-hover:bg-neutral-600 transition-colors duration-200">
                                        <Icon name="location_on" className="w-6 h-6 text-gray-500 dark:text-neutral-400" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p
                                            className="text-sm font-regular text-gray-900 dark:text-neutral-100 truncate"
                                            dangerouslySetInnerHTML={highlightClientSide(place.displayName || 'Unknown Place', inputValue)}
                                            title={place.displayName || 'Unknown Place'}
                                        />
                                        <p
                                            className="text-xs text-neutral-500 dark:text-neutral-400 truncate"
                                            title={getSuggestionSecondaryText(place)}
                                        >
                                            {getSuggestionSecondaryText(place)}
                                        </p>
                                    </div>
                                </div>
                            </motion.li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>

            {error && !isLoading && !isFetchingDetails && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1 pl-1" role="alert">{error}</p>
            )}
            {!isLoading && !isFetchingDetails && !error && inputValue.trim().length >= 3 && suggestions.length === 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 px-4 py-3 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-xl">
                    <p className="text-sm text-gray-500 dark:text-neutral-400 text-center">
                        {scriptLines.autocompleteInput.status.noResults}
                    </p>
                </div>
            )}
        </div>
    );
});

AutocompleteInput.displayName = 'AutocompleteInput';
AutocompleteInput.propTypes = {
    onPlaceSelected: PropTypes.func.isRequired,
    initialInputValue: PropTypes.string,
    inputClassName: PropTypes.string,
    searchByTextOptions: PropTypes.object,
    disabled: PropTypes.bool,
};

export default AutocompleteInput;