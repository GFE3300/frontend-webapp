import React, { useState, useRef, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';

const ActionsMenu = memo(({ productId, onAction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    const actions = [
        { label: 'Edit', icon: 'edit', action: 'edit' },
        { label: 'Duplicate', icon: 'content_copy', action: 'duplicate' },
        { label: 'Archive', icon: 'archive', action: 'archive', color: 'text-yellow-600 dark:text-yellow-400' },
        { label: 'Delete', icon: 'delete', action: 'delete', color: 'text-red-600 dark:text-red-400' },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleActionClick = (actionType) => {
        onAction(actionType, productId);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="p-1.5 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="Product actions"
            >
                <Icon name="more_horiz" className="w-5 h-5" />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="origin-top-right absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black dark:ring-neutral-700 ring-opacity-5 focus:outline-none z-20 py-1"
                        role="menu"
                    >
                        {actions.map(action => (
                            <button
                                key={action.action}
                                onClick={() => handleActionClick(action.action)}
                                className={`w-full text-left flex items-center px-4 py-2 text-sm 
                                            ${action.color || 'text-neutral-700 dark:text-neutral-200'} 
                                            hover:bg-neutral-100 dark:hover:bg-neutral-700 
                                            hover:${action.color ? action.color.replace('text-', 'bg-').replace('-600', '-50').replace('-400', '-900/30') : ''}
                                            transition-colors`}
                                role="menuitem"
                            >
                                <Icon name={action.icon} className={`w-4 h-4 mr-3 ${action.color || ''}`} />
                                {action.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

ActionsMenu.propTypes = {
    productId: PropTypes.string.isRequired,
    onAction: PropTypes.func.isRequired,
};

export default ActionsMenu;