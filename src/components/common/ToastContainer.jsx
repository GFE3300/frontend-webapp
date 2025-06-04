// frontend/src/components/common/ToastContainer.jsx
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext'; // Adjust path if necessary
import Toast from './Toast'; // Assuming Toast.jsx is in the same folder

// Styling Constants
const CONTAINER_POSITION_CLASSES = "fixed bottom-5 right-5 z-[9999]"; // Example: bottom-right. Adjust as needed.
const CONTAINER_SPACING = "space-y-3"; // Vertical spacing between toasts

const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    if (!toasts.length) {
        return null;
    }

    return (
        <div
            className={`${CONTAINER_POSITION_CLASSES} ${CONTAINER_SPACING} flex flex-col items-end`}
            aria-live="polite" // Announces when toasts are added/removed from the container
            aria-relevant="additions removals"
        >
            <AnimatePresence initial={false}>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        id={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration} // Pass duration for individual toast timer
                        onDismiss={removeToast} // Pass removeToast for manual dismissal
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;