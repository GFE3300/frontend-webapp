import React, { memo, useState, useCallback, useMemo, useId } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import Icon from '../../../components/common/Icon'; // Adjust path if necessary
import CustomTagModal from './CustomTagModal'; // Adjust path if necessary

/**
 * A component for managing a set of selectable product identifiers (tags/attributes).
 * It displays available identifiers as toggle buttons and allows users to create new custom tags
 * via a modal. Selected identifiers are visually distinct.
 *
 * @component ProductIdentifiers
 * @param {Object} props - Component properties.
 * @param {string} [props.label="Product Attributes"] - A descriptive label for the entire section.
 * @param {Array<Object>} props.allAvailableIdentifiers - An array of all available identifier objects. Each object should have `id` (string, unique), `label` (string, display name), `iconName` (string, optional, for Icon component), and `isCustom` (boolean, optional). (Required)
 * @param {Array<string>} props.selectedIdentifiers - An array of `id` strings representing the currently selected identifiers. (Required)
 * @param {function} props.onToggleIdentifier - Callback function invoked when an identifier button is clicked. Receives the `id` of the toggled identifier. (Required)
 * @param {function} props.onCustomTagCreate - Callback function invoked when a new custom tag is submitted from the modal. Receives an object `{ label: string, iconName?: string }`. The parent component is responsible for creating the new identifier (including generating an ID) and updating `allAvailableIdentifiers`. (Required)
 * @param {string} [props.className=""] - Additional CSS classes for the root container.
 * @param {string} [props.themeColor="rose"] - Theme color for accents (e.g., "Add Tag" button, selected tags).
 * @param {Object} [props.error] - An error object or string. If an object, can target specific parts like `error.list` for an array-level error, or `error.modal` for modal-related issues. If a string, treated as a general error for the component.
 */
const ProductIdentifiers = ({
    label = "Product Attributes",
    allAvailableIdentifiers = [],
    selectedIdentifiers = [],
    onToggleIdentifier,
    onCustomTagCreate,
    className = "",
    themeColor = "rose",
    error, // General error for the component or specific error for the list
    customTagCreationError,
}) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const generatedId = useId();
    const labelId = `${generatedId}-product-identifiers-label`;
    const listErrorId = error && typeof error === 'string' ? `${generatedId}-list-error` : undefined;

    const THEME_CLASSES = {
        rose: {
            addTagButtonText: 'text-rose-600 dark:text-rose-400',
            addTagButtonHoverBg: 'hover:bg-rose-50 dark:hover:bg-rose-500/10',
            addTagButtonFocusRing: 'focus-visible:ring-rose-500',
            selectedTagBg: 'bg-rose-500 hover:bg-rose-600',
            selectedTagBorder: 'border-rose-500',
            selectedTagText: 'text-white',
            selectedTagFocusRing: 'focus-visible:ring-rose-400',
            unselectedTagFocusRing: 'focus-visible:ring-rose-500', // For consistency, or could be neutral
        },
        // Add other themes if needed
    };
    const currentTheme = THEME_CLASSES[themeColor] || THEME_CLASSES.rose;

    const identifierButtonVariants = {
        initial: { opacity: 0, y: 10, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
        exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
        hover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 15 } },
        tap: { scale: 0.95, transition: { duration: 0.1 } },
    };

    // ===========================================================================
    // State
    // ===========================================================================
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ===========================================================================
    // Handlers
    // ===========================================================================
    const openModal = useCallback(() => setIsModalOpen(true), []);
    const closeModal = useCallback(() => setIsModalOpen(false), []);

const handleModalSubmit = useCallback(async (newTagData) => {
    console.log("ProductIdentifiers: handleModalSubmit called with", newTagData); // ADD THIS
    try {
        await onCustomTagCreate(newTagData);
        console.log("ProductIdentifiers: onCustomTagCreate succeeded."); // ADD THIS
        closeModal(); 
    } catch (error) {
        console.error("ProductIdentifiers: Error caught in handleModalSubmit from onCustomTagCreate:", error); // ADD THIS
    }
}, [onCustomTagCreate, closeModal]);

    // ===========================================================================
    // Derived State / Calculations
    // ===========================================================================
    // Memoize `existingLabels` to prevent re-calculation on every render if `allAvailableIdentifiers` hasn't changed.
    const existingLabels = useMemo(
        () => allAvailableIdentifiers.map(idfr => idfr.label),
        [allAvailableIdentifiers]
    );

    const generalError = typeof error === 'string' ? error : error?.list;

    // ===========================================================================
    // Validation Logic (Props Validation)
    // ===========================================================================
    if (!Array.isArray(allAvailableIdentifiers)) {
        console.error('ProductIdentifiers: `allAvailableIdentifiers` prop is required and must be an array.');
        return <p className="text-sm text-red-600">Identifier data is missing or invalid.</p>;
    }
    if (allAvailableIdentifiers.some(idfr => typeof idfr.id !== 'string' || typeof idfr.label !== 'string')) {
        console.error('ProductIdentifiers: Each item in `allAvailableIdentifiers` must have an `id` (string) and `label` (string).');
        return <p className="text-sm text-red-600">Invalid identifier data structure.</p>;
    }
    if (!Array.isArray(selectedIdentifiers)) {
        console.error('ProductIdentifiers: `selectedIdentifiers` prop is required and must be an array of strings.');
        return <p className="text-sm text-red-600">Selected identifiers data is missing or invalid.</p>;
    }
    if (typeof onToggleIdentifier !== 'function') {
        console.error('ProductIdentifiers: `onToggleIdentifier` prop is required and must be a function.');
        return <p className="text-sm text-red-600">Identifier toggle handler is missing.</p>;
    }
    if (typeof onCustomTagCreate !== 'function') {
        console.error('ProductIdentifiers: `onCustomTagCreate` prop is required and must be a function.');
        return <p className="text-sm text-red-600">Custom tag creation handler is missing.</p>;
    }

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    return (
        <div className={`product-identifiers-container ${className}`} role="group" aria-labelledby={labelId}>
            {/* Header: Label and "Add Tag" button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 font-montserrat">
                {label && (
                    <label id={labelId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 sm:mb-0">
                        {label}
                    </label>
                )}
                <button
                    type="button"
                    onClick={openModal}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-150 
                                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800
                                ${currentTheme.addTagButtonText} ${currentTheme.addTagButtonHoverBg} ${currentTheme.addTagButtonFocusRing}`}
                    aria-label="Add custom product attribute or tag"
                >
                    <Icon name="add_circle" className="w-6 h-6" /> {/* Updated icon size for consistency */}
                    Add Tag
                </button>
            </div>

            {/* General Error Display for the list */}
            {generalError && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2 p-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-md flex items-center gap-1"
                    role="alert"
                    id={listErrorId}
                >
                    <Icon name="error_outline" className="w-3.5 h-3.5 flex-shrink-0" />
                    {generalError}
                </motion.div>
            )}

            {/* Container for identifier buttons */}
            <div
                className="flex flex-wrap gap-2.5 min-h-[3rem] p-1 border border-transparent" // min-height to prevent layout jumps, p-1 for focus rings
                role="listbox" // Using listbox role for a set of selectable options
                aria-labelledby={labelId}
                aria-multiselectable="true"
                aria-describedby={listErrorId || undefined}
            >
                <LayoutGroup> {/* Enables shared layout animations for children */}
                    <AnimatePresence initial={false}>
                        {allAvailableIdentifiers.map((identifier) => {
                            const isSelected = selectedIdentifiers.includes(identifier.id);
                            return (
                                <motion.button
                                    key={identifier.id}
                                    type="button"
                                    layout // Animate layout changes (add/remove/reorder)
                                    variants={identifierButtonVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={() => onToggleIdentifier(identifier.id)}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 border rounded-full text-xs sm:text-sm font-medium
                                                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800
                                                shadow-sm hover:shadow-md
                                                ${isSelected
                                            ? `${currentTheme.selectedTagBg} ${currentTheme.selectedTagText} ${currentTheme.selectedTagBorder} ${currentTheme.selectedTagFocusRing}`
                                            : `bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600 
                                               hover:bg-neutral-50 dark:hover:bg-neutral-600 ${currentTheme.unselectedTagFocusRing}`
                                        }`}
                                    role="option"
                                    aria-selected={isSelected}
                                    aria-pressed={isSelected} // Use aria-pressed for toggle buttons
                                >
                                    {identifier.iconName && (
                                        <Icon name={identifier.iconName} className={`w-6 h-6 ${isSelected ? 'text-white opacity-90' : 'text-current opacity-70'}`} />
                                    )}
                                    <span className="leading-tight">{identifier.label}</span>
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                </LayoutGroup>
                {/* Empty state message */}
                {allAvailableIdentifiers.length === 0 && !generalError && (
                    <div className="w-full text-center py-3 text-sm text-neutral-500 dark:text-neutral-400 italic">
                        No attributes defined yet. Click "Add Tag" to create one.
                    </div>
                )}
            </div>

            {/* Modal for creating custom tags */}
            <CustomTagModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleModalSubmit}
                existingLabels={existingLabels} // Pass existing labels to prevent duplicates within the modal
                submissionError={customTagCreationError}
            // availableIcons can be passed if CustomTagModal supports an icon picker
            />
        </div>
    );
};

ProductIdentifiers.propTypes = {
    label: PropTypes.string,
    allAvailableIdentifiers: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        iconName: PropTypes.string,
        isCustom: PropTypes.bool,
    })).isRequired,
    selectedIdentifiers: PropTypes.arrayOf(PropTypes.string).isRequired,
    onToggleIdentifier: PropTypes.func.isRequired,
    onCustomTagCreate: PropTypes.func.isRequired,
    className: PropTypes.string,
    themeColor: PropTypes.oneOf(['rose' /*, add other themes here */]),
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

ProductIdentifiers.defaultProps = {
    label: "Product Attributes",
    allAvailableIdentifiers: [],
    selectedIdentifiers: [],
    className: "",
    themeColor: "rose",
    error: null,
};

export default memo(ProductIdentifiers);