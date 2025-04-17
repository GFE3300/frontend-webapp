import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

/**
 * Custom hook to access cart context. Must be used within CartProvider.
 */

const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default useCart;
