import React, { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';

/**
 * CartContext provides state and actions for the shopping cart and wishlist.
 * Wrap your application root with <CartProvider> to enable cart functionality.
 */
export const CartContext = createContext();

// Initial state for cart and wishlist
const initialState = {
    items: [],        // Array of { id, name, price, qty, ... }
    wishlist: [],     // Array of product objects
    isOpen: false,    // Cart drawer open/closed
};

// Reducer handling cart and wishlist actions
export const defaultReducer = (state, action) => {
    switch (action.type) {
        case 'OPEN_CART':
            return { ...state, isOpen: true };
        case 'CLOSE_CART':
            return { ...state, isOpen: false };
        case 'ADD_ITEM': {
            const { product } = action.payload;
            const existing = state.items.find(item => item.id === product.id);
            const items = existing
                ? state.items.map(item =>
                    item.id === product.id ? { ...item, qty: item.qty + 1 } : item
                )
                : [...state.items, { ...product, qty: 1 }];
            return { ...state, items };
        }
        case 'REMOVE_ITEM': {
            const items = state.items.filter(item => item.id !== action.payload.id);
            return { ...state, items };
        }
        case 'UPDATE_ITEM_QTY': {
            const { id, qty } = action.payload;
            const items = state.items.map(item =>
                item.id === id ? { ...item, qty } : item
            );
            return { ...state, items };
        }
        case 'TOGGLE_WISHLIST': {
            const { product } = action.payload;
            const exists = state.wishlist.find(item => item.id === product.id);
            const wishlist = exists
                ? state.wishlist.filter(item => item.id !== product.id)
                : [...state.wishlist, product];
            return { ...state, wishlist };
        }
        default:
            return state;
    }
};

/**
 * CartProvider wraps children with CartContext and manages cart state.
 */
export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(defaultReducer, initialState);

    // Action dispatchers
    const openCart = () => dispatch({ type: 'OPEN_CART' });
    const closeCart = () => dispatch({ type: 'CLOSE_CART' });
    const addItem = product => dispatch({ type: 'ADD_ITEM', payload: { product } });
    const removeItem = id => dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    const updateItemQty = (id, qty) =>
        dispatch({ type: 'UPDATE_ITEM_QTY', payload: { id, qty } });
    const toggleWishlist = product =>
        dispatch({ type: 'TOGGLE_WISHLIST', payload: { product } });

    // Derived state
    const totalItems = state.items.reduce((sum, item) => sum + item.qty, 0);

    return (
        <CartContext.Provider
            value={{
                isOpen: state.isOpen,
                items: state.items,
                wishlist: state.wishlist,
                totalItems,
                openCart,
                closeCart,
                addItem,
                removeItem,
                updateItemQty,
                toggleWishlist,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

CartProvider.propTypes = {
    children: PropTypes.node.isRequired,
};