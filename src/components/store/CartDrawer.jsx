import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useRef } from 'react';
import { FocusTrap } from 'focus-trap-react';
import useCart from '../../hooks/useCart';
import CartItem from './CartItem';
import Icon from '../common/Icon';
import SurpriseButton from './SurpriseButton';
import useSwipe from '../../hooks/useSwipe';

// Animation constants
const drawerAnimations = {
  mobile: {
    initial: { y: '100%' },
    peek: { y: '20%' },
    expanded: { y: 0 },
    exit: { y: '100%' }
  },
  desktop: {
    initial: { x: '100%' },
    expanded: { x: 0 },
    exit: { x: '100%' }
  }
};

const backdropAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const CartDrawer = () => {
    const { isOpen, isExpanded, closeCart, collapseCart, items, totalItems } = useCart();
    const drawerRef = useRef(null);
    const closeBtnRef = useRef(null);
    const lastItemRef = useRef(null);
    const isMobile = window.innerWidth <= 640;

    // Swipe handling with animation integration
    useSwipe(drawerRef, {
        onSwipeUp: () => isOpen && !isExpanded && collapseCart(),
        onSwipeDown: () => {
            if (isExpanded) collapseCart();
            else closeCart();
        },
        threshold: 60,
        directionLock: 25
    });

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        const handleKeyDown = (e) => e.key === 'Escape' && closeCart();
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, closeCart]);

    useEffect(() => {
        if (items.length > 0 && lastItemRef.current) {
            lastItemRef.current.focus();
        }
    }, [items]);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <FocusTrap
                    active={isOpen}
                    focusTrapOptions={{
                        initialFocus: () => closeBtnRef.current,
                        escapeDeactivates: true,
                        allowOutsideClick: true,
                        clickOutsideDeactivates: true
                    }}
                >
                    <div className="fixed inset-0 z-50 flex flex-col items-end sm:items-stretch" aria-hidden={!isOpen}>
                        {/* Animated Backdrop */}
                        <motion.div
                            key="backdrop"
                            {...backdropAnimation}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-black/50"
                            onClick={closeCart}
                            role="presentation"
                        />

                        {/* Drawer Container */}
                        <motion.aside
                            key="drawer"
                            ref={drawerRef}
                            initial={isMobile ? drawerAnimations.mobile.initial : drawerAnimations.desktop.initial}
                            animate={
                                isMobile 
                                ? (isExpanded ? drawerAnimations.mobile.expanded : drawerAnimations.mobile.peek)
                                : drawerAnimations.desktop.expanded
                            }
                            exit={isMobile ? drawerAnimations.mobile.exit : drawerAnimations.desktop.exit}
                            transition={{
                                type: 'spring',
                                damping: 25,
                                stiffness: 200
                            }}
                            className={`
                                relative sm:ml-auto w-full sm:max-w-md bg-[var(--color-cream)] shadow-2xl
                                flex flex-col h-[95vh] sm:h-screen
                                backdrop-blur-sm bg-opacity-95
                            `}
                            role="dialog"
                        >
                            {/* Header with Sticky Gradient */}
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="sticky top-0 z-10 flex items-center justify-between p-6 bg-gradient-to-b from-[var(--color-cream)] to-[var(--color-cream)/90%] border-b border-[var(--color-blush)]"
                            >
                                <h2 className="text-2xl font-bold font-playfair text-[var(--color-chocolate)]">
                                    Your Cart 🧺 <span className="text-lg">({totalItems})</span>
                                </h2>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={closeCart}
                                    ref={closeBtnRef}
                                    className="p-2 -mr-2 text-[var(--color-chocolate)] hover:bg-[var(--color-blush)] rounded-full"
                                    aria-label="Close cart"
                                >
                                    <Icon name="close" className="w-8 h-8" />
                                </motion.button>
                            </motion.div>

                            {/* Scrollable Items Area */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 space-y-4"
                            >
                                {items.length > 0 ? (
                                    items.map((item, index) => (
                                        <CartItem
                                            key={item.id}
                                            item={item}
                                            ref={index === items.length - 1 ? lastItemRef : null}
                                        />
                                    ))
                                ) : (
                                    <motion.div 
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="flex flex-col items-center justify-center h-full py-12"
                                    >
                                        <p className="text-center text-lg text-[var(--color-charcoal)] opacity-80">
                                            Your cart feels lonely... Let's fill it up!
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Sticky Footer */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="sticky bottom-0 bg-[var(--color-cream)] border-t border-[var(--color-blush)] px-6 py-4"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg text-[var(--color-charcoal)]">Subtotal:</span>
                                    <motion.span
                                        key={subtotal}
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        className="text-2xl font-bold text-[var(--color-caramel)]"
                                    >
                                        ${subtotal.toFixed(2)}
                                    </motion.span>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full bg-gradient-to-r from-[var(--color-caramel)] to-[var(--color-chocolate)] text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50"
                                    onClick={() => console.log('Proceed to checkout')}
                                    disabled={items.length === 0}
                                >
                                    Checkout Now 🚀
                                </motion.button>

                                <SurpriseButton className="mt-3" />
                            </motion.div>
                        </motion.aside>
                    </div>
                </FocusTrap>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;