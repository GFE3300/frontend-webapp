import React from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon'; // Assuming Icon component is in this folder
import Spinner from './Spinner';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 font-montserrat flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={onClose} // Close on backdrop click
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20, transition: { duration: 0.2 } }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="bg-white/80 dark:bg-neutral-800/50 backdrop-blur rounded-3xl shadow-xl w-full max-w-md px-6 py-8 relative"
                        onClick={(e) => e.stopPropagation()} // Prevent close on modal content click
                    >
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="absolute w-7 h-7 top-3 right-3 p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-full transition-colors"
                            aria-label="Close modal"
                        >
                            <Icon name="close" className="w-5 h-5" style={{ fontSize: '1rem'}} />
                        </button>

                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
                            {title}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6">
                            {message}
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:opacity-50"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-50 flex items-center"
                            >
                                {isLoading && <Spinner size="xs" color="text-white" className="mr-2" />}
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    isLoading: PropTypes.bool,
};

export default ConfirmationModal;