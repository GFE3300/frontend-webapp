import React from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line
import { motion } from 'framer-motion'; // For subtle animations
import Icon from '../../components/common/Icon';
import Button from '../../components/common/Button';
import { scriptLines_Components as scriptLines } from './utils/script_lines';

const PaymentCancelPage = () => {
    const navigate = useNavigate();
    const cancelTexts = scriptLines.paymentCancelPage;

    const handleTryAgain = () => {
        navigate('/plans');
    };

    const handleContactSupport = () => {
        // For now, navigate to a placeholder. Replace with actual contact page or modal trigger.
        console.log('Contact support clicked from PaymentCancelPage.');
        navigate('/contact-support'); // Example route
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };
    const iconVariants = {
        hidden: { scale: 0.5, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 150, damping: 15, delay: 0.1 } },
    };

    return (
        // Consistent themed background - static gradient similar to BubbleAnimation's dark mode
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-gray-50 dark:bg-gradient-to-br dark:from-amber-950/30 dark:via-neutral-900 dark:to-neutral-900 font-montserrat text-center">
            <motion.div
                className="bg-white dark:bg-neutral-800 p-8 sm:p-12 rounded-xl shadow-2xl max-w-lg w-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={iconVariants}>
                    <Icon
                        name="warning_amber" // Using Material Symbols 'warning_amber' for a filled amber warning
                        className="w-20 h-20 sm:w-24 sm:h-24 text-amber-500 dark:text-amber-400 mx-auto mb-6"
                        variations={{ fill: 1, weight: 500 }} // Ensure icon is filled
                    />
                </motion.div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                    {cancelTexts.title}
                </h1>

                <p className="text-lg text-gray-700 dark:text-neutral-300 mb-8">
                    {cancelTexts.message}
                </p>

                <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-col sm:items-center sm:space-y-4 lg:flex-row lg:justify-center lg:space-y-0 lg:space-x-4">
                    <Button
                        onClick={handleTryAgain}
                        variant="solid"
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-lg py-3 px-8 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                        <Icon name="refresh" className="w-5 h-5 mr-2" />
                        {cancelTexts.buttons.tryAgain}
                    </Button>
                    <Button
                        onClick={handleContactSupport}
                        variant="outline"
                        className="w-full sm:w-auto text-indigo-600 border-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-neutral-700 text-lg py-3 px-8 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
                    >
                        <Icon name="support_agent" className="w-5 h-5 mr-2" />
                        {cancelTexts.buttons.contactSupport}
                    </Button>
                </div>

                <p className="mt-10 text-xs text-gray-500 dark:text-neutral-400">
                    {cancelTexts.footerNote}
                </p>
            </motion.div>
        </div>
    );
};

export default PaymentCancelPage;