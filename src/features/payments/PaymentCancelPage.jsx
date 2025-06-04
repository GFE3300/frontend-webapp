// frontend/src/features/payments/PaymentCancelPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon'; // Assuming Icon component path
import Button from '../../components/common/Button'; // Assuming Button component path

const PaymentCancelPage = () => {
    const navigate = useNavigate();

    const handleTryAgain = () => {
        navigate('/plans');
    };

    const handleContactSupport = () => {
        // For now, navigate to a placeholder or log. 
        // Replace with actual contact page navigation or modal.
        console.log('Contact support clicked.');
        navigate('/contact-support'); // Example route
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-gray-50 dark:bg-neutral-900 font-montserrat text-center">
            <div className="bg-white dark:bg-neutral-800 p-8 sm:p-12 rounded-xl shadow-2xl max-w-lg w-full">
                <Icon
                    name="warning" // Or "error_outline", "cancel" depending on available icons and desired visual
                    className="w-20 h-20 text-yellow-500 dark:text-yellow-400 mx-auto mb-6"
                    variations={{ weight: 500 }}
                />

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                    Payment Not Completed
                </h1>

                <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                    It looks like the payment process was not completed, or you chose to cancel.
                    Your subscription has not been activated.
                </p>

                <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-col sm:items-center sm:space-y-4 lg:flex-row lg:justify-center lg:space-y-0 lg:space-x-4">
                    <Button
                        onClick={handleTryAgain}
                        variant="solid"
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-lg py-3 px-8 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                        Try Again
                    </Button>
                    <Button
                        onClick={handleContactSupport}
                        variant="outline"
                        className="w-full sm:w-auto text-indigo-600 border-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-neutral-700 text-lg py-3 px-8 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
                    >
                        Contact Support
                    </Button>
                </div>

                <p className="mt-10 text-xs text-gray-400 dark:text-gray-500">
                    If you believe this is an error or need assistance, please don't hesitate to reach out.
                </p>
            </div>
        </div>
    );
};

export default PaymentCancelPage;