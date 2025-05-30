import React from 'react';
import { motion } from 'framer-motion';

function OrderItem({ item, onUpdateQuantity }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="flex items-start bg-red-700/50 p-3 rounded-lg"
        >
            <img
                src={item.imageUrl}
                alt={item.name}
                className="w-16 h-16 rounded-md object-cover mr-3 flex-shrink-0"
            />
            <div className="flex-grow">
                <h4 className="font-semibold text-sm leading-tight">{item.name}</h4>
                {(item.selectedSizeName || (item.selectedExtrasNames && item.selectedExtrasNames.length > 0)) && (
                    <div className="text-xs text-red-200 mt-0.5">
                        {item.selectedSizeName && (
                            <p>Size: {item.selectedSizeName}</p>
                        )}
                        {item.selectedExtrasNames && item.selectedExtrasNames.length > 0 && (
                            <p>Extras: {item.selectedExtrasNames.join(', ')}</p>
                        )}
                    </div>
                )}
                <p className="text-xs text-red-100 mt-1">${item.price.toFixed(2)} / unit</p>
            </div>
            <div className="flex flex-col items-end space-y-2 ml-2">
                <div className="flex items-center space-x-2 text-sm">
                    <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="bg-red-500 hover:bg-red-400 text-white w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                    >
                        -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="bg-red-500 hover:bg-red-400 text-white w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                    >
                        +
                    </button>
                </div>
                <p className="text-sm font-semibold text-white">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        </motion.div>
    );
}

export default OrderItem;