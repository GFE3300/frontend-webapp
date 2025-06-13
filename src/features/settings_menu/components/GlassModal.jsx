import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/common/Icon';

/**
 * A bespoke "glassmorphism" modal component designed for the settings pages.
 * It provides a blurred backdrop and an animated panel with the correct styling.
 */
const GlassModal = ({ isOpen, onClose, children }) => {
    const modalRef = useRef(null);

    // Handle closing the modal on 'Escape' key press
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    aria-labelledby="modal-title"
                    role="dialog"
                    aria-modal="true"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Panel */}
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                        className="relative mx-4 w-full max-w-lg bg-gradient-to-br from-white/10 to-white/0 dark:bg-neutral-800/50 backdrop-blur-xl border border-white/20 dark:border-neutral-700 shadow-2xl rounded-4xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            aria-label="Close"
                        >
                            <Icon name="close" />
                        </button>
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

GlassModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

export default GlassModal;