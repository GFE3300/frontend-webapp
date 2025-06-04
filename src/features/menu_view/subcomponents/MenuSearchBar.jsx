import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import Spinner from '../../../components/common/Spinner';
import { usePublicProductSuggestions } from '../../../contexts/ProductDataContext';
import { useDebounce } from '../../../hooks/useDebounce';
import { Weight } from 'lucide-react';

const INPUT_BG = "bg-neutral-100 dark:bg-neutral-200"; 
const INPUT_BG_FOCUSED = "bg-white dark:bg-neutral-700"; 
const INPUT_TEXT_COLOR = "text-neutral-900 dark:text-neutral-800";
const INPUT_PLACEHOLDER_COLOR = "placeholder-neutral-400 dark:placeholder-neutral-500";
const INPUT_RING_FOCUSED = "ring-2 ring-rose-400 dark:ring-rose-500";
const INPUT_ICON_COLOR = "text-neutral-400 dark:text-neutral-500";

const DROPDOWN_PANEL_BG = "bg-white dark:bg-neutral-800";
const DROPDOWN_PANEL_BORDER = "border border-neutral-200 dark:border-neutral-700";
const DROPDOWN_ITEM_HOVER_BG = "hover:bg-rose-50 dark:hover:bg-rose-700/20";
const DROPDOWN_ITEM_ACTIVE_BG = "bg-rose-50 dark:bg-rose-700/30";
const DROPDOWN_ITEM_ACTIVE_TEXT = "text-rose-700 dark:text-rose-300";
const DROPDOWN_ITEM_TEXT_PRIMARY = "text-neutral-700 dark:text-neutral-200";
const DROPDOWN_ITEM_TEXT_SECONDARY = "text-neutral-500 dark:text-neutral-400";

// Typography 
const FONT_INTER = "font-inter";
const INPUT_TEXT_SIZE = "text-sm";
const SUGGESTION_NAME_TEXT_SIZE = "text-sm"; 
const SUGGESTION_DETAIL_TEXT_SIZE = "text-xs"; 

// Shadows & Elevation
const DROPDOWN_SHADOW = "shadow-lg";

// Borders & Corner Radii
const INPUT_RADIUS = "rounded-full";
const DROPDOWN_RADIUS = "rounded-2xl";
const SUGGESTION_IMAGE_RADIUS = "rounded-full";

const ERROR_TEXT = "text-red-600 dark:text-red-400";

const MenuSearchBar = ({
    onSearchSubmit,
    onSuggestionSelect,
    businessIdentifier,
    className = "",
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestionsList, setShowSuggestionsList] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const debouncedSearchTerm = useDebounce(inputValue, 300);

    const {
        data: rawSuggestions = [],
        isLoading: isLoadingSuggestions,
        isError: isSuggestionsError,
        error: suggestionsError,
    } = usePublicProductSuggestions(businessIdentifier, debouncedSearchTerm, {
        enabled: !!businessIdentifier && debouncedSearchTerm.trim().length >= 2 && isFocused,
    });

    const suggestions = useMemo(() => {
        const baseSuggestions = Array.isArray(rawSuggestions) ? rawSuggestions : [];
        if (debouncedSearchTerm.trim().length > 0 && !isLoadingSuggestions && !isSuggestionsError) {
            const hasGeneralSearch = baseSuggestions.some(s => s.type === 'GeneralSearch');
            if (!hasGeneralSearch) {
                return [
                    ...baseSuggestions,
                    {
                        id: `general-search-${debouncedSearchTerm.replace(/\s+/g, '_').toLowerCase()}`,
                        name: `Search all items for "${debouncedSearchTerm}"`,
                        type: 'GeneralSearch',
                        query: debouncedSearchTerm.trim(),
                    },
                ];
            }
        }
        return baseSuggestions;
    }, [rawSuggestions, debouncedSearchTerm, isLoadingSuggestions, isSuggestionsError]);

    const searchContainerRef = useRef(null);
    const inputRef = useRef(null);
    const suggestionsListRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestionsList(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isFocused && inputValue.trim().length >= 2 && (suggestions.length > 0 || isLoadingSuggestions || isSuggestionsError)) {
            setShowSuggestionsList(true);
        } else {
            setShowSuggestionsList(false);
        }
        if (!showSuggestionsList) setActiveIndex(-1);
    }, [isFocused, inputValue, suggestions, isLoadingSuggestions, isSuggestionsError, showSuggestionsList]);


    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };
    
    const handleBlur = () => {
        setTimeout(() => {
            if (suggestionsListRef.current && suggestionsListRef.current.contains(document.activeElement)) {
                return;
            }
            setIsFocused(false);
        }, 150);
    };

    const handleSuggestionClick = (suggestion) => {
        if (suggestion.type === 'GeneralSearch') {
            onSearchSubmit(suggestion.query);
            setInputValue(suggestion.query); 
        } else {
            onSuggestionSelect(suggestion);
            setInputValue(''); 
        }
        setShowSuggestionsList(false);
        setIsFocused(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
            handleSuggestionClick(suggestions[activeIndex]);
        } else if (inputValue.trim()) {
            onSearchSubmit(inputValue.trim());
            setShowSuggestionsList(false);
        }
        setIsFocused(false);
        inputRef.current?.blur();
    };

    const handleKeyDown = (event) => {
        if (!showSuggestionsList || suggestions.length === 0) {
            if (event.key === 'Enter' && inputValue.trim()) handleSubmit(event);
            return;
        }
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setActiveIndex((prevIndex) => (prevIndex + 1) % suggestions.length);
                break;
            case 'ArrowUp':
                event.preventDefault();
                setActiveIndex((prevIndex) => (prevIndex - 1 + suggestions.length) % suggestions.length);
                break;
            case 'Enter':
                event.preventDefault();
                if (activeIndex >= 0 && suggestions[activeIndex]) {
                    handleSuggestionClick(suggestions[activeIndex]);
                } else if (inputValue.trim()) {
                    handleSubmit(event);
                }
                break;
            case 'Escape':
                event.preventDefault();
                setShowSuggestionsList(false);
                setIsFocused(false);
                setActiveIndex(-1);
                inputRef.current?.blur();
                break;
            default:
                break;
        }
    };
    
    useEffect(() => {
        if (activeIndex >= 0 && suggestionsListRef.current) {
            const activeElement = suggestionsListRef.current.children[activeIndex];
            activeElement?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [activeIndex]);

    const getIconForSuggestionType = (type) => {
        switch (type) {
            case 'product': return 'fastfood';
            case 'category': return 'category';
            case 'tag': return 'label';
            case 'GeneralSearch': return 'search';
            default: return 'help_outline';
        }
    };
    
    const currentInputBgClass = isFocused ? INPUT_BG_FOCUSED : INPUT_BG;
    const currentInputRingClass = isFocused ? INPUT_RING_FOCUSED : 'border border-transparent';

    return (
        <div ref={searchContainerRef} className={`relative w-full ${className} ${FONT_INTER}`}>
            <form onSubmit={handleSubmit} role="search" aria-label="Menu search">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Icon name="search" className={`w-5 h-5 ${INPUT_ICON_COLOR}`} style={{ fontSize: "1.25rem" }} variations={{ fill: 0, weight: 600, grade: 0, opsz: 48 }} />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        placeholder="Search menu..."
                        className={`w-full h-10 pl-10 pr-10 py-2 ${INPUT_TEXT_SIZE} ${FONT_INTER} ${INPUT_TEXT_COLOR} ${currentInputBgClass} ${INPUT_PLACEHOLDER_COLOR} ${INPUT_RADIUS} focus:outline-none transition-all duration-150 ${currentInputRingClass}`}
                        aria-label="Search menu items, categories, or tags" 
                        aria-autocomplete="list"
                        aria-expanded={showSuggestionsList && suggestions.length > 0}
                        aria-controls="search-suggestions-listbox"
                    />
                    {inputValue && (
                         <button
                            type="button"
                            onClick={() => {
                                setInputValue('');
                                inputRef.current?.focus();
                            }}
                            className={`absolute inset-y-0 right-0 pr-3.5 flex items-center ${INPUT_ICON_COLOR} hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors`}
                            aria-label="Clear search input"
                        >
                            <Icon name="close" className="w-4 h-4" style={{ fontSize: "1rem" }} variations={{ fill: 1, weight: 600, grade: 0, opsz: 24 }}/>
                        </button>
                    )}
                </div>
            </form>

            <AnimatePresence>
                {showSuggestionsList && (
                    <motion.ul
                        id="search-suggestions-listbox"
                        ref={suggestionsListRef}
                        className={`absolute font-montserrat top-full left-0 right-0 mt-1.5 w-full ${DROPDOWN_PANEL_BG} ${DROPDOWN_RADIUS} ${DROPDOWN_SHADOW} overflow-y-auto z-20 ${DROPDOWN_PANEL_BORDER}`}
                        style={{ maxHeight: '300px' }} 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.2 }}
                        role="listbox" // Guideline 7: ARIA
                        aria-label="Search results"
                    >
                        {isLoadingSuggestions && (
                            // Loader Feedback (Guideline 4.5)
                            <li className={`px-4 py-3 ${SUGGESTION_NAME_TEXT_SIZE} ${DROPDOWN_ITEM_TEXT_SECONDARY} flex items-center justify-center`}>
                                <Spinner size="sm" className="mr-2" /> Searching...
                            </li>
                        )}
                        {!isLoadingSuggestions && isSuggestionsError && (
                             <li className={`px-4 py-3 ${SUGGESTION_NAME_TEXT_SIZE} ${ERROR_TEXT} text-center`}>
                                <Icon name="error_outline" className="inline w-4 h-4 mr-1 align-text-bottom" style={{ fontSize: "1rem" }} /> 
                                {suggestionsError?.message || "Error loading suggestions."}
                            </li>
                        )}
                        {!isLoadingSuggestions && !isSuggestionsError && suggestions.length === 0 && debouncedSearchTerm.trim().length >=2 && (
                            <li className={`px-4 py-3 ${SUGGESTION_NAME_TEXT_SIZE} ${DROPDOWN_ITEM_TEXT_SECONDARY} text-center`}>
                                No suggestions for "{debouncedSearchTerm}".
                            </li>
                        )}

                        {!isLoadingSuggestions && !isSuggestionsError && suggestions.map((suggestion, index) => (
                            <li
                                key={suggestion.id || `${suggestion.type}-${index}-${suggestion.name}`}
                                id={`suggestion-item-${index}`} // Unique ID for aria-activedescendant
                                role="option"
                                aria-selected={activeIndex === index}
                                // Styling: Item padding, hover/active states (Guideline 6.3)
                                className={`px-3 py-2.5 flex items-center cursor-pointer transition-colors duration-100
                                    ${activeIndex === index
                                        ? `${DROPDOWN_ITEM_ACTIVE_BG} ${DROPDOWN_ITEM_ACTIVE_TEXT}`
                                        : `${DROPDOWN_ITEM_HOVER_BG} ${DROPDOWN_ITEM_TEXT_PRIMARY}`
                                    }`}
                                onClick={() => handleSuggestionClick(suggestion)}
                                onMouseEnter={() => setActiveIndex(index)} // Update active index on mouse enter for visual cue
                            >
                                {/* Suggestion Icon/Image (Guideline 2.3 Iconography, 2.4 Imagery, 2.6 Corner Radii) */}
                                <div className={`w-8 h-8 ${SUGGESTION_IMAGE_RADIUS} bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mr-2.5 flex-shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-600`}>
                                    {suggestion.type === 'product' && suggestion.details?.image_url ? (
                                        <img
                                            src={suggestion.details.image_url}
                                            alt="" // Decorative, main info is in text
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.onerror = null; }}
                                        />
                                    ) : (
                                        // Icon (Guideline 2.3 Small size for inline with text)
                                        <Icon name={getIconForSuggestionType(suggestion.type)} className={`w-4 h-4 ${activeIndex === index ? 'opacity-90' : DROPDOWN_ITEM_TEXT_SECONDARY }`} style={{ fontSize: "1rem" }} variations={{ fill: 1, weight: 600, grade: 0, opsz: 24 }} />
                                    )}
                                </div>
                                
                                {/* Suggestion Text (Guideline 2.2 Typography) */}
                                <div className="flex-grow min-w-0">
                                    {/* Name: Body Medium */}
                                    <span className={`${SUGGESTION_NAME_TEXT_SIZE} font-medium block truncate`} title={suggestion.name}>{suggestion.name}</span>
                                    {/* Detail: Body Small/Extra Small */}
                                    {suggestion.type !== 'GeneralSearch' && suggestion.details?.category_name && suggestion.type === 'product' && (
                                        <span className={`${SUGGESTION_DETAIL_TEXT_SIZE} ${activeIndex === index ? 'opacity-80' : DROPDOWN_ITEM_TEXT_SECONDARY} block truncate`} title={suggestion.details.category_name}>
                                            In: {suggestion.details.category_name}
                                        </span>
                                    )}
                                    {suggestion.type !== 'GeneralSearch' && suggestion.type !== 'product' && (
                                         <span className={`${SUGGESTION_DETAIL_TEXT_SIZE} ${activeIndex === index ? 'opacity-80' : DROPDOWN_ITEM_TEXT_SECONDARY} capitalize`}>
                                            {suggestion.type.replace('_', ' ')}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MenuSearchBar;