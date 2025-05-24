import React, { memo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';
import { InputField } from '../../../features/register/subcomponents';
import Icon from '../../../components/common/Icon';

import RecipeBuilder from '../stage_3/RecipeBuilder';
import CreateNewIngredientModal from '../stage_3/CreateNewIngredientModal';

import { useInventoryItems, useCreateInventoryItem } from '../../../contexts/ProductDataContext';
import { calculateRawRecipeCost } from '../utils/unitUtils';
import scriptLines from '../utils/script_lines'; // IMPORTED scriptLines

const Step3_Ingredients_Actual = memo(({ formData, updateField, updateFormData, errors }) => {
    const [isCreateIngredientModalOpen, setIsCreateIngredientModalOpen] = useState(false);
    const [newIngredientInitialName, setNewIngredientInitialName] = useState('');
    const [postIngredientCreationCallback, setPostIngredientCreationCallback] = useState(null);

    const { data: availableInventoryItemsData, isLoading: isLoadingInventory, error: inventoryError } = useInventoryItems();
    const availableInventoryItems = availableInventoryItemsData || [];

    const createInventoryItemMutation = useCreateInventoryItem();

    useEffect(() => {
        let targetCost;
        if (formData.productType === 'made_in_house') {
            targetCost = calculateRawRecipeCost(formData.recipeComponents, availableInventoryItems);
        } else {
            targetCost = 0;
        }

        if (formData.estimatedCostFromIngredients !== targetCost) {
            // console.log("Step3 ProductType/RecipeComponents Effect: Updating estimatedCostFromIngredients from", formData.estimatedCostFromIngredients, "to", targetCost); // Dev log
            updateFormData({ estimatedCostFromIngredients: targetCost });
        }
    }, [formData.productType, formData.recipeComponents, availableInventoryItems, updateFormData, formData.estimatedCostFromIngredients]);


    const handleRecipeComponentsChange = useCallback((newComponents) => {
        let newEstimatedCost = 0;
        if (formData.productType === 'made_in_house') {
            newEstimatedCost = calculateRawRecipeCost(newComponents, availableInventoryItems);
        }
        // console.log("[Step3] Unified Update: recipeComponents:", newComponents, "estimatedCostFromIngredients:", newEstimatedCost); // Dev log
        updateFormData({
            recipeComponents: newComponents,
            estimatedCostFromIngredients: newEstimatedCost
        });
    }, [availableInventoryItems, formData.productType, updateFormData]);

    const handleOpenCreateIngredientModal = useCallback((initialName = '', onCreatedCb) => {
        setNewIngredientInitialName(initialName);
        setPostIngredientCreationCallback(() => onCreatedCb);
        setIsCreateIngredientModalOpen(true);
    }, []);

    const handleCreateNewInventoryItem = async (newItemDataFromModal) => {
        try {
            const payload = {
                name: newItemDataFromModal.name,
                measurement_type: newItemDataFromModal.measurementType,
                default_unit: newItemDataFromModal.defaultUnit,
                cost_per_base_unit: newItemDataFromModal.costPerBaseUnit.value,
                base_unit_for_cost: newItemDataFromModal.costPerBaseUnit.unit,
            };
            // console.log("Step3: Payload for creating inventory item:", payload); // Dev log
            const createdItem = await createInventoryItemMutation.mutateAsync(payload);

            if (postIngredientCreationCallback && typeof postIngredientCreationCallback === 'function') {
                postIngredientCreationCallback(createdItem);
            }
            setIsCreateIngredientModalOpen(false);
            setPostIngredientCreationCallback(null);
            return createdItem;
        } catch (err) {
            // console.error("Step3: Failed to create inventory item (raw error object):", err); // Dev log
            let detailedErrorMessage = scriptLines.step3_error_failedToCreateIngredient;
            if (err.response && err.response.data) {
                // console.error("Step3: Backend Error Response Data:", err.response.data); // Dev log
                const responseData = err.response.data;
                if (typeof responseData === 'object' && responseData !== null) {
                    const fieldErrors = [];
                    for (const key in responseData) {
                        if (Array.isArray(responseData[key])) {
                            fieldErrors.push(`${key}: ${responseData[key].join(', ')}`);
                        } else {
                            fieldErrors.push(`${key}: ${responseData[key]}`);
                        }
                    }
                    if (fieldErrors.length > 0) {
                        detailedErrorMessage = `Error: ${fieldErrors.join('; ')}`; // Keep this dynamic part for now
                    } else if (responseData.detail) {
                        detailedErrorMessage = responseData.detail;
                    }
                } else if (typeof responseData === 'string') {
                    detailedErrorMessage = responseData;
                }
            } else if (err.message) {
                detailedErrorMessage = err.message;
            }
            throw new Error(detailedErrorMessage);
        }
    };

    if (isLoadingInventory) {
        return <div className="py-10 text-center">{scriptLines.step3_loadingInventory}</div>;
    }
    if (inventoryError) {
        return <div className="py-10 text-center text-red-500">{scriptLines.step3_errorLoadingInventory.replace('{errorMessage}', inventoryError.message)}</div>;
    }

    return (
        <>
            <div className="flex flex-col gap-6 sm:gap-8 py-2">
                <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                        {scriptLines.step3_title}
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {scriptLines.step3_subtitle}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        {scriptLines.step3_productTypeLabel}
                    </label>
                    <div className="flex space-x-1 rounded-lg bg-neutral-100 dark:bg-neutral-700 p-1">
                        {[
                            { value: 'made_in_house', label: scriptLines.step3_productType_madeInHouse },
                            { value: 'resold_item', label: scriptLines.step3_productType_resoldItem },
                        ].map(type => (
                            <button
                                key={type.value} type="button"
                                className={`w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-700 ${formData.productType === type.value
                                    ? 'bg-white dark:bg-neutral-800 text-rose-600 dark:text-rose-400 shadow-sm'
                                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-white/70 dark:hover:bg-neutral-600/50'
                                    }`}
                                onClick={() => updateField('productType', type.value)}
                                aria-pressed={formData.productType === type.value}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                    {errors?.productType && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.productType}</p>}
                </div>

                <AnimatePresence mode="wait">
                    {formData.productType === 'made_in_house' && (
                        <motion.div
                            key="made_in_house_section"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.3 }} className="space-y-6"
                        >
                            <RecipeBuilder
                                components={formData.recipeComponents || []}
                                onComponentsChange={handleRecipeComponentsChange}
                                availableInventoryItems={availableInventoryItems}
                                errors={errors}
                                onOpenCreateIngredientModal={handleOpenCreateIngredientModal}
                            />
                            <div className='flex flex-col h-15 justify-end'>
                                <InputField
                                    label={scriptLines.step3_recipeYieldsLabel} name="recipeYields" type="number"
                                    value={formData.recipeYields}
                                    onChange={(e) => updateField('recipeYields', parseInt(e.target.value, 10) || 1)}
                                    error={errors?.recipeYields} placeholder={scriptLines.step3_recipeYieldsPlaceholder} min="1" step="1" required
                                    helptext={scriptLines.step3_recipeYieldsHelpText}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {formData.productType === 'resold_item' && (
                    <motion.div
                        key="resold_item_info"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.3 }}
                        className="p-4 bg-neutral-50 dark:bg-neutral-700/60 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-sm"
                    >
                        <div className="flex items-start">
                            <Icon name="storefront" className="w-6 h-6 text-neutral-500 dark:text-neutral-400 mr-2.5 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                {scriptLines.step3_resoldItemInfo}
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            <CreateNewIngredientModal
                isOpen={isCreateIngredientModalOpen}
                onClose={() => {
                    setIsCreateIngredientModalOpen(false);
                    setPostIngredientCreationCallback(null);
                }}
                onCreate={handleCreateNewInventoryItem}
                initialName={newIngredientInitialName}
                availableInventoryItems={availableInventoryItems}
            />
        </>
    );
});

Step3_Ingredients_Actual.propTypes = {
    formData: PropTypes.object.isRequired,
    updateField: PropTypes.func.isRequired,
    updateFormData: PropTypes.func.isRequired,
    errors: PropTypes.object,
};

export default Step3_Ingredients_Actual;