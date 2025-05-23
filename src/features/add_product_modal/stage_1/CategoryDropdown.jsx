import React, { useState, memo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import ColorPalette from './ColorPalette';
import scriptLines from '../utils/script_lines'; // Already imported

// Predefined colors for new categories - names are now localized
export const defaultCategoryPaletteColors = [
    { value: 'bg-rose-500', name: scriptLines.colorRose || 'Rose' }, { value: 'bg-pink-500', name: scriptLines.colorPink || 'Pink' },
    { value: 'bg-fuchsia-500', name: scriptLines.colorFuchsia || 'Fuchsia' }, { value: 'bg-purple-500', name: scriptLines.colorPurple || 'Purple' },
    { value: 'bg-violet-500', name: scriptLines.colorViolet || 'Violet' }, { value: 'bg-indigo-500', name: scriptLines.colorIndigo || 'Indigo' },
    { value: 'bg-blue-500', name: scriptLines.colorBlue || 'Blue' }, { value: 'bg-sky-500', name: scriptLines.colorSky || 'Sky' },
    { value: 'bg-cyan-500', name: scriptLines.colorCyan || 'Cyan' }, { value: 'bg-teal-500', name: scriptLines.colorTeal || 'Teal' },
    { value: 'bg-emerald-500', name: scriptLines.colorEmerald || 'Emerald' }, { value: 'bg-green-500', name: scriptLines.colorGreen || 'Green' },
    { value: 'bg-lime-500', name: scriptLines.colorLime || 'Lime' }, { value: 'bg-yellow-500', name: scriptLines.colorYellow || 'Yellow' },
    { value: 'bg-amber-500', name: scriptLines.colorAmber || 'Amber' }, { value: 'bg-orange-500', name: scriptLines.colorOrange || 'Orange' },
    { value: 'bg-red-500', name: scriptLines.colorRed || 'Red' }, { value: 'bg-neutral-500', name: scriptLines.colorNeutral || 'Neutral' },
];

// Category colors mapping - no user-facing text here
export const categoryDisplayColors = {
    default: 'bg-neutral-400 dark:bg-neutral-500',
    breads: 'bg-yellow-600', pastries: 'bg-pink-500', cakes: 'bg-purple-500',
    cookies: 'bg-orange-500', beverages: 'bg-blue-500',
    'bg-rose-500': 'bg-rose-500', 'bg-pink-500': 'bg-pink-500', 'bg-fuchsia-500': 'bg-fuchsia-500',
    'bg-purple-500': 'bg-purple-500', 'bg-violet-500': 'bg-violet-500', 'bg-indigo-500': 'bg-indigo-500',
    'bg-blue-500': 'bg-blue-500', 'bg-sky-500': 'bg-sky-500', 'bg-cyan-500': 'bg-cyan-500',
    'bg-teal-500': 'bg-teal-500', 'bg-emerald-500': 'bg-emerald-500', 'bg-green-500': 'bg-green-500',
    'bg-lime-500': 'bg-lime-500', 'bg-yellow-500': 'bg-yellow-500', 'bg-amber-500': 'bg-amber-500',
    'bg-orange-500': 'bg-orange-500', 'bg-red-500': 'bg-red-500', 'bg-neutral-500': 'bg-neutral-500',
};

const CategoryDropdown = ({
    options = [],
    value,
    onChange,
    onNewCategorySubmit,
    error,
    placeholder = scriptLines.categoryDropdownPlaceholder || "Select or create category", // Already localized
    className = "",
    availableColorsForNewCategory = defaultCategoryPaletteColors,
    id,
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryColor, setNewCategoryColor] = useState(availableColorsForNewCategory[0]?.value || '#CCCCCC');
    const [newCategoryNameError, setNewCategoryNameError] = useState("");

    const componentRootRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);
    const displayColorClass = selectedOption?.color_class || categoryDisplayColors.default;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (componentRootRef.current && !componentRootRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
                if (isCreateFormOpen) {
                    setIsCreateFormOpen(false);
                    setNewCategoryNameError("");
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isCreateFormOpen]);

    const toggleDropdown = () => {
        if (isCreateFormOpen) {
            setIsCreateFormOpen(false);
            setIsDropdownOpen(false);
            setNewCategoryNameError("");
        } else {
            setIsDropdownOpen(!isDropdownOpen);
        }
    };

    const handleSelect = (optionValue) => {
        if (optionValue === 'trigger_create_new_category') {
            setIsDropdownOpen(false);
            setIsCreateFormOpen(true);
            setNewCategoryName("");
            setNewCategoryColor(availableColorsForNewCategory[0]?.value || '#CCCCCC');
            setNewCategoryNameError("");
        } else {
            onChange(optionValue);
            setIsDropdownOpen(false);
            setIsCreateFormOpen(false);
            setNewCategoryNameError("");
        }
    };

    const handleCreateCategoryNameChange = (e) => {
        setNewCategoryName(e.target.value);
        if (newCategoryNameError && e.target.value.trim()) {
            setNewCategoryNameError("");
        }
    };

    const handleSaveNewCategory = () => {
        const trimmedName = newCategoryName.trim();
        if (!trimmedName) {
            setNewCategoryNameError(scriptLines.categoryDropdownErrorNameEmpty || "Category name cannot be empty."); // Already localized
            return;
        }
        if (options.some(opt => opt.label.toLowerCase() === trimmedName.toLowerCase())) {
            setNewCategoryNameError(scriptLines.categoryDropdownErrorNameExists || "A category with this name already exists."); // Already localized
            return;
        }

        if (onNewCategorySubmit) {
            const newCategoryValue = trimmedName.toLowerCase().replace(/\s+/g, '_');
            onNewCategorySubmit({
                value: newCategoryValue,
                label: trimmedName,
                colorClass: newCategoryColor,
            });
            // Optionally close form and clear state on successful submission (parent might control this by re-rendering)
            // setIsCreateFormOpen(false);
            // setNewCategoryName("");
            // setNewCategoryNameError("");
        }
    };

    const handleCancelCreate = () => {
        setIsCreateFormOpen(false);
        setNewCategoryName("");
        setNewCategoryNameError("");
    };

    const allDropdownOptions = [...options, { 
        value: 'trigger_create_new_category', 
        label: scriptLines.categoryDropdownCreateNewActionLabel || 'Create New Category...', // Already localized
        isAction: true 
    }];

    const dropdownAnimation = {
        initial: { opacity: 0, y: -10, height: 0, scale: 0.95 },
        animate: { opacity: 1, y: 0, height: 'auto', scale: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
        exit: { opacity: 0, y: -10, height: 0, scale: 0.95, transition: { duration: 0.15, ease: [0.76, 0, 0.24, 1] } },
    };

    const formAnimation = {
        initial: { opacity: 0, height: 0, marginTop: 0, y: -10 },
        animate: { opacity: 1, height: 'auto', marginTop: '0.5rem', y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
        exit: { opacity: 0, height: 0, marginTop: 0, y: -10, transition: { duration: 0.2, ease: [0.76, 0, 0.24, 1] } },
    };

    const formBgLight = 'bg-neutral-50';
    const formBgDark = 'dark:bg-neutral-800';

    return (
        <div className={`relative font-montserrat ${className}`} ref={componentRootRef}>
            <div className="relative">
                <button
                    id={id}
                    type="button"
                    onClick={toggleDropdown}
                    className={`w-full flex items-center justify-between py-2.5 px-4 border rounded-full text-sm transition-all duration-150
                                bg-white dark:bg-neutral-800 
                                text-neutral-900 dark:text-neutral-100 
                                focus:outline-none focus:ring-2 focus:ring-rose-500/80 dark:focus:ring-rose-400/80 focus:border-rose-500 dark:focus:border-rose-400 dark:focus:ring-offset-neutral-800
                                ${error ? 'border-red-500 dark:border-red-400' : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'}`}
                    aria-haspopup="listbox" aria-expanded={isDropdownOpen || isCreateFormOpen}
                >
                    <span className="flex items-center truncate font-medium">
                        {selectedOption ? (
                            <>
                                <span className={`w-3.5 h-3.5 rounded-sm mr-2.5 flex-shrink-0 ${displayColorClass}`}></span>
                                <span className="truncate">{selectedOption.label}</span>
                            </>
                        ) : (
                            <span className="text-neutral-500 dark:text-neutral-400">{placeholder}</span>
                        )}
                    </span>
                    <Icon name={"expand_more"} className={`w-6 h-6 text-neutral-500 dark:text-neutral-400 flex-shrink-0 transition-all duration-300 ${isDropdownOpen || isCreateFormOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.ul
                            className={`absolute top-full left-0 z-20 w-full mt-1.5
                                        bg-white dark:bg-neutral-800
                                        border border-neutral-300 dark:border-neutral-700 
                                        rounded-xl shadow-xl dark:shadow-black/40 max-h-60 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent`}
                            role="listbox"
                            variants={dropdownAnimation}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            data-testid="dropdown-options-list"
                        >
                            {allDropdownOptions.map((option) => (
                                <li
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`p-3 text-sm cursor-pointer flex items-center group transition-colors duration-100
                                                hover:bg-neutral-100 dark:hover:bg-neutral-700/70
                                                ${option.value === value ? 'font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10' : 'text-neutral-800 dark:text-neutral-200'}
                                                ${option.isAction ? '!text-rose-600 dark:!text-rose-400 hover:!bg-rose-50 dark:hover:!bg-rose-900/40 font-medium' : ''}`}
                                    role="option" aria-selected={option.value === value}
                                >
                                    {!option.isAction && (
                                        <span className={`w-3.5 h-3.5 rounded-sm mr-2.5 flex-shrink-0 ${option.color_class} ${categoryDisplayColors[option.color_class] || categoryDisplayColors.default}`}></span>)}
                                    {option.isAction &&
                                        <Icon
                                            name="add_circle"
                                            className="w-4 h-4 mr-2 text-rose-500 dark:text-rose-400 group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors duration-150"
                                            style={{ fontSize: '1rem' }}
                                            variations={{ fill: 0, weight: 600, grade: 0, opsz: 48 }}
                                        />}
                                    <span className={`truncate ${option.isAction ? 'font-normal' : 'font-medium'}`}>{option.label}</span>
                                </li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>
            {error && !isCreateFormOpen && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 px-1">{error}</p>}

            <AnimatePresence>
                {isCreateFormOpen && (
                    <motion.div
                        key="create-category-form"
                        className="overflow-hidden"
                        variants={formAnimation}
                        initial="initial" animate="animate" exit="exit"
                    >
                        <div className={`p-4 border border-neutral-300 dark:border-neutral-700 ${formBgLight} ${formBgDark} rounded-lg space-y-4 shadow-lg dark:shadow-black/30`}>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={handleCreateCategoryNameChange}
                                placeholder={scriptLines.categoryDropdownNewNamePlaceholder || "New category name"} // Already localized
                                className={`w-full text-sm px-3 py-2.5 border rounded-full
                                            bg-white dark:bg-neutral-700 
                                            text-neutral-900 dark:text-neutral-100 
                                            placeholder-neutral-400 dark:placeholder-neutral-500
                                            focus:outline-none focus:ring-2 focus:ring-rose-500/70 focus:border-rose-500 
                                            dark:focus:ring-rose-400/70 dark:focus:border-rose-400
                                            transition-colors duration-150
                                            ${newCategoryNameError ? 'border-red-500 dark:border-red-400' : 'border-neutral-300 dark:border-neutral-600'}`}
                                maxLength={50}
                                autoFocus
                            />
                            {newCategoryNameError && <p className="text-xs text-red-500 dark:text-red-400 -mt-2 px-1">{newCategoryNameError}</p>}

                            <div>
                                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                                    {scriptLines.categoryDropdownColorLabel || "Category Color"} {/* Already localized */}
                                </label>
                                <ColorPalette
                                    availableColors={availableColorsForNewCategory}
                                    selectedColorValue={newCategoryColor}
                                    onColorSelect={setNewCategoryColor}
                                    containerBgLight={formBgLight}
                                    containerBgDark={formBgDark}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-1">
                                <button
                                    type="button"
                                    onClick={handleCancelCreate}
                                    className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-full transition-colors"
                                >
                                    {scriptLines.categoryDropdownButtonCancel || "Cancel"} {/* Already localized */}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveNewCategory}
                                    className="px-4 py-2 text-xs font-medium text-white bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 rounded-full transition-colors"
                                >
                                    {scriptLines.categoryDropdownButtonCreate || "Create Category"} {/* Already localized */}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

CategoryDropdown.propTypes = {
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        colorClass: PropTypes.string,
    })).isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onNewCategorySubmit: PropTypes.func.isRequired,
    error: PropTypes.string,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    availableColorsForNewCategory: PropTypes.array,
    id: PropTypes.string,
};

export default memo(CategoryDropdown);