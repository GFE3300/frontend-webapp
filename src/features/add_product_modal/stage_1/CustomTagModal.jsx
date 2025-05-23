import React, { useState, useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon'; // Adjust path as needed
import IconPicker from './IconPicker'; // Adjust path as needed
import scriptLines from '../utils/script_lines'; // IMPORTED scriptLines

export const defaultCustomTagIcons = [
    { name: 'label', label: 'Generic Tag' }, { name: 'sell', label: 'Price Tag' },
    { name: 'local_pizza', label: 'Pizza' }, { name: 'eco', label: 'Eco-friendly' },
    { name: 'bolt', label: 'New' }, { name: 'verified', label: 'Verified' },
    { name: 'science', label: 'Lab Tested' }, { name: 'spa', label: 'Organic/Spa' },
    { name: 'pets', label: 'Pet Friendly' }, { name: 'grass', label: 'Vegan/Plant-based' },
    { name: 'local_fire_department', label: 'Spicy/Hot' }, { name: 'ac_unit', label: 'Cool/Frozen' },
    { name: 'emoji_food_beverage', label: 'Beverage' }, { name: 'bakery_dining', label: 'Bakery' },
    { name: 'kitchen', label: 'Homemade' }, { name: 'star', label: 'Featured' }
];

const INPUT_MAX_LENGTH = 30; // Maximum length for the tag name input

/**
 * @component CustomTagModal
 * @description A modal dialog for creating new custom tags. It allows users to input a tag name
 * and optionally select an icon for the tag. Includes validation for empty or duplicate tag names.
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {Function} props.onClose - Callback function invoked when the modal requests to be closed
 *   (e.g., by clicking the backdrop, cancel button, or close icon).
 * @param {Function} props.onSubmit - Callback function invoked when the tag creation is requested.
 *   Receives an object `{ label: string, iconName?: string }` representing the new tag.
 *   This function is expected to handle the actual creation logic (e.g., API call).
 * @param {Array<string>} [props.existingLabels=[]] - An array of existing tag labels (strings).
 *   Used to prevent creation of duplicate tag names (case-insensitive).
 * @param {Array<Object>} [props.availableIcons=defaultCustomTagIcons] - An array of icon objects available for selection in the IconPicker.
 *   Each object should have at least a `name` (string, for the icon) and `label` (string, for display/title).
 * @param {string} [props.submissionError] - An error message from a previous submission attempt to display.
 */
const CustomTagModal = ({
    isOpen,
    onClose,
    onSubmit,
    existingLabels,
    availableIcons = defaultCustomTagIcons,
    submissionError
}) => {
    // ===========================================================================
    // State & Refs
    // ===========================================================================
    const [tagName, setTagName] = useState('');
    const [selectedIconName, setSelectedIconName] = useState(availableIcons[0]?.name || '');
    const [internalError, setInternalError] = useState('');
    const inputRef = useRef(null);

    // ===========================================================================
    // Configuration
    // ===========================================================================
    const motionModalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: "circOut" } },
        exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.15, ease: "circIn" } }
    };

    const motionBackdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.15 } }
    };

    // ===========================================================================
    // Effects
    // ===========================================================================
    useEffect(() => {
        if (isOpen) {
            setTagName('');
            setSelectedIconName(availableIcons[0]?.name || '');
            setInternalError('');
            const timer = setTimeout(() => inputRef.current?.focus(), 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen, availableIcons]);

    // ===========================================================================
    // Event Handlers
    // ===========================================================================
    const handleTagNameChange = (e) => {
        setTagName(e.target.value);
        if (internalError) setInternalError('');
    };

    const handleIconSelect = (iconName) => {
        setSelectedIconName(iconName);
    };

    const handleCreateTagClick = () => {
        const trimmedName = tagName.trim();

        if (!trimmedName) {
            setInternalError(scriptLines.customTagModal_error_nameEmpty);
            inputRef.current?.focus();
            return;
        }
        if (existingLabels.map(label => label.toLowerCase()).includes(trimmedName.toLowerCase())) {
            setInternalError(scriptLines.customTagModal_error_nameExists.replace('{tagName}', trimmedName));
            inputRef.current?.focus();
            return;
        }

        setInternalError('');
        onSubmit({ label: trimmedName, iconName: selectedIconName });
    };

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="custom-tag-modal-backdrop"
                    variants={motionBackdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 font-montserrat"
                    onClick={onClose}
                    data-testid="custom-tag-modal-backdrop"
                >
                    <motion.div
                        key="custom-tag-modal-content"
                        variants={motionModalVariants}
                        className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-md p-6 sm:p-8"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="custom-tag-modal-title"
                        data-testid="custom-tag-modal-content"
                    >
                        <h2 id="custom-tag-modal-title" className="text-xl sm:text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">
                            {scriptLines.customTagModal_title}
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="customTagName" className="block ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                    {scriptLines.customTagModal_tagNameLabel}
                                </label>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    id="customTagName"
                                    value={tagName}
                                    onChange={handleTagNameChange}
                                    placeholder={scriptLines.customTagModal_tagNamePlaceholder}
                                    className={`w-full px-3.5 py-2.5 border rounded-full text-sm
                                                bg-white dark:bg-neutral-700
                                                text-neutral-900 dark:text-neutral-100
                                                placeholder-neutral-400 dark:placeholder-neutral-500
                                                focus:outline-none focus:ring-2 focus:border-transparent
                                                transition-colors duration-150
                                                ${internalError ? 'border-red-500 dark:border-red-400 focus:ring-red-500/50' : 'border-neutral-300 dark:border-neutral-600 focus:ring-rose-500/50 dark:focus:ring-rose-400/50'}`}
                                    maxLength={INPUT_MAX_LENGTH}
                                    aria-describedby={internalError ? "tag-name-error" : undefined}
                                    aria-invalid={!!internalError}
                                />
                                {internalError && <p id="tag-name-error" className="mt-1.5 ml-3 text-xs text-red-600 dark:text-red-400" role="alert">{internalError}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                    {scriptLines.customTagModal_chooseIconLabel}
                                </label>
                                <IconPicker
                                    availableIcons={availableIcons}
                                    selectedIconName={selectedIconName}
                                    onIconSelect={handleIconSelect}
                                    className="p-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg"
                                />
                            </div>

                            {submissionError && !internalError && (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-md" role="alert">
                                    {submissionError}
                                </p>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                                >
                                    {scriptLines.common_cancel}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreateTagClick}
                                    className="px-5 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800"
                                >
                                    {scriptLines.customTagModal_createTagButton}
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-4 right-4 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                            aria-label={scriptLines.common_closeModal_ariaLabel}
                        >
                            <Icon name="close" className="w-6 h-6" />
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

CustomTagModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    existingLabels: PropTypes.arrayOf(PropTypes.string),
    availableIcons: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired, // Label is now sourced from scriptLines at definition
        })
    ),
    submissionError: PropTypes.string,
};

CustomTagModal.defaultProps = {
    existingLabels: [],
    availableIcons: defaultCustomTagIcons,
    submissionError: null,
};

export default memo(CustomTagModal);