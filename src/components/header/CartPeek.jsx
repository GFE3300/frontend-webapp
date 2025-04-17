import React from 'react';
import useCart from '../../hooks/useCart';
import Icon from '../common/Icon';

const CartPeek = () => {
    const { totalItems, openCart } = useCart();

    return (
        <button
            onClick={openCart}
            className="fixed bottom-4 right-4 bg-[var(--color-chocolate)] text-white px-5 py-3 rounded-full shadow-xl z-50 hover:scale-105 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]"
            aria-label={`Open cart, ${totalItems} items`}
        >
            <Icon name="shopping_cart" className="w-5 h-5 mr-2" />
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </button>
    );
};

export default CartPeek;
