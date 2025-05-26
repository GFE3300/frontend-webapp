import React, { useState, useEffect, memo, useCallback, useMemo, useId, useRef } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { InputField, Dropdown } from '../../register/subcomponents';
import Icon from '../../../components/common/Icon';
import { categorizedUnits as allCategorizedUnits, getBaseUnit } from '../utils/unitUtils';
import scriptLines from '../utils/script_lines';

/**
 * A modal component for creating a new inventory item (ingredient).
 * It includes fields for the item's name, primary measurement type, default unit for that type,
 * and cost per base unit (e.g., cost per gram if measurement type is mass).
 * Features animated transitions, validation, and clear user feedback.
 *
 * @component CreateNewIngredientModal
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Controls the visibility of the modal. (Required)
 * @param {function} props.onClose - Callback function to close the modal. (Required)
 * @param {function} props.onCreate - Async callback function invoked when the new item is successfully created. Receives the new item data: `{ name: string, measurementType: string, defaultUnit: string, costPerBaseUnit: { value: number, unit: string } }`. Should return a Promise that resolves with the created item or throws an error. (Required)
 * @param {string} [props.initialName=""] - An initial name to pre-fill the name input, often from user's prior search.
 * @param {Array<Object>} props.availableInventoryItems - An array of existing inventory items, used to check for duplicate names. Each item must have a `name` property. (Required)
 * @param {string} [props.themeColor="rose"] - Theme color for accents.
 */

const CreateNewIngredientModal = ({
    isOpen,
    onClose,
    onCreate,
    initialName = '',
    availableInventoryItems,
    themeColor = "rose",
}) => {
    // ===========================================================================
    // Configuration
    // ===========================================================================
    const generatedIdBase = useId();
    const modalTitleId = `${generatedIdBase}-create-ingredient-title`;

    const prefersReducedMotion = useReducedMotion();

    const MEASUREMENT_TYPES = [
        { value: 'mass', label: scriptLines.createNewIngredientModal_measurementType_mass },
        { value: 'volume', label: scriptLines.createNewIngredientModal_measurementType_volume },
        { value: 'pieces', label: scriptLines.createNewIngredientModal_measurementType_pieces },
    ];

    const BASE_UNITS_FOR_COST = {
        mass: getBaseUnit('mass') || 'g',
        volume: getBaseUnit('volume') || 'ml',
        pieces: getBaseUnit('pieces') || 'pcs',
    };

    const THEME_CLASSES = {
        rose: {
            submitButtonBg: 'bg-rose-600 hover:bg-rose-700',
            submitButtonRing: 'focus-visible:ring-rose-500',
            closeButtonRing: 'focus-visible:ring-rose-500',
        },
    };
    const currentTheme = THEME_CLASSES[themeColor] || THEME_CLASSES.rose;

    const animationVariants = {
        backdrop: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.3, ease: "easeInOut" }
        },
        modalCard: {
            initial: { scale: prefersReducedMotion ? 1 : 0.95, opacity: 0, y: prefersReducedMotion ? 0 : 20 },
            animate: { scale: 1, opacity: 1, y: 0 },
            exit: { scale: prefersReducedMotion ? 1 : 0.95, opacity: 0, y: prefersReducedMotion ? 0 : 20 },
            transition: { type: "spring", stiffness: 280, damping: 25, duration: 0.3 }
        },
        formFieldEnter: { // For conditional fields like Default Unit and Cost
            initial: { opacity: 0, height: 0, marginTop: 0 },
            animate: { opacity: 1, height: 'auto', marginTop: '3rem', transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }, // 3rem matches space-y-12
            exit: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.2 } }
        }
    };
    
    animationVariants.backdrop.transition = { duration: 0.3, ease: "easeInOut" };
    animationVariants.modalCard.transition = { type: "spring", stiffness: 280, damping: 25, duration: 0.3 };
    animationVariants.formFieldEnter.animate.transition = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] };
    animationVariants.formFieldEnter.exit.transition = { duration: 0.2 };


    // ===========================================================================
    // State & Refs
    // ===========================================================================
    const [name, setName] = useState(initialName);
    const [measurementType, setMeasurementType] = useState('');
    const [defaultUnit, setDefaultUnit] = useState('');
    const [costPerBaseUnitValue, setCostPerBaseUnitValue] = useState('');
    const [errors, setErrors] = useState({});
    const [isCreating, setIsCreating] = useState(false);

    const nameInputRef = useRef(null);

    // ===========================================================================
    // Effects
    // ===========================================================================
    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setMeasurementType('');
            setDefaultUnit('');
            setCostPerBaseUnitValue('');
            setErrors({});
            setIsCreating(false);
            setTimeout(() => nameInputRef.current?.focus(), 100);
        }
    }, [isOpen, initialName]);

    useEffect(() => {
        if (measurementType) {
            const validUnitsForType = allCategorizedUnits[measurementType]?.map(u => u.value) || [];
            if (!validUnitsForType.includes(defaultUnit)) {
                setDefaultUnit('');
            }
        } else {
            setDefaultUnit('');
        }
    }, [measurementType, defaultUnit]);


    // ===========================================================================
    // Handlers & Internal Validation
    // ===========================================================================
    const validateForm = useCallback(() => {
        const newErrors = {};
        const trimmedName = name.trim();
        if (!trimmedName) {
            newErrors.name = scriptLines.createNewIngredientModal_error_nameRequired;
        } else if (availableInventoryItems.some(item => item.name.toLowerCase() === trimmedName.toLowerCase())) {
            newErrors.name = scriptLines.createNewIngredientModal_error_nameExists;
        }

        if (!measurementType) newErrors.measurementType = scriptLines.createNewIngredientModal_error_measurementTypeRequired;
        if (!defaultUnit && measurementType) newErrors.defaultUnit = scriptLines.createNewIngredientModal_error_defaultUnitRequired;

        const costVal = parseFloat(costPerBaseUnitValue);
        if (costPerBaseUnitValue === '' || isNaN(costVal) || costVal < 0) {
            newErrors.costPerBaseUnitValue = scriptLines.createNewIngredientModal_error_costRequired;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [name, measurementType, defaultUnit, costPerBaseUnitValue, availableInventoryItems]);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) {
            if (errors.name) nameInputRef.current?.focus();
            return;
        }
        setIsCreating(true);
        try {
            const newItemData = {
                name: name.trim(),
                measurementType,
                defaultUnit,
                costPerBaseUnit: {
                    value: parseFloat(costPerBaseUnitValue),
                    unit: BASE_UNITS_FOR_COST[measurementType],
                },
            };
            await onCreate(newItemData);
            onClose();
        } catch (err) {
            setErrors(prev => ({ ...prev, form: err.message || scriptLines.createNewIngredientModal_error_creationFailed }));
            console.error("Ingredient creation submit error:", err); // Dev log
        } finally {
            setIsCreating(false);
        }
    }, [validateForm, name, measurementType, defaultUnit, costPerBaseUnitValue, onCreate, onClose, BASE_UNITS_FOR_COST, errors.name]);

    // ===========================================================================
    // Derived State / Calculations for Rendering
    // ===========================================================================
    const currentUnitOptions = useMemo(() => {
        if (!measurementType || !allCategorizedUnits[measurementType]) return [];
        return allCategorizedUnits[measurementType].map(u => ({ value: u.value, label: u.label || u.value }));
    }, [measurementType]);

    const isSubmitDisabled = isCreating || !name.trim() || !measurementType || (measurementType && !defaultUnit) || costPerBaseUnitValue === '' || parseFloat(costPerBaseUnitValue) < 0;

    // Placeholder for cost input field. A more robust solution might involve `Intl.NumberFormat` or similar.
    // For simplicity, we'll use a placeholder key that can be adapted.
    // This assumes USD is the primary context for the placeholder example.
    // It can be made more generic if needed or tied to a currency setting.
    const costInputPlaceholder = scriptLines.createNewIngredientModal_costPerBaseUnitPlaceholder_USD || "e.g., 0.02";


    // ===========================================================================
    // Validation Logic (Props Validation)
    // ===========================================================================
    if (typeof isOpen !== 'boolean') {
        console.error('CreateNewIngredientModal: `isOpen` prop is required and must be a boolean.');
        return null;
    }
    if (typeof onClose !== 'function' || typeof onCreate !== 'function') {
        console.error('CreateNewIngredientModal: `onClose` and `onCreate` props are required functions.');
        return isOpen ? <div role="alert" className="fixed inset-0 bg-black/50 flex items-center justify-center"><p className="text-white bg-red-700 p-4 rounded">{scriptLines.modalError_criticalHandlersMissing}</p></div> : null;
    }
    if (!Array.isArray(availableInventoryItems)) {
        console.error('CreateNewIngredientModal: `availableInventoryItems` prop is required and must be an array.');
        return isOpen ? <div role="alert" className="fixed inset-0 bg-black/50 flex items-center justify-center"><p className="text-white bg-red-700 p-4 rounded">{scriptLines.modalError_inventoryDataMissing}</p></div> : null;
    }

    // ===========================================================================
    // Rendering Logic
    // ===========================================================================
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="create-ingredient-modal-backdrop"
                    variants={animationVariants.backdrop}
                    initial="initial" animate="animate" exit="exit"
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/10 backdrop-blur-sm font-montserrat mb-0"
                    onClick={onClose}
                >
                    <motion.div
                        key="create-ingredient-modal-card"
                        variants={animationVariants.modalCard}
                        className="bg-white dark:bg-neutral-800 rounded-4xl shadow-2xl w-full max-w-lg flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={modalTitleId}
                        aria-describedby={errors.form ? `${generatedIdBase}-form-error` : undefined}
                    >
                        <div className="px-6 pt-5 pb-4 sm:px-8 sm:pt-6 sm:pb-5 border-b border-neutral-200 dark:border-neutral-700">
                            <div className="flex justify-between items-start">
                                <h2 id={modalTitleId} className="text-lg sm:text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                                    {scriptLines.createNewIngredientModal_title}
                                </h2>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={`p-2 w-10 h-10 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150 focus:outline-none focus-visible:ring-2 ${currentTheme.closeButtonRing} focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-800`}
                                    aria-label={scriptLines.common_closeModal_ariaLabel || scriptLines.createNewIngredientModal_close_ariaLabel}
                                >
                                    <Icon name="close" className="w-6 h-6 sm:w-6 sm:h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-5 sm:px-8 sm:py-6 space-y-12 max-h-[calc(90vh-150px)]">
                            <motion.div layout="position" key="form-fields-container">
                                <InputField
                                    ref={nameInputRef}
                                    className="mt-6"
                                    id={`${generatedIdBase}-name`}
                                    label={scriptLines.createNewIngredientModal_itemNameLabel}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={scriptLines.createNewIngredientModal_itemNamePlaceholder}
                                    required
                                    autoFocus
                                    error={errors.name}
                                    maxLength={100}
                                />
                                <div className="mt-12">
                                    <Dropdown
                                        id={`${generatedIdBase}-measurementType`}
                                        label={scriptLines.createNewIngredientModal_measurementTypeLabel}
                                        options={[{ value: '', label: scriptLines.createNewIngredientModal_measurementTypePlaceholder }, ...MEASUREMENT_TYPES]}
                                        value={measurementType}
                                        onChange={setMeasurementType}
                                        required
                                        error={errors.measurementType}
                                    />
                                </div>
                                <AnimatePresence>
                                    {measurementType && (
                                        <motion.div variants={animationVariants.formFieldEnter} initial="initial" animate="animate" exit="exit">
                                            <Dropdown
                                                id={`${generatedIdBase}-defaultUnit`}
                                                label={scriptLines.createNewIngredientModal_defaultUnitLabel}
                                                options={[{ value: '', label: scriptLines.createNewIngredientModal_defaultUnitPlaceholder }, ...currentUnitOptions]}
                                                value={defaultUnit}
                                                onChange={setDefaultUnit}
                                                required
                                                error={errors.defaultUnit}
                                                disabled={!measurementType || currentUnitOptions.length === 0}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <AnimatePresence>
                                    {measurementType && BASE_UNITS_FOR_COST[measurementType] && (
                                        <motion.div variants={animationVariants.formFieldEnter} initial="initial" animate="animate" exit="exit">
                                            <InputField
                                                id={`${generatedIdBase}-cost`}
                                                label={scriptLines.createNewIngredientModal_costPerBaseUnitLabel.replace('{baseUnit}', BASE_UNITS_FOR_COST[measurementType])}
                                                type="number"
                                                value={costPerBaseUnitValue}
                                                onChange={(e) => setCostPerBaseUnitValue(e.target.value)}
                                                placeholder={costInputPlaceholder}
                                                min="0"
                                                step="any"
                                                required
                                                error={errors.costPerBaseUnitValue}
                                                helptext={scriptLines.createNewIngredientModal_costPerBaseUnitHelpText.replace('{baseUnit}', BASE_UNITS_FOR_COST[measurementType])}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {errors.form && (
                                    <p id={`${generatedIdBase}-form-error`} className="text-xs mt-4 text-red-600 dark:text-red-400 text-center flex items-center justify-center gap-1">
                                        <Icon name="error_outline" className="w-6 h-6 flex-shrink-0" /> {errors.form}
                                    </p>
                                )}
                            </motion.div>
                        </div>

                        <div className="px-6 py-4 sm:px-8 sm:py-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-b-xl flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3 border-t border-neutral-200 dark:border-neutral-700">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isCreating}
                                className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-500 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900/50"
                            >
                                {scriptLines.common_cancel || scriptLines.createNewIngredientModal_button_cancel}
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitDisabled}
                                className={`w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white ${currentTheme.submitButtonBg} rounded-full shadow-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${currentTheme.submitButtonRing} dark:focus-visible:ring-offset-neutral-900/50 disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                                {isCreating
                                    ? <><Icon name="progress_activity" className="w-6 h-6 animate-spin inline mr-2 align-text-bottom" />{scriptLines.createNewIngredientModal_button_creating}</>
                                    : scriptLines.createNewIngredientModal_button_createItem}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

CreateNewIngredientModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,
    initialName: PropTypes.string,
    availableInventoryItems: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
    })).isRequired,
    themeColor: PropTypes.oneOf(['rose']),
};

CreateNewIngredientModal.defaultProps = {
    initialName: '',
    themeColor: "rose",
};

export default memo(CreateNewIngredientModal);