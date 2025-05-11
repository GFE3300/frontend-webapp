import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
//eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash/debounce';
import { useMap } from './MapLoader';
import Icon from '../common/Icon';

const dropdownAnimations = {
    initial: {
        opacity: 0,
        y: -10,
        scale: 0.98
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20
        }
    },
    exit: {
        opacity: 0,
        y: -5,
        scale: 0.98,
        transition: { duration: 0.15 }
    }
};

const suggestionItemAnimations = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
};


const highlightPredictionText = (suggestion) => {
    const { text } = suggestion.placePrediction;
    const matched = text.matchedSubstrings || [];
    const parts = [];
    let lastIndex = 0;

    matched.forEach(({ offset, length }) => {
        parts.push(text.text.slice(lastIndex, offset));
        parts.push(
            `<strong class="text-amber-700">${text.text.slice(offset, offset + length)}</strong>`
        );
        lastIndex = offset + length;
    });
    parts.push(text.text.slice(lastIndex));
    return { __html: parts.join('') };
};

const AutocompleteInput = ({ onPlaceSelect, initialValue = '' }) => {
    const { google } = useMap();
    const [placesApi, setPlacesApi] = useState(null);
    const [sessionToken, setSessionToken] = useState(null);
    const [inputValue, setInputValue] = useState(initialValue);
    const [suggestions, setSuggestions] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Load the new Places API (New) library and initialize session token
    useEffect(() => {
        if (!google) return;
        google.maps.importLibrary('places')
            .then((libs) => {
                setPlacesApi(libs);
                setSessionToken(new libs.AutocompleteSessionToken());
            })
            .catch((err) => console.error('Places library load failed', err));
    }, [google]);

    // Debounced autocomplete fetch
    const debouncedFetchSuggestions = useMemo(() =>
        debounce(async (input) => {
            if (!input || !placesApi || !sessionToken) {
                setSuggestions([]);
                return;
            }
            setLoading(true);
            try {
                const { suggestions: results } = await placesApi.AutocompleteSuggestion.fetchAutocompleteSuggestions({
                    input,
                    sessionToken
                });
                setSuggestions(results || []);
                setError(null);
            } catch (err) {
                console.error('Autocomplete error', err);
                setError('Could not find matching addresses');
            } finally {
                setLoading(false);
            }
        }, 300),
        [placesApi, sessionToken]
    );

    const fetchSuggestions = useCallback((input) => {
        debouncedFetchSuggestions(input);
    }, [debouncedFetchSuggestions]);

    // Handle input change
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        setActiveIndex(-1);
        fetchSuggestions(value);
    };

    // Select a suggestion and fetch full place details
    const handleSelect = async (suggestion) => {
        const place = suggestion.placePrediction.toPlace();

        // 1. Fetch the correct fields
        await place.fetchFields({
            fields: [
                'id',
                'displayName',
                'formattedAddress',
                'addressComponents',
                'location',
                'plusCode',
            ]
        });

        // 2. Extract structured address data
        const streetComponents = place.addressComponents.filter(c =>
            c.types.some(t => ['street_number', 'route'].includes(t))
        );

        // 3. auto‐fill AddressForm fields:
        const autoValues = {
            street: streetComponents
                .map(c => c.long_name?.trim() || '')
                .filter(Boolean)
                .join(' ') || '',
            city: place.addressComponents.find(c =>
                c.types.includes('locality') || c.types.includes('administrative_area_level_2')
            )?.long_name || '',
            postalCode: place.addressComponents.find(c =>
                c.types.includes('postal_code')
            )?.long_name || '',
            country: place.addressComponents.find(c =>
                c.types.includes('country')
            )?.short_name || ''
        };

        // 4. Push into your form via onChange
        onPlaceSelect({
            placeId: place.id,
            name: place.displayName,
            address: place.formattedAddress,
            location: {
                lat: place.location.lat(),
                lng: place.location.lng()
            },
            components: place.addressComponents,
            autoFormValues: autoValues
        });
    };


    // Keyboard navigation
    const handleKeyDown = (e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex((prev) => Math.max(prev - 1, -1));
                break;
            case 'Enter':
                if (activeIndex >= 0 && suggestions[activeIndex]) {
                    handleSelect(suggestions[activeIndex]);
                }
                break;
            case 'Escape':
                setSuggestions([]);
                break;
        }
    };

    // Click outside to close dropdown
    useEffect(() => {
        const onClickOutside = (e) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                inputRef.current && !inputRef.current.contains(e.target)
            ) {
                setSuggestions([]);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    return (
        <div className="relative w-full flex flex-row items-center text-sm gap-6">
            <div className="absolute left-2 flex items-center justify-center w-6 h-6">
                <Icon
                    name="near_me"
                    className="w-6 h-6 text-[var(--color-chocolate)]"
                    style={{ fontSize: '1.2rem' }}
                    variations={{ fill: 1, weight: 400, grade: 0, opsz: 24 }}
                />
            </div>
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                role="combobox"
                aria-expanded={suggestions.length > 0}
                aria-controls="predictions-list"
                aria-activedescendant={
                    activeIndex >= 0 ? `option-${activeIndex}` : undefined
                }
                className="w-full px-2 pl-10 h-8 border-b-2 border-[var(--color-chocolate)] focus:outline-none"
                placeholder="Here it is quicker..."
                style={{ fontSize: 15 }}
            />

            <AnimatePresence>
                {(suggestions.length > 0 || loading) && (
                    <motion.div
                        {...dropdownAnimations}
                        ref={dropdownRef}
                        id="predictions-list"
                        role="listbox"
                        className="absolute z-10 top-full w-full rounded-b-lg
                            shadow-xl overflow-hidden bg-[var(--color-caramel)]"
                    >
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-3 text-[var(--color-cream)] flex items-center gap-2"
                            >
                                <motion.span
                                    animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1, 0.9] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="text-lg w-6 h-6"
                                >
                                    <Icon
                                        name="search"
                                        className="w-6 h-6 fill-[var(--color-cream)]"
                                    />
                                </motion.span>
                                Finding fresh locations...
                            </motion.div>
                        ) : (
                            <AnimatePresence initial={false}>
                                {suggestions.map((suggestion, idx) => (
                                    <motion.button
                                        key={suggestion.placePrediction.placeId}
                                        {...suggestionItemAnimations}
                                        transition={{
                                            type: 'spring',
                                            delay: idx * 0.03,
                                            stiffness: 150
                                        }}
                                        role="option"
                                        aria-selected={idx === activeIndex}
                                        id={`option-${idx}`}
                                        className={`w-full px-4 py-3 text-left text-[var(--color-cream)]
                                            transition-all duration-200 group
                                            ${idx === activeIndex ? 'bg-[var(--color-caramel)]' : ''}
                                            hover:bg-[var(--color-chocolate)] focus:bg-[var(--color-chocolate)] 
                                            border-t-2 border-[var(--color-chocolate)] first:border-0`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelect(suggestion)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon
                                                name="location_on"
                                                className="w-6 h-6 fill-[var(--color-cream)]"
                                            />
                                            <span
                                                dangerouslySetInnerHTML={highlightPredictionText(suggestion)}
                                                className="leading-snug"
                                            />
                                        </div>
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        )}

                        {!loading && suggestions.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-3 text-[var(--color-cream)] flex items-center gap-2"
                            >
                                <span className="w-6 h-6 flex items-center justify-center text-[var(--color-cream)]">
                                    <Icon
                                        name="cookie"
                                        className="w-6 h-6 fill-[var(--color-cream)]"
                                    />
                                </span>
                                No fresh bakes found...
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div className="mt-2 text-red-600 text-sm">{error}</div>
            )}
        </div>
    );
};

export default AutocompleteInput;