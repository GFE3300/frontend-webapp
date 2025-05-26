// src/components/animatedAlerts/Modal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../common/Icon'; // Assuming Icon is in src/components/common/Icon.jsx

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2, delay: 0.1 } },
};

const modalVariants = {
    hidden: { opacity: 0, y: -30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 25, delay: 0.1 },
    },
    exit: {
        opacity: 0,
        y: 30,
        scale: 0.95,
        transition: { duration: 0.15 },
    },
};

function Modal({
    isOpen,
    onClose,
    title,
    children,
    type = 'info',
    onConfirm,
    confirmText = "Confirm",
    cancelText = "Cancel"
}) {
    // Guard against SSR issues if isOpen is true on initial server render
    // For client-side only, this check might be simplified or removed if isOpen is always controlled
    if (!isOpen && typeof window === 'undefined') return null;

    let iconName = 'info';
    let iconBgColor = 'bg-blue-100';
    let iconTextColor = 'text-blue-600';
    // For OK or Confirm button, base styles vary by type
    let confirmButtonBaseClass = 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';

    // Cancel button will have a consistent neutral style
    const cancelButtonClasses = "w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:text-sm";


    switch (type) {
        case 'success':
            iconName = 'check_circle';
            iconBgColor = 'bg-green-100';
            iconTextColor = 'text-green-600';
            confirmButtonBaseClass = 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
            break;
        case 'error':
            iconName = 'error';
            iconBgColor = 'bg-red-100';
            iconTextColor = 'text-red-600';
            confirmButtonBaseClass = 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
            break;
        case 'warning':
            iconName = 'warning';
            iconBgColor = 'bg-yellow-100';
            iconTextColor = 'text-yellow-600';
            confirmButtonBaseClass = 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400';
            break;
        // default is 'info', already set
        default:
            iconName = 'info';
            iconBgColor = 'bg-blue-100';
            iconTextColor = 'text-blue-600';
            confirmButtonBaseClass = 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
            break;
    }

    const confirmButtonClasses = `w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:text-sm ${confirmButtonBaseClass}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-neutral-600/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" // Ensure backdrop-blur-sm or similar is applied if desired
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={onClose} // Click on backdrop to close
                >
                    <motion.div
                        className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden"
                        variants={modalVariants}
                        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
                    >
                        <div className="p-5 sm:p-6">
                            <div className="flex items-start">
                                <div className={`mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${iconBgColor} sm:h-10 sm:w-10`}>
                                    <Icon name={iconName} className={`h-6 w-6 ${iconTextColor}`} aria-hidden="true" />
                                </div>
                                <div className="mt-0 flex-grow"> {/* Adjusted mt-0 for better alignment with icon */}
                                    {title && <h3 className="text-lg leading-6 font-semibold text-gray-900" id="modal-title">{title}</h3>}
                                    <div className="mt-2">
                                        <div className="text-sm text-gray-600">
                                            {children}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3 sm:px-6 flex flex-row-reverse">
                            {onConfirm ? (
                                <>
                                    <button
                                        type="button"
                                        className={confirmButtonClasses}
                                        onClick={() => {
                                            onConfirm();
                                            // Optional: onClose(); // Decide if onConfirm should also close, or if parent manages it
                                        }}
                                    >
                                        {confirmText}
                                    </button>
                                    <button
                                        type="button"
                                        className={cancelButtonClasses}
                                        onClick={onClose}
                                    >
                                        {cancelText}
                                    </button>
                                </>
                            ) : (
                                // If no onConfirm, show a single "OK" button styled like a confirm button
                                <button
                                    type="button"
                                    className={confirmButtonClasses} // Uses confirm styles for the single OK button
                                    onClick={onClose}
                                >
                                    OK
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default Modal;