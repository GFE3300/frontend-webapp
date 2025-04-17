import React from 'react';
import useCart from '../../hooks/useCart';

const CartPeek = ({ onExpand }) => {
    const { totalItems } = useCart();

    return (
        <button
            onClick={onExpand}
            className="fixed bottom-4 right-4 bg-[var(--color-chocolate)] text-white px-6 py-3 rounded-full shadow-xl z-50 hover:scale-105 active:scale-95 transition"
            aria-label="Expand cart drawer"
        >
            🛒 {totalItems} items
        </button>
    );
};

export default CartPeek;