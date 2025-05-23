import React, { useState, useMemo, useRef, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';

const DiscountCodeSelector = memo(({
    availableCodes, // Array of { id, codeName, description, type, value (general value) }
    appliedCodeIds, // Array of IDs of codes already applied to this product
    onSelectCode,   // (selectedCodeObject) => void
    onCreateNew,    // () => void (triggers modal)
    error,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const filteredAndAvailableCodes = useMemo(() => {
        const lowerSearchTerm = searchTerm?.toLowerCase();
        return availableCodes
            .filter(code => !appliedCodeIds.includes(code.id)) // Show only codes not yet applied
            .filter(code =>
                code.codeName?.toLowerCase().includes(lowerSearchTerm) ||
                (code.description && code?.description?.toLowerCase().includes(lowerSearchTerm))
            );
    }, [searchTerm, availableCodes, appliedCodeIds]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (code) => {
        onSelectCode(code);
        setSearchTerm('');
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label htmlFor="discount-search" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Add Discount Code to this Product
            </label>
            <div className="relative">
                <input
                    type="text"
                    id="discount-search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search existing codes or create new..."
                    className={`
                    dropdown-button group w-full h-9 py-2 pl-4 pr-3 rounded-full font-montserrat font-medium
                    flex items-center justify-between text-left
                    bg-neutral-100 dark:bg-neutral-200
                    focus:outline-none focus-visible:ring-2
                    focus-visible:ring-rose-400 dark:focus-visible:ring-rose-400
                    transition-all duration-200
                    text-neutral-900 dark:text-neutral-800 text-sm
                    ${error ? 'ring-2 ring-red-500 dark:ring-red-400' : ''}
                `}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <motion.span
                        className='flex-shrink-0 h-6'
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        aria-hidden="true"
                    >
                        <Icon name="expand_more" className={`w-6 h-6 ml-1 flex-shrink-0 text-neutral-600 transition-colors`} />
                    </motion.span>
                </div>
            </div>
            {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, maxHeight: 0 }}
                        animate={{ opacity: 1, y: 0, maxHeight: '240px' }} // Max height for scroll
                        exit={{ opacity: 0, y: -5, maxHeight: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-10 w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-lg overflow-y-auto"
                    >
                        {filteredAndAvailableCodes.length > 0 ? (
                            filteredAndAvailableCodes.map(code => (
                                <div
                                    key={code.id}
                                    onClick={() => handleSelect(code)}
                                    className="px-4 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-700/20 cursor-pointer text-sm"
                                >
                                    <p className="font-medium text-neutral-800 dark:text-neutral-100">{code.codeName}</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{code.description}</p>
                                </div>
                            ))
                        ) : searchTerm && (
                            <div className="px-4 py-2.5 text-sm text-neutral-500 dark:text-neutral-400">No matching codes found.</div>
                        )}
                        <div
                            onClick={() => { setIsOpen(false); onCreateNew(); }}
                            className="px-4 py-2.5 border-t border-neutral-200 dark:border-neutral-700 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-700/20 cursor-pointer flex items-center gap-2"
                        >
                            <Icon name="add_circle" className="w-6 h-6" /> Create New Discount Code
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

DiscountCodeSelector.propTypes = {
    availableCodes: PropTypes.array.isRequired,
    appliedCodeIds: PropTypes.array.isRequired,
    onSelectCode: PropTypes.func.isRequired,
    onCreateNew: PropTypes.func.isRequired,
    error: PropTypes.string,
};

export default DiscountCodeSelector;