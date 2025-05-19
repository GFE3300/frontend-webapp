import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/common/Icon';
// For inline editing, you'd use InputField or custom inputs

const PriceCostMarginCell = memo(({ price, cost, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editPrice, setEditPrice] = useState(price);
    const [editCost, setEditCost] = useState(cost);

    useEffect(() => {
        setEditPrice(price);
        setEditCost(cost);
    }, [price, cost]);

    const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
    let marginColorClass = 'text-neutral-500 dark:text-neutral-400';
    if (margin >= 50) marginColorClass = 'text-green-600 dark:text-green-400';
    else if (margin >= 20) marginColorClass = 'text-yellow-600 dark:text-yellow-400';
    else if (margin > 0) marginColorClass = 'text-orange-600 dark:text-orange-400';
    else if (margin < 0) marginColorClass = 'text-red-600 dark:text-red-400';

    const handleSave = () => {
        onSave(parseFloat(editPrice), parseFloat(editCost));
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="space-y-1 w-32">
                <div className="flex items-center">
                    <span className="text-xs w-10 text-neutral-500 dark:text-neutral-400">Price:</span>
                    <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full text-xs p-1 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 focus:ring-rose-500 focus:border-rose-500"
                        step="0.01"
                    />
                </div>
                <div className="flex items-center">
                    <span className="text-xs w-10 text-neutral-500 dark:text-neutral-400">Cost:</span>
                    <input
                        type="number"
                        value={editCost}
                        onChange={(e) => setEditCost(e.target.value)}
                        className="w-full text-xs p-1 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 focus:ring-rose-500 focus:border-rose-500"
                        step="0.01"
                    />
                </div>
                <div className="flex justify-end space-x-1 pt-1">
                    <button onClick={() => setIsEditing(false)} className="p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"><Icon name="close" className="w-4 h-4" /></button>
                    <button onClick={handleSave} className="p-1 text-green-500 hover:text-green-700"><Icon name="check" className="w-4 h-4" /></button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col cursor-pointer group"
            onClick={() => setIsEditing(true)}
            title="Click to edit price/cost"
        >
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                ${price.toFixed(2)}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-rose-500 dark:group-hover:text-rose-300">
                Cost: ${cost.toFixed(2)}
            </span>
            <span className={`text-xs font-medium ${marginColorClass} group-hover:opacity-80`}>
                Margin: {margin.toFixed(0)}%
            </span>
        </div>
    );
});

PriceCostMarginCell.propTypes = {
    price: PropTypes.number.isRequired,
    cost: PropTypes.number.isRequired,
    onSave: PropTypes.func.isRequired,
};

export default PriceCostMarginCell;