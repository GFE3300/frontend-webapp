// frontend/src/features/menu_view/subcomponents/ProductDetailModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
// Assuming a utility function exists for price calculation
// import { calculateItemPriceWithSelectedOptions } from '../../../utils/priceUtils'; 
// Assuming a utility function exists for display price
// import { getEffectiveDisplayPrice } from '../../../utils/productUtils';
// Assuming NumberStepperfix.jsx is available
// import NumberStepperfix from './NumberStepperfix'; 

// Placeholder for actual utility functions until they are provided/confirmed
const calculateItemPriceWithSelectedOptions = (basePrice, selectedOptionsMap, product) => {
    let currentItemPrice = basePrice;
    let calculatedSelectedOptions = [];

    if (product && product.editable_attribute_groups) {
        product.editable_attribute_groups.forEach(group => {
            const selectedOptionId = selectedOptionsMap[group.id];
            if (selectedOptionId) {
                const option = group.options.find(opt => opt.id === selectedOptionId);
                if (option && option.price_adjustment) {
                    currentItemPrice += option.price_adjustment;
                }
                if (option) {
                    calculatedSelectedOptions.push({
                        group_id: group.id,
                        group_name: group.name,
                        option_id: option.id,
                        option_name: option.name,
                        price_adjustment: option.price_adjustment || 0,
                    });
                }
            } else if (group.type === 'MULTI_SELECT' && selectedOptionsMap[group.id] && Array.isArray(selectedOptionsMap[group.id])) {
                const selectedOptionIds = selectedOptionsMap[group.id];
                selectedOptionIds.forEach(optId => {
                    const option = group.options.find(opt => opt.id === optId);
                    if (option && option.price_adjustment) {
                        currentItemPrice += option.price_adjustment;
                    }
                    if (option) {
                        calculatedSelectedOptions.push({
                            group_id: group.id,
                            group_name: group.name,
                            option_id: option.id,
                            option_name: option.name,
                            price_adjustment: option.price_adjustment || 0,
                        });
                    }
                });
            }
        });
    }
    return { currentItemPriceWithOptionsMenu: currentItemPrice, detailedSelectedOptions: calculatedSelectedOptions };
};

const getEffectiveDisplayPrice = (product) => {
    // Placeholder logic, replace with actual implementation
    return { displayPrice: product?.price || 0, basePrice: product?.price || 0 };
};

// Placeholder for NumberStepperfix until provided
const NumberStepperfix = ({ value, onChange, minValue = 1, maxValue = 99 }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
                onClick={() => onChange(Math.max(minValue, value - 1))}
                disabled={value <= minValue}
                aria-label="Decrease quantity"
            >
                -
            </button>
            <span aria-live="polite">{value}</span>
            <button
                onClick={() => onChange(Math.min(maxValue, value + 1))}
                disabled={value >= maxValue}
                aria-label="Increase quantity"
            >
                +
            </button>
        </div>
    );
};
NumberStepperfix.propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
};


const ProductDetailModal = ({
    isOpen,
    onClose,
    product,
    onConfirmWithOptions,
}) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedOptionsMap, setSelectedOptionsMap] = useState({});
    const [validationErrors, setValidationErrors] = useState({});

    const { displayPrice: baseProductPrice } = useMemo(() => {
        if (!product) return { displayPrice: 0 };
        return getEffectiveDisplayPrice(product);
    }, [product]);

    useEffect(() => {
        if (product) {
            // Reset state when product changes or modal opens
            setQuantity(1);
            const initialSelectedOptions = {};
            // Pre-select default options if any (not specified, but good practice)
            // Or ensure required single-select groups have a selection if a default is marked
            product.editable_attribute_groups?.forEach(group => {
                if (group.type === 'SINGLE_SELECT' && group.options.length > 0) {
                    // Example: pre-select the first option if no specific default logic
                    // initialSelectedOptions[group.id] = group.options[0].id; 
                } else if (group.type === 'MULTI_SELECT') {
                    initialSelectedOptions[group.id] = [];
                }
            });
            setSelectedOptionsMap(initialSelectedOptions);
            setValidationErrors({});
        }
    }, [product, isOpen]);

    const handleOptionChange = (groupId, optionId, groupType) => {
        setSelectedOptionsMap(prev => {
            const newSelectedOptions = { ...prev };
            if (groupType === 'SINGLE_SELECT') {
                newSelectedOptions[groupId] = optionId;
            } else if (groupType === 'MULTI_SELECT') {
                const currentSelection = prev[groupId] || [];
                if (currentSelection.includes(optionId)) {
                    newSelectedOptions[groupId] = currentSelection.filter(id => id !== optionId);
                } else {
                    newSelectedOptions[groupId] = [...currentSelection, optionId];
                }
            }
            return newSelectedOptions;
        });
        // Clear validation error for this group upon selection
        setValidationErrors(prev => ({ ...prev, [groupId]: null }));
    };

    const { currentItemPriceWithOptionsMenu, detailedSelectedOptions } = useMemo(() => {
        if (!product) return { currentItemPriceWithOptionsMenu: 0, detailedSelectedOptions: [] };
        return calculateItemPriceWithSelectedOptions(baseProductPrice, selectedOptionsMap, product);
    }, [baseProductPrice, selectedOptionsMap, product]);

    const totalPriceForQuantity = currentItemPriceWithOptionsMenu * quantity;

    const validateSelections = () => {
        if (!product || !product.editable_attribute_groups) return true;
        const errors = {};
        product.editable_attribute_groups.forEach(group => {
            if (group.is_required) {
                const selection = selectedOptionsMap[group.id];
                if (group.type === 'SINGLE_SELECT' && !selection) {
                    errors[group.id] = `${group.name} is required.`;
                } else if (group.type === 'MULTI_SELECT' && (!selection || selection.length === 0)) {
                    errors[group.id] = `${group.name} is required. Please select at least one option.`;
                }
                // Potentially add min/max selections for MULTI_SELECT if that becomes a feature
            }
        });
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleConfirm = () => {
        if (!validateSelections()) {
            return;
        }
        const configuredItemDetails = {
            quantity,
            selectedOptions: detailedSelectedOptions, // Use the detailed structure
            finalPricePerItem: currentItemPriceWithOptionsMenu,
            totalPriceForQuantity,
        };
        onConfirmWithOptions(product, configuredItemDetails);
        onClose();
    };

    if (!isOpen || !product) {
        return null;
    }

    // Sort attribute groups and options by display_order
    const sortedAttributeGroups = useMemo(() =>
        product.editable_attribute_groups?.sort((a, b) => a.display_order - b.display_order) || [],
        [product.editable_attribute_groups]
    );

    // Framer Motion variants
    const backdropVariants = {
        visible: { opacity: 1 },
        hidden: { opacity: 0 },
    };

    const modalVariants = {
        hidden: { y: "100vh", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
        exit: { y: "100vh", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    };


    // TODO: Replace inline styles with classes adhering to design_guidelines.txt
    // TODO: Implement actual RadioButton/Checkbox components or styling for options based on design_guidelines.txt
    // TODO: Add ARIA attributes for accessibility (aria-labelledby, aria-describedby, etc.)
    // TODO: Focus management (trap focus within modal)

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="backdrop"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000, // design_guidelines.txt Section 6.4 Modals (z-index)
                    }}
                    aria-modal="true"
                    role="dialog"
                // aria-labelledby="product-modal-title"
                // aria-describedby="product-modal-description"
                >
                    <motion.div
                        key="modal"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                        style={{
                            background: 'white', // design_guidelines.txt Section 6.4 Modals (background)
                            padding: '24px', // design_guidelines.txt Section 6.4 Modals (padding)
                            borderRadius: '8px', // design_guidelines.txt Section 6.4 Modals (radii)
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', // design_guidelines.txt Section 6.4 Modals (shadows)
                            width: '90%',
                            maxWidth: '600px', // design_guidelines.txt Section 6.4 Modals (max-width)
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            position: 'relative', // For close button positioning
                        }}
                    // id="product-modal-content"
                    >
                        <button
                            onClick={onClose}
                            aria-label="Close product details"
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer'
                                // Styling from design_guidelines.txt for close button
                            }}
                        >
                            × {/* Replace with actual icon from design_guidelines.txt */}
                        </button>

                        {/* Product Image */}
                        {product.image_url && (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                style={{
                                    width: '100%',
                                    maxHeight: '200px', // Or as per design guidelines
                                    objectFit: 'cover',
                                    borderRadius: '4px', // design_guidelines.txt
                                    marginBottom: '16px'
                                }}
                            />
                        )}

                        {/* Product Information */}
                        {/* <h2 id="product-modal-title" style={{ marginTop: 0 }}>{product.name}</h2> */}
                        <h2 style={{ marginTop: 0 /* design_guidelines.txt for typography */ }}>{product.name}</h2>
                        {product.subtitle && <p style={{ color: '#555' /* design_guidelines.txt for typography */ }}>{product.subtitle}</p>}
                        {/* <p id="product-modal-description">{product.description}</p> */}
                        <p>{product.description}</p>

                        {/* Attribute Groups & Options */}
                        {sortedAttributeGroups.length > 0 && (
                            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                                <h3>Options</h3>
                                {sortedAttributeGroups.map(group => (
                                    <fieldset key={group.id} style={{ marginBottom: '16px', border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
                                        <legend style={{ fontWeight: 'bold' /* design_guidelines.txt */ }}>
                                            {group.name} {group.is_required && <span style={{ color: 'red' /* design_guidelines.txt for required indicator */ }}>*</span>}
                                        </legend>
                                        {group.options?.sort((a, b) => a.display_order - b.display_order).map(option => (
                                            <div key={option.id} style={{ marginBottom: '8px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                                    <input
                                                        type={group.type === 'SINGLE_SELECT' ? 'radio' : 'checkbox'}
                                                        name={`group-${group.id}`}
                                                        value={option.id}
                                                        checked={
                                                            group.type === 'SINGLE_SELECT'
                                                                ? selectedOptionsMap[group.id] === option.id
                                                                : (selectedOptionsMap[group.id] || []).includes(option.id)
                                                        }
                                                        onChange={() => handleOptionChange(group.id, option.id, group.type)}
                                                    // Style input with design_guidelines.txt (6.9 Toggles & Checkboxes)
                                                    />
                                                    <span style={{ marginLeft: '8px' }}>{option.name}</span>
                                                    {option.price_adjustment !== 0 && (
                                                        <span style={{ marginLeft: 'auto', color: option.price_adjustment > 0 ? 'green' : 'red' /* design_guidelines.txt */ }}>
                                                            {option.price_adjustment > 0 ? '+' : ''}
                                                            {`$${(option.price_adjustment / 100).toFixed(2)}`} {/* Assuming price is in cents */}
                                                        </span>
                                                    )}
                                                </label>
                                            </div>
                                        ))}
                                        {validationErrors[group.id] && <p style={{ color: 'red', fontSize: '0.875em', marginTop: '4px' }}>{validationErrors[group.id]}</p>}
                                    </fieldset>
                                ))}
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <span style={{ fontWeight: 'bold' /* design_guidelines.txt */ }}>Quantity:</span>
                            <NumberStepperfix value={quantity} onChange={setQuantity} minValue={1} />
                        </div>

                        {/* Dynamic Price Display */}
                        <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                            <p>
                                Item Price:
                                <span style={{ fontWeight: 'bold' /* design_guidelines.txt */ }}>
                                    ${(currentItemPriceWithOptionsMenu / 100).toFixed(2)} {/* Assuming price is in cents */}
                                </span>
                            </p>
                            <p style={{ fontSize: '1.2em' /* design_guidelines.txt */ }}>
                                Total:
                                <span style={{ fontWeight: 'bold' /* design_guidelines.txt */ }}>
                                    ${(totalPriceForQuantity / 100).toFixed(2)} {/* Assuming price is in cents */}
                                </span>
                            </p>
                        </div>

                        {/* "Add to Order" Button */}
                        <button
                            onClick={handleConfirm}
                            style={{
                                width: '100%',
                                padding: '12px', // design_guidelines.txt for primary button
                                background: '#007bff', // design_guidelines.txt for primary button color
                                color: 'white', // design_guidelines.txt
                                border: 'none',
                                borderRadius: '4px', // design_guidelines.txt
                                fontSize: '1em', // design_guidelines.txt
                                cursor: 'pointer',
                                // Add disabled styles from design_guidelines.txt
                            }}
                        // disabled={Object.keys(validationErrors).some(key => validationErrors[key])} // Could refine this
                        >
                            Add {quantity} to Order - ${(totalPriceForQuantity / 100).toFixed(2)}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

ProductDetailModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    product: PropTypes.object, // Product can be null initially
    onConfirmWithOptions: PropTypes.func.isRequired,
};

export default React.memo(ProductDetailModal);