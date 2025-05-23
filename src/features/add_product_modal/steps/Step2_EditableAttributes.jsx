import React, { memo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Icon from '../../../components/common/Icon';
import AttributeGroupBuilder from '../stage_2/AttributeGroupBuilder';

const generateId = (prefix = 'id_') => `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

const Step2_EditableAttributes_Actual = memo(({ formData, updateField, errors }) => {
    const attributes = formData.editableAttributes || [];

    const handleAddGroup = () => {
        const newGroup = {
            id: generateId('attr_group_'), // Client-side temporary ID
            name: '',
            type: 'single_select', // Default type
            isRequired: false,
            options: [{ id: generateId('opt_'), name: '', priceAdjustment: 0, isDefault: false }],
        };
        updateField('editableAttributes', [...attributes, newGroup]);
    };

    const handleRemoveGroup = (groupIndex) => {
        updateField('editableAttributes', attributes.filter((_, idx) => idx !== groupIndex));
    };

    const handleGroupChange = (groupIndex, field, value) => {
        const newAttributes = attributes.map((group, idx) =>
            idx === groupIndex ? { ...group, [field]: value } : group
        );
        updateField('editableAttributes', newAttributes);
    };

    const handleAddOption = (groupIndex) => {
        const newOption = { id: generateId('opt_'), name: '', priceAdjustment: 0, isDefault: false };
        const newAttributes = attributes.map((group, idx) =>
            idx === groupIndex ? { ...group, options: [...group.options, newOption] } : group
        );
        updateField('editableAttributes', newAttributes);
    };

    const handleRemoveOption = (groupIndex, optionIndex) => {
        const newAttributes = attributes.map((group, idx) => {
            if (idx === groupIndex) {
                const newOptions = group.options.filter((_, optIdx) => optIdx !== optionIndex);
                return { ...group, options: newOptions };
            }
            return group;
        });
        updateField('editableAttributes', newAttributes);
    };

    const handleOptionChange = (groupIndex, optionIndex, field, value) => {
        const newAttributes = attributes.map((group, idx) => {
            if (idx === groupIndex) {
                let newOptions = group.options.map((opt, optIdx) =>
                    optIdx === optionIndex ? { ...opt, [field]: value } : opt
                );
                // Ensure only one default for single_select type
                if (field === 'isDefault' && value === true && group.type === 'single_select') {
                    newOptions = newOptions.map((opt, optIdx) =>
                        optIdx === optionIndex ? opt : { ...opt, isDefault: false }
                    );
                }
                return { ...group, options: newOptions };
            }
            return group;
        });
        updateField('editableAttributes', newAttributes);
    };
    
    const handleReorderGroups = (reorderedAttributes) => {
        updateField('editableAttributes', reorderedAttributes);
    };
    
    // This is for reordering options *within* a group.
    // The AttributeGroupBuilder would manage its own options' reorder state and then
    // call onGroupChange with the updated 'options' array for that group.
    const handleReorderOptionsInGroup = (groupIndex, reorderedOptionsArray) => {
        const newAttributes = attributes.map((group, idx) =>
            idx === groupIndex ? { ...group, options: reorderedOptionsArray } : group
        );
        updateField('editableAttributes', newAttributes);
    };

    const arrayLevelError = errors?.editableAttributes && typeof errors.editableAttributes === 'string'
        ? errors.editableAttributes
        : null;

    return (
        <div className="flex flex-col gap-6 sm:gap-8 py-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                    Product Customizations
                </h2>
                <motion.button
                    type="button"
                    onClick={handleAddGroup}
                    className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500 dark:focus-visible:ring-offset-neutral-800"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                >
                    <Icon name="add_circle" className="w-5 h-5" /> Add Attribute Group
                </motion.button>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 -mt-4 sm:-mt-6">
                Define options your customers can choose, like size, flavor, or add-ons. These can optionally adjust the price.
            </p>

            {arrayLevelError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md text-xs text-red-700 dark:text-red-300">
                    {arrayLevelError}
                </motion.div>
            )}

            {attributes.length === 0 && !arrayLevelError && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10 sm:py-12 px-4 sm:px-6 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700/20"
                >
                    <Icon name="layers" className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-neutral-400 dark:text-neutral-500 mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-md font-medium text-neutral-700 dark:text-neutral-200 mb-1 sm:mb-2">No Customizations Yet</p>
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                        Click "Add Attribute Group" to let customers personalize this product.
                    </p>
                </motion.div>
            )}

            <Reorder.Group axis="y" values={attributes.map(g => g.id)} onReorder={handleReorderGroups} className="space-y-4">
                <AnimatePresence initial={false}>
                    {attributes.map((group, index) => {
                        const groupErrors = errors?.editableAttributes?.[index] || {};
                        return (
                            <Reorder.Item key={group.id} value={group.id} className="bg-transparent">
                                <AttributeGroupBuilder
                                    group={group}
                                    groupIndex={index}
                                    onGroupChange={handleGroupChange}
                                    onRemoveGroup={handleRemoveGroup}
                                    onOptionChange={handleOptionChange}
                                    onAddOption={handleAddOption}
                                    onRemoveOption={handleRemoveOption}
                                    onReorderOptions={(groupIndexForReorder, reorderedOptions) => handleReorderOptionsInGroup(groupIndexForReorder, reorderedOptions)}
                                    errors={groupErrors}
                                />
                            </Reorder.Item>
                        );
                    })}
                </AnimatePresence>
            </Reorder.Group>
        </div>
    );
});

Step2_EditableAttributes_Actual.displayName = 'Step2_EditableAttributes_Actual';
Step2_EditableAttributes_Actual.propTypes = {
    formData: PropTypes.object.isRequired,
    updateField: PropTypes.func.isRequired,
    errors: PropTypes.object,
};

export default Step2_EditableAttributes_Actual;