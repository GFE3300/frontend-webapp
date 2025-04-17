import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../common/Icon';

const SearchBar = ({ placeholder = 'Search...', fetchSuggestions }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const debounceTimeout = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => () => clearTimeout(debounceTimeout.current), []);

    const handleChange = (e) => {
        const q = e.target.value;
        setQuery(q);
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(async () => {
            if (q.trim()) {
                const results = await fetchSuggestions(q);
                setSuggestions(results);
                setIsOpen(true);
                setHighlightedIndex(-1);
            } else {
                setSuggestions([]);
                setIsOpen(false);
            }
        }, 300);
    };

    const handleSelect = (item) => {
        setQuery(item);
        setIsOpen(false);
        // TODO: trigger search/navigation
    };

    const handleKeyDown = (e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((i) => Math.max(i - 1, 0));
                break;
            case 'Enter':
                if (highlightedIndex >= 0) {
                    e.preventDefault();
                    handleSelect(suggestions[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setIsActive(false);
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        if (isOpen && highlightedIndex >= 0 && listRef.current) {
            const el = listRef.current.children[highlightedIndex];
            el?.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightedIndex, isOpen]);

    return (
        <div className="relative flex items-center" role="search" aria-label="Site search">
            <motion.button
                onClick={() => setIsActive((prev) => !prev)}
                aria-label="Toggle search bar"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center justify-center w-10 h-10 rounded-full shadow bg-[var(--color-cream)] text-[var(--color-chocolate)] hover:bg-[var(--color-caramel)/20] transition focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]`}
            >
                <Icon name="search" className="w-6 h-6 flex items-center justify-center" />
            </motion.button>

            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: '16rem', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-3"
                    >
                        <div
                            className={`
                                flex items-center h-10
                                bg-[var(--color-cream)] border border-[var(--color-caramel)] 
                                rounded-full px-4 py-1 shadow 
                                focus-within:ring-1 focus-within:ring-[var(--color-caramel)] 
                                transition duration-200
                            `}
                            role="combobox"
                            aria-haspopup="listbox"
                            aria-expanded={isOpen}
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={handleChange}
                                onFocus={() => suggestions.length && setIsOpen(true)}
                                onKeyDown={handleKeyDown}
                                placeholder={placeholder}
                                className="flex-grow bg-transparent outline-none text-sm text-[var(--color-caramel)] placeholder:text-[var(--color-caramel)] overflow-hidden whitespace-nowrap overflow-ellipsis"
                                aria-controls="search-suggestion-list"
                                aria-autocomplete="list"
                            />
                            {query && (
                                <button
                                    onClick={() => { setQuery(''); setSuggestions([]); setIsOpen(false); }}
                                    aria-label="Clear search"
                                    className="
                                        flex items-center justify-center w-8 h-8 rounded-full
                                        text-[var(--color-charcoal)] hover:text-[var(--color-caramel)]
                                    "
                                >
                                    <Icon name="close" className="" />
                                </button>
                            )}
                        </div>

                        <AnimatePresence>
                            {isOpen && suggestions.length > 0 && (
                                <motion.ul
                                    id="search-suggestion-list"
                                    ref={listRef}
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto z-50"
                                    role="listbox"
                                >
                                    {suggestions.map((item, idx) => (
                                        <li
                                            key={`${item}-${idx}`}
                                            role="option"
                                            aria-selected={highlightedIndex === idx}
                                            className={`px-4 py-2 cursor-pointer text-[var(--color-charcoal)] ${highlightedIndex === idx ? 'bg-[var(--color-blush)] font-medium' : 'hover:bg-[var(--color-rose)]'}`}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => handleSelect(item)}
                                            onMouseEnter={() => setHighlightedIndex(idx)}
                                        >
                                            {item}
                                        </li>
                                    ))}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

SearchBar.propTypes = {
    placeholder: PropTypes.string,
    fetchSuggestions: PropTypes.func.isRequired,
};

export default SearchBar;