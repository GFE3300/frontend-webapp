import React, { useState, useMemo, useRef, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import scriptLines from '../utils/script_lines';

const DiscountCodeSelector = memo(({
    availableCodes,
    appliedCodeIds,
    onSelectCode,
    onCreateNew,
    error,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const sl = scriptLines.discountCodeSelector_label ? scriptLines : scriptLines.discountCodeSelector; // Handle potential nesting differences

    const filteredAndAvailableCodes = useMemo(() => {
        const lowerSearchTerm = searchTerm?.toLowerCase() || ""; // Ensure searchTerm is defined
        return availableCodes
            .filter(code => !appliedCodeIds.includes(code.id))
            .filter(code =>
                code.codeName?.toLowerCase().includes(lowerSearchTerm) ||
                (code.description && code.description.toLowerCase().includes(lowerSearchTerm))
            );
    }, [searchTerm, availableCodes, appliedCodeIds]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) { // Only add listener if dropdown is open
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]); // Re-run effect when isOpen changes

    const handleSelect = (code) => {
        onSelectCode(code); // Passes the full master code object
        setSearchTerm('');
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label htmlFor="discount-search" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {sl.label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    id="discount-search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder={sl.placeholder}
                    className={`
                    dropdown-button group w-full h-9 py-2 pl-4 pr-10 rounded-full font-montserrat font-medium
                    flex items-center justify-between text-left
                    bg-neutral-100 dark:bg-neutral-700/50 
                    text-neutral-900 dark:text-neutral-100 
                    placeholder-neutral-500 dark:placeholder-neutral-400
                    focus:outline-none focus-visible:ring-2
                    focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400
                    transition-all duration-200 text-sm
                    ${error ? 'ring-2 ring-red-500 dark:ring-red-400' : 'border border-neutral-300 dark:border-neutral-600'}
                `}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"> {/* Added pointer-events-none to prevent icon from stealing focus */}
                    <motion.span
                        className='flex-shrink-0 h-5 w-5' // Adjusted size
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        aria-hidden="true"
                    >
                        <Icon name="expand_more" className={`w-5 h-5 text-neutral-500 dark:text-neutral-400 transition-colors`} />
                    </motion.span>
                </div>
            </div>
            {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1 px-1">{error}</p>}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, maxHeight: 0 }}
                        animate={{ opacity: 1, y: 0, maxHeight: '240px' }}
                        exit={{ opacity: 0, y: -5, maxHeight: 0 }}
                        transition={{ duration: 0.2, ease: "circOut" }}
                        className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-lg overflow-y-auto"
                        role="listbox" // Added role for accessibility
                    >
                        {filteredAndAvailableCodes.length > 0 ? (
                            filteredAndAvailableCodes.map(code => (
                                <div
                                    key={code.id}
                                    onClick={() => handleSelect(code)}
                                    className="px-4 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-600/20 cursor-pointer text-sm"
                                    role="option" // Added role for accessibility
                                    aria-selected={false} // This could be true if a selection is "active" in the list
                                >
                                    <p className="font-medium text-neutral-800 dark:text-neutral-100">{code.codeName}</p>
                                    {code.description && (
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                            {code.description}
                                        </p>
                                    )}
                                </div>
                            ))
                        ) : searchTerm && (
                            <div className="px-4 py-2.5 text-sm text-neutral-500 dark:text-neutral-400">{sl.noMatch}</div>
                        )}
                        <div
                            onClick={() => { setIsOpen(false); onCreateNew(); }}
                            className="px-4 py-2.5 border-t border-neutral-200 dark:border-neutral-700 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-600/20 cursor-pointer flex items-center gap-2 font-medium"
                            role="button" // Changed to button for better semantics
                        >
                            <Icon name="add_circle" className="w-5 h-5" /> {sl.createNew}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

DiscountCodeSelector.propTypes = {
    availableCodes: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        codeName: PropTypes.string.isRequired, // Maps to backend's code_name
        description: PropTypes.string,      // Maps to backend's internal_description or public_display_name
        type: PropTypes.string.isRequired,        // e.g., 'percentage', 'fixed_amount_product'
        default_value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })).isRequired,
    appliedCodeIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelectCode: PropTypes.func.isRequired,
    onCreateNew: PropTypes.func.isRequired,
    error: PropTypes.string,
};

DiscountCodeSelector.displayName = 'DiscountCodeSelector'; // Added displayName for better debugging

export default DiscountCodeSelector;