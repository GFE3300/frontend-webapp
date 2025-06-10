import React from 'react';
import Icon from '../../../components/common/Icon'; // Assuming common Icon component path
import { scriptLines_kitchenDisplaySystem } from '../utils/script_lines';
import i18n from '../../../i18n';

const sl = scriptLines_kitchenDisplaySystem.orderItemList;

const OrderItemList = ({ items }) => {
    if (!items || items.length === 0) {
        return <p className="text-xs text-neutral-500 dark:text-neutral-400">{/* No items message if needed */}</p>;
    }

    return (
        <div className="space-y-2">
            {items.map((item, index) => (
                <div key={item.id || index} className="flex justify-between items-start text-sm">
                    <div>
                        <span className="font-medium text-neutral-700 dark:text-neutral-200">{item.name}</span>
                        {item.notes && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 pl-1 flex items-start">
                                <span>{item.notes}</span>
                            </p>
                        )}
                    </div>
                    <span className="font-semibold text-neutral-700 dark:text-neutral-200 whitespace-nowrap pl-2">
                        {sl.itemQuantity ? i18n.t(sl.itemQuantity, { quantity: item.quantity }) : `x${item.quantity}`}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default OrderItemList;