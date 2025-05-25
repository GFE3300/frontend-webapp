import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import { useProductSearchSuggestions } from '../../../contexts/ProductDataContext';
import { useDebounce } from '../../../hooks/useDebounce';

const AnimatedSearchBar = ({ initialSearchTerm = '', onSearchSubmit, placeholder = "Search...", isSortActiveTarget = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const inputRef = useRef(null);
    const barRef = useRef(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const { data: suggestions, isLoading: isLoadingSuggestions } = useProductSearchSuggestions(
        debouncedSearchTerm,
        {
            enabled: isExpanded && debouncedSearchTerm.length >= 2 && showSuggestions,
        }
    );

    useEffect(() => {
        setSearchTerm(initialSearchTerm);
    }, [initialSearchTerm]);

    useEffect(() => {
        if (isExpanded && inputRef.current && !showSuggestions) {
            inputRef.current.focus();
        }
    }, [isExpanded, showSuggestions]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (barRef.current && !barRef.current.contains(event.target)) {
                setShowSuggestions(false);
                if (isExpanded && !searchTerm) {
                    setIsExpanded(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded, searchTerm]);

    const handleIconClick = () => {
        if (isExpanded && searchTerm) {
            triggerSearch(searchTerm);
        } else {
            setIsExpanded(!isExpanded);
            if (!isExpanded) {
                setShowSuggestions(false);
            }
        }
    };

    const handleChange = (e) => {
        setSearchTerm(e.target.value);
        setActiveIndex(-1);
        if (e.target.value.length >= 2) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const triggerSearch = (term) => {
        onSearchSubmit(term);
        setShowSuggestions(false);
    };

    const handleSuggestionClick = (suggestion) => {
        const valueToUse = suggestion.is_general_search_suggestion ? suggestion.value : suggestion.value;
        setSearchTerm(valueToUse);
        triggerSearch(valueToUse);
        setIsExpanded(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex > -1 && suggestions && suggestions[activeIndex]) {
                handleSuggestionClick(suggestions[activeIndex]);
            } else {
                triggerSearch(searchTerm);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            if (!searchTerm) setIsExpanded(false);
        } else if (suggestions && suggestions.length > 0 && showSuggestions) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((prevIndex) => (prevIndex + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((prevIndex) => (prevIndex - 1 + suggestions.length) % suggestions.length);
            }
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        triggerSearch('');
        setShowSuggestions(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const baseClasses = `
        dropdown-button group w-full h-9 py-2 px-2 rounded-full font-montserrat font-medium
        flex items-center justify-between text-left
        focus:outline-none focus-visible:ring-2
        transition-all duration-200
        text-neutral-900 dark:text-neutral-800 text-sm
        cursor-pointer`;

    const normalStateClasses = 'bg-neutral-100 dark:bg-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-300/80';
    const activeSortTargetClasses = 'bg-sky-100 dark:bg-sky-200 ring-2 ring-sky-500 dark:ring-sky-500 shadow-md';
    const expandedStateClasses = isExpanded ? 'shadow-lg' : 'shadow-xs hover:shadow-md';

    return (
        <div ref={barRef} className="relative flex items-center">
            <motion.form
                onSubmit={(e) => { e.preventDefault(); triggerSearch(searchTerm); }}
                layout
                className={`${baseClasses} ${isSortActiveTarget ? activeSortTargetClasses : normalStateClasses} ${expandedStateClasses}`}
                transition={{ duration: 0.3, type: 'spring', stiffness: 150, damping: 20 }}
            >
                <AnimatePresence>
                    {isExpanded && (
                        <motion.input
                            ref={inputRef}
                            type="text"
                            placeholder={placeholder}
                            value={searchTerm}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => { if (searchTerm.length >= 2 && suggestions?.length) setShowSuggestions(true); }}
                            initial={{ opacity: 0, width: 0, paddingLeft: 0, paddingRight: 0 }}
                            animate={{ opacity: 1, width: 250, paddingLeft: '0.75rem', paddingRight: searchTerm ? '2.5rem' : '0.75rem' }}
                            exit={{ opacity: 0, width: 0, paddingLeft: 0, paddingRight: 0, transition: { duration: 0.2 } }}
                            className="h-10 text-sm text-neutral-800 placeholder:text-neutral-400 bg-transparent focus:outline-none"
                            autoComplete="off"
                        />
                    )}
                </AnimatePresence>

                {isExpanded && searchTerm && (
                    <motion.button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute p-1 w-6 h-6 right-10 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        title="Clear search"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                    >
                        <Icon name="close" className="w-4 h-4" style={{ fontSize: '1rem' }} variations={{ fill: 1, weight: 600, grade: 0, opsz: 48 }} />
                    </motion.button>
                )}

                <button
                    type={isExpanded && searchTerm ? "submit" : "button"}
                    onClick={handleIconClick}
                    className="p-1 h-6 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-600 focus:outline-none rounded-full transition-colors"
                    title={isExpanded ? "Search" : "Open search"}
                >
                    <Icon name="search" className="w-4 h-4" style={{ fontSize: '1rem' }} variations={{ fill: 1, weight: 600, grade: 0, opsz: 48 }} />
                </button>
            </motion.form>

            <AnimatePresence>
                {isExpanded && showSuggestions && debouncedSearchTerm.length >= 2 && (
                    <motion.ul
                        initial={{ opacity: 0, y: 5, maxHeight: 0 }}
                        animate={{ opacity: 1, y: 0, maxHeight: 240 }}
                        exit={{ opacity: 0, y: 5, maxHeight: 0, transition: { duration: 0.2 } }}
                        className="absolute font-montserrat top-full mt-1.5 w-full min-w-[280px] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-xl z-20 overflow-y-auto"
                    >
                        {isLoadingSuggestions && <li className="px-3 py-2.5 text-sm text-neutral-500 dark:text-neutral-400">Loading suggestions...</li>}
                        {!isLoadingSuggestions && suggestions && suggestions.length > 0 && suggestions.map((suggestion, index) => (
                            <li
                                key={suggestion.id || suggestion.value + index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={`px-3 py-2.5 text-sm cursor-pointer
                                            ${index === activeIndex ? 'bg-rose-50 dark:bg-rose-700/50' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/60'}
                                            text-neutral-700 dark:text-neutral-200`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{suggestion.value}</span>
                                    <span className="text-xs text-neutral-100 dark:text-neutral-800 bg-neutral-400 dark:bg-neutral-500 px-1.5 py-0.5 rounded-full">
                                        {suggestion.type}
                                    </span>
                                </div>
                                {(suggestion.category || suggestion.product_name) && (
                                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                        {suggestion.category || suggestion.product_name}
                                    </div>
                                )}
                            </li>
                        ))}
                        {!isLoadingSuggestions && (!suggestions || suggestions.length === 0) && debouncedSearchTerm.length >= 2 && (
                            <li className="px-3 py-2.5 text-sm text-neutral-500 dark:text-neutral-400">No suggestions found.</li>
                        )}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div >
    );
};

AnimatedSearchBar.propTypes = {
    initialSearchTerm: PropTypes.string,
    onSearchSubmit: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    isSortActiveTarget: PropTypes.bool, // New prop
};

export default AnimatedSearchBar;