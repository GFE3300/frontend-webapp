// src/features/kitchen_display_system/components/OrderItemList.jsx
import React from 'react';
import { scriptLines_kitchenDisplaySystem } from '../utils/script_lines';
import i18n from '../../../i18n';

const sl = scriptLines_kitchenDisplaySystem.orderItemList;
const slModal = scriptLines_kitchenDisplaySystem.modal;

// NEW: Sub-component for rendering selected options neatly
const OptionDetail = ({ option }) => (
    <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400 pl-4">
        <span>+ {option.option_name}</span>
        {option.price_adjustment && parseFloat(option.price_adjustment) !== 0 && (
            <span>
                ({parseFloat(option.price_adjustment) > 0 ? '+' : ''}
                {i18n.t(slModal.price, { val: parseFloat(option.price_adjustment).toFixed(2) })})
            </span>
        )}
    </div>
);

const OrderItemList = ({ items, isDetailed = false }) => {
    if (!items || items.length === 0) {
        return <p className="text-xs text-neutral-500 dark:text-neutral-400">{/* No items message */}</p>;
    }

    const itemsToShow = isDetailed ? items : items.slice(0, 3);
    const remainingItems = items.length - itemsToShow.length;

    return (
        <div className="space-y-3">
            {itemsToShow.map((item) => (
                <div key={item.id}>
                    <div className="flex justify-between items-start text-sm">
                        <div className="font-medium text-neutral-800 dark:text-neutral-100">
                            <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full mr-2 ${isDetailed ? 'bg-rose-100 dark:bg-rose-800 text-rose-600 dark:text-rose-200' : ''}`}>
                                {item.quantity}
                            </span>
                            {item.product_name_snapshot}
                        </div>
                    </div>
                    {isDetailed && item.selected_options_snapshot?.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                            {item.selected_options_snapshot.map((opt, i) => <OptionDetail key={i} option={opt} />)}
                        </div>
                    )}
                </div>
            ))}
            {!isDetailed && remainingItems > 0 && (
                <div className="text-xs text-center font-medium text-neutral-500 dark:text-neutral-400 pt-1">
                    {i18n.t(sl.moreItems, { count: remainingItems })}
                </div>
            )}
        </div>
    );
};

export default OrderItemList;