import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import useCart from '../../hooks/useCart';

const MegaMenu = ({ id, open, categories }) => {
    const { addItem } = useCart();
    const menuRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (open && menuRef.current && !menuRef.current.contains(e.target)) {
                // parent onBlur will close
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    id={id}
                    ref={menuRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-2 w-screen max-w-2xl bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 z-50"
                    role="menu"
                    aria-label="Product Categories"
                >
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex flex-col items-center text-center space-y-2">
                            <img
                                src={cat.image}
                                alt={cat.title}
                                className="w-20 h-20 object-cover rounded-lg"
                            />
                            <span className="font-medium text-[var(--color-chocolate)]">{cat.title}</span>
                            <button
                                onClick={() => addItem({ id: cat.id, name: cat.title, price: cat.items?.[0]?.price || 0, image: cat.image })}
                                className="mt-2 text-sm font-medium bg-[var(--color-caramel)] text-white px-3 py-1 rounded-full hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] transition"
                                aria-label={`Quick add ${cat.title}`}
                            >
                                Quick Add
                            </button>
                        </div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

MegaMenu.propTypes = {
    id: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    categories: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            image: PropTypes.string.isRequired,
            items: PropTypes.array,
        })
    ).isRequired,
};

export default MegaMenu;
