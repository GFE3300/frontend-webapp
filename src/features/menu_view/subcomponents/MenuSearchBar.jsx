// src/features/menu_view/subcomponents/MenuSearchBar.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import Spinner from '../../../components/common/Spinner';
import { usePublicProductSuggestions } from '../../../contexts/ProductDataContext';
import { useDebounce } from '../../../hooks/useDebounce';

// Fallback image for product suggestions if image_url is missing
const FALLBACK_SUGGESTION_IMAGE = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=40&h=40&q=60';

const MenuSearchBar = ({
    onSearchSubmit,
    onSuggestionSelect,
    businessIdentifier, // Slug or UUID for API calls
    className = "",
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestionsList, setShowSuggestionsList] = useState(false); // Explicit state for list visibility
    const [activeIndex, setActiveIndex] = useState(-1); // For keyboard navigation

    const debouncedSearchTerm = useDebounce(inputValue, 300); // Debounce from guidelines (300-500ms)

    const {
        data: rawSuggestions = [], // Default to empty array
        isLoading: isLoadingSuggestions,
        isError: isSuggestionsError,
        error: suggestionsError,
        // isFetching, // Could be used for a subtle loading indicator within dropdown
    } = usePublicProductSuggestions(businessIdentifier, debouncedSearchTerm, {
        enabled: !!businessIdentifier && debouncedSearchTerm.trim().length >= 2 && isFocused,
        // staleTime: 1000 * 30, // Cache suggestions for 30s
        // refetchOnWindowFocus: false, // Usually not needed for search suggestions
    });

    // Add "General Search" option if input has value and API suggestions are loaded
    const suggestions = useMemo(() => {
        const baseSuggestions = Array.isArray(rawSuggestions) ? rawSuggestions : [];
        if (debouncedSearchTerm.trim().length > 0 && !isLoadingSuggestions && !isSuggestionsError) {
            // Check if a "General Search" type already exists from backend to avoid duplication
            const hasGeneralSearch = baseSuggestions.some(s => s.type === 'GeneralSearch');
            if (!hasGeneralSearch) {
                return [
                    ...baseSuggestions,
                    {
                        id: `general-search-${debouncedSearchTerm}`, // Unique ID for the general search option
                        name: `Search all items for "${debouncedSearchTerm}"`,
                        type: 'GeneralSearch', // Custom type
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

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestionsList(false);
                // setIsFocused(false); // Don't blur input if user clicks on page body, only if clicking away from search
                setActiveIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Control suggestion list visibility
    useEffect(() => {
        if (isFocused && inputValue.trim().length >= 2 && suggestions.length > 0) {
            setShowSuggestionsList(true);
        } else {
            setShowSuggestionsList(false); // Hide if not focused, query too short, or no suggestions
        }
        // Reset active index when suggestions change or list visibility changes
        if (!showSuggestionsList) setActiveIndex(-1);

    }, [isFocused, inputValue, suggestions, showSuggestionsList]);


    const handleInputChange = (event) => {
        setInputValue(event.target.value);
        // Suggestions visibility will be handled by the useEffect above
    };

    const handleFocus = () => {
        setIsFocused(true);
        // Suggestions visibility will be handled by the useEffect above
    };
    
    const handleBlur = (event) => {
        // Delay blur to allow click on suggestion item
        setTimeout(() => {
            if (suggestionsListRef.current && suggestionsListRef.current.contains(document.activeElement)) {
                // If focus moved to a suggestion item, don't hide
                return;
            }
            setIsFocused(false);
            // setShowSuggestionsList(false); // This will be handled by useEffect or clickOutside
        }, 100);
    };


    const handleSuggestionClick = (suggestion) => {
        if (suggestion.type === 'GeneralSearch') {
            onSearchSubmit(suggestion.query);
            setInputValue(suggestion.query); // Keep the query in the input for general search
        } else {
            onSuggestionSelect(suggestion);
            setInputValue(''); // Clear input for specific item/category/tag selection
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
            // setInputValue(''); // Optional: clear input on general search submit
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
                } else if (inputValue.trim()) { // Fallback to submit current input value
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
    
    useEffect(() => { // Scroll active suggestion into view
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
            default: return 'help_outline'; // Fallback icon
        }
    };
    
    // Input styling from Guidelines 6.2
    const inputBgClass = isFocused ? 'bg-white dark:bg-neutral-700' : 'bg-neutral-100 dark:bg-neutral-700/50';
    const inputRingClass = isFocused ? 'ring-2 ring-rose-400 dark:ring-rose-500 border-transparent' : 'border border-transparent';

    return (
        <div ref={searchContainerRef} className={`relative w-full ${className}`}>
            <form onSubmit={handleSubmit} role="search" aria-label="Menu search">
                <div className="relative">
                    {/* Search Icon (Guidelines 6.7 - Small) */}
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Icon name="search" className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                    </div>
                    <input
                        ref={inputRef}
                        type="search" // Using type="search" enables native clear button in some browsers
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        placeholder="Search menu..."
                        className={`w-full h-10 pl-10 pr-10 py-2 text-sm font-inter text-neutral-800 dark:text-neutral-200 ${inputBgClass} placeholder-neutral-500 dark:placeholder-neutral-400 rounded-full focus:outline-none transition-all duration-150 ${inputRingClass}`}
                        aria-label="Search menu items, categories, or tags"
                        aria-autocomplete="list"
                        aria-expanded={showSuggestionsList && suggestions.length > 0}
                        aria-controls="search-suggestions-listbox"
                        aria-activedescendant={activeIndex >= 0 ? `suggestion-item-${activeIndex}` : undefined}
                    />
                    {/* Clear Button (Guidelines 6.7 - X-Small icon if possible, or Small) */}
                    {inputValue && (
                         <button
                            type="button"
                            onClick={() => {
                                setInputValue('');
                                // onSearchSubmit(''); // Optionally trigger search with empty query to reset
                                inputRef.current?.focus();
                            }}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
                            aria-label="Clear search input"
                        >
                            <Icon name="close" className="w-4 h-4"/> {/* X-Small icon */}
                        </button>
                    )}
                </div>
            </form>

            {/* Suggestions Dropdown (Guidelines 6.3) */}
            <AnimatePresence>
                {showSuggestionsList && (
                    <motion.ul
                        id="search-suggestions-listbox"
                        ref={suggestionsListRef}
                        className="absolute top-full left-0 right-0 mt-1.5 w-full bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-y-auto z-20 border border-neutral-200 dark:border-neutral-700"
                        style={{ maxHeight: '300px' }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.2 }}
                        role="listbox"
                        aria-label="Search results"
                    >
                        {isLoadingSuggestions && (
                            <li className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 flex items-center justify-center">
                                <Spinner size="sm" className="mr-2" /> Searching...
                            </li>
                        )}
                        {!isLoadingSuggestions && isSuggestionsError && (
                             <li className="px-4 py-3 text-sm text-red-600 dark:text-red-400 text-center">
                                <Icon name="error_outline" className="inline w-4 h-4 mr-1 align-text-bottom" /> 
                                {suggestionsError?.message || "Error loading suggestions."}
                            </li>
                        )}
                        {!isLoadingSuggestions && !isSuggestionsError && suggestions.length === 0 && debouncedSearchTerm.trim().length >=2 && (
                            <li className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 text-center">
                                No suggestions for "{debouncedSearchTerm}".
                            </li>
                        )}

                        {!isLoadingSuggestions && !isSuggestionsError && suggestions.map((suggestion, index) => (
                            <li
                                key={suggestion.id || `${suggestion.type}-${index}-${suggestion.name}`} // More robust key
                                id={`suggestion-item-${activeIndex === index ? 'active-suggestion' : `suggestion-item-${index}`}`} // Ensure unique ID for active descendant
                                role="option"
                                aria-selected={activeIndex === index}
                                className={`px-3 py-2.5 flex items-center cursor-pointer transition-colors duration-100
                                    ${activeIndex === index
                                        ? 'bg-rose-50 dark:bg-rose-700/30 text-rose-700 dark:text-rose-300' // Active state from Guidelines 6.3
                                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/60 text-neutral-700 dark:text-neutral-200'
                                    }`}
                                onClick={() => handleSuggestionClick(suggestion)}
                                onMouseEnter={() => setActiveIndex(index)}
                            >
                                {/* Suggestion Icon/Image */}
                                <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mr-2.5 flex-shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-600">
                                    {suggestion.type === 'product' && suggestion.details?.image_url ? (
                                        <img
                                            src={suggestion.details.image_url}
                                            alt="" // Alt text ideally should be suggestion.name but can be decorative
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_SUGGESTION_IMAGE; }}
                                        />
                                    ) : (
                                        <Icon name={getIconForSuggestionType(suggestion.type)} className={`w-4 h-4 ${suggestion.details?.color_class ? '' : 'text-neutral-500 dark:text-neutral-400'}`} 
                                              style={suggestion.details?.color_class ? { color: suggestion.details.color_class.startsWith('#') ? suggestion.details.color_class : `var(--color-${suggestion.details.color_class})` } : {}} // Example if color_class is direct hex or CSS var
                                        />
                                    )}
                                </div>
                                
                                {/* Suggestion Text */}
                                <div className="flex-grow min-w-0">
                                    <span className="text-sm font-medium block truncate" title={suggestion.name}>{suggestion.name}</span>
                                    {suggestion.type !== 'GeneralSearch' && suggestion.details?.category_name && suggestion.type === 'product' && (
                                        <span className="text-xs text-neutral-500 dark:text-neutral-400 block truncate" title={suggestion.details.category_name}>
                                            In: {suggestion.details.category_name}
                                        </span>
                                    )}
                                    {suggestion.type !== 'GeneralSearch' && suggestion.type !== 'product' && (
                                         <span className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
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