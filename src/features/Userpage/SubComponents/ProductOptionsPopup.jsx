import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../components/common/Icon';
import NumberStepperfix from '../../components/common/NumberStepper';

function ProductOptionsPopup({ isOpen, onClose, item, onConfirmWithOptions }) {
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedExtras, setSelectedExtras] = useState([]);

    useEffect(() => {
        if (item) {
            setQuantity(1);
            setSelectedSize(item.availableSizes?.[0]?.name || null);
            setSelectedExtras([]);
        } else {
            setQuantity(1);
            setSelectedSize(null);
            setSelectedExtras([]);
        }
    }, [item]);

    if (!item) return null;

    const handleExtraChange = (extraId) => {
        setSelectedExtras(prev =>
            prev.includes(extraId) ? prev.filter(id => id !== extraId) : [...prev, extraId]
        );
    };

    const getSelectedSizeData = () => {
        if (!selectedSize || !item.availableSizes) return null;
        return item.availableSizes.find(s => s.name === selectedSize);
    };

    const getSelectedSizePriceModifier = () => {
        const sizeData = getSelectedSizeData();
        return sizeData?.priceModifier || 0;
    };

    const getSelectedExtrasDetails = () => {
        if (!item.availableExtras) return [];
        return selectedExtras.map(extraId => item.availableExtras.find(e => e.id === extraId)).filter(Boolean);
    };

    const getSelectedExtrasTotalPrice = () => {
        if (!item.availableExtras) return 0;
        return selectedExtras.reduce((total, extraId) => {
            const extraOption = item.availableExtras.find(e => e.id === extraId);
            return total + (extraOption?.price || 0);
        }, 0);
    };

    const currentItemPriceWithOptionsMenu = item.price + getSelectedSizePriceModifier() + getSelectedExtrasTotalPrice();
    const totalPriceForQuantity = currentItemPriceWithOptionsMenu * quantity;

    const handleConfirm = () => {
        const optionsPayload = {
            quantity,
            selectedSize: getSelectedSizeData() ? { name: selectedSize, priceModifier: getSelectedSizePriceModifier() } : null,
            selectedExtras: getSelectedExtrasDetails().map(e => ({ id: e.id, name: e.name, price: e.price })),
            finalPricePerItem: currentItemPriceWithOptionsMenu,
            totalPriceForQuantity: totalPriceForQuantity,
        };

        const itemWithOriginalDetails = { ...item };
        onConfirmWithOptions(itemWithOriginalDetails, optionsPayload);
        onClose();
    };

    const popupWidth = "w-[90vw] max-w-md";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 z-40 bg-neutral-500/30 dark:bg-neutral-900/30 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    <motion.div
                        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${popupWidth} bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden`}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="product-options-title"
                    >
                        <div className="flex flex-col h-full max-h-[85vh]">
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                                <h2 id="product-options-title" className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">{item.name}</h2>
                                {item.description && <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{item.description}</p>}
                            </div>

                            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                                {item.availableSizes && item.availableSizes.length > 0 && (
                                    <div>
                                        <h3 className="text-md font-medium text-neutral-700 dark:text-neutral-300 mb-2">Size</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {item.availableSizes.map(sizeOpt => (
                                                <button
                                                    key={sizeOpt.name}
                                                    onClick={() => setSelectedSize(sizeOpt.name)}
                                                    className={`px-3 py-1.5 rounded-md text-sm border transition-all
                                                        ${selectedSize === sizeOpt.name
                                                            ? 'bg-red-500 text-white border-red-500 ring-2 ring-red-300'
                                                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                                                        }`}
                                                >
                                                    {sizeOpt.name} {sizeOpt.priceModifier !== 0 ? `(${sizeOpt.priceModifier > 0 ? '+' : ''}$${sizeOpt.priceModifier.toFixed(2)})` : ''}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {item.availableExtras && item.availableExtras.length > 0 && (
                                    <div>
                                        <h3 className="text-md font-medium text-neutral-700 dark:text-neutral-300 mb-2">Extras</h3>
                                        <div className="space-y-1">
                                            {item.availableExtras.map(extraOpt => (
                                                <label key={extraOpt.id} className="flex items-center p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedExtras.includes(extraOpt.id)}
                                                        onChange={() => handleExtraChange(extraOpt.id)}
                                                        className="h-4 w-4 text-red-600 border-neutral-300 dark:border-neutral-500 rounded focus:ring-red-500 bg-white dark:bg-neutral-600 checked:bg-red-600"
                                                    />
                                                    <span className="ml-3 text-sm text-neutral-700 dark:text-neutral-300">{extraOpt.name}</span>
                                                    {extraOpt.price > 0 && (
                                                        <span className="ml-auto text-sm text-neutral-500 dark:text-neutral-400">+${extraOpt.price.toFixed(2)}</span>
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                     <h3 className="text-md font-medium text-neutral-700 dark:text-neutral-300 mb-2">Quantity</h3>
                                     <NumberStepperfix
                                        label=""
                                        min={1}
                                        max={20}
                                        value={quantity}
                                        onChange={setQuantity}
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Total:</span>
                                    <span className="text-xl font-bold text-red-600 dark:text-red-400">${totalPriceForQuantity.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={handleConfirm}
                                    className="w-full bg-red-600 hover:bg-red-700 dark:hover:bg-red-500 text-white font-semibold py-3 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 dark:focus:ring-red-500 focus:ring-opacity-75"
                                >
                                    Add to Order ({quantity})
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default ProductOptionsPopup;