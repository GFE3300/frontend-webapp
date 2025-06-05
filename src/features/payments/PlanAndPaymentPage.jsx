// frontend/src/features/payments/PlanAndPaymentPage.jsx
import React, { useState, useCallback } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import PlanSelection from './subcomponents/PlanSelection.jsx';
import Spinner from '../../components/common/Spinner'; // Assuming Spinner component path
// import Icon from '../../components/common/Icon'; // Not explicitly used in this main page, but good to have if needed

const PlanAndPaymentPage = () => {
    const stripe = useStripe();
    const { addToast } = useToast();
    const { user, isAuthenticated } = useAuth();

    const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
    const [error, setError] = useState(null);

    const handlePlanSelected = useCallback(async (selectedPlanFromComponent) => {
        if (!isAuthenticated) {
            addToast('Please log in to select a plan.', 'error');
            // Consider redirecting to login if PrivateRoute somehow fails:
            // navigate('/login'); 
            return;
        }

        if (!stripe) {
            addToast('Stripe is not ready. Please try again in a moment.', 'error');
            console.error('[PlanAndPaymentPage] Stripe.js has not loaded yet.');
            return;
        }

        const planIdentifier = selectedPlanFromComponent.id; // e.g., 'starter_essentials'

        setIsProcessingCheckout(true);
        setError(null);

        try {
            // Stripe will replace {CHECKOUT_SESSION_ID} in the success_url upon successful payment.
            const successUrl = `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
            // The cancel_url is where the user is redirected if they cancel the Stripe Checkout process.
            const cancelUrl = `${window.location.origin}/plans`; // Or current page path for retry

            const payload = {
                plan_name: planIdentifier,
                success_url: successUrl,
                cancel_url: cancelUrl,
            };

            if (user?.email) {
                payload.customer_email = user.email;
            }

            console.log('[PlanAndPaymentPage] Creating checkout session with payload:', payload);
            const response = await apiService.createCheckoutSession(payload); // Using the new method in apiService

            const sessionId = response.data?.sessionId;

            if (!sessionId) {
                console.error('[PlanAndPaymentPage] Session ID not received from backend. Response data:', response.data);
                throw new Error("Failed to initialize payment session. Please try again or contact support.");
            }

            console.log('[PlanAndPaymentPage] Redirecting to Stripe Checkout with session ID:', sessionId);
            const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

            if (stripeError) {
                console.error('[PlanAndPaymentPage] Stripe redirectToCheckout error:', stripeError);
                setError(stripeError.message);
                addToast(`Payment error: ${stripeError.message}`, 'error');
                setIsProcessingCheckout(false);
            }
            // If redirectToCheckout is successful, the user is navigated away.
        } catch (apiError) {
            console.error('[PlanAndPaymentPage] API error during checkout session creation:', apiError.response?.data || apiError.message, apiError);
            const errorMessage =
                apiError.response?.data?.detail ||
                apiError.response?.data?.error ||
                apiError.message ||
                'Could not initiate your subscription. Please try again or contact support.';
            setError(errorMessage);
            addToast(errorMessage, 'error', 5000); // Longer duration for important errors
            setIsProcessingCheckout(false);
        }
    }, [stripe, addToast, isAuthenticated, user]);

    return (
        <div className="flex flex-col items-center justify-start min-h-screen py-12 px-4 bg-gray-50 dark:bg-neutral-900 font-montserrat">
            <header className="text-center mb-10 mt-8 sm:mt-12">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
                    Choose Your Plan
                </h1>
                <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Select the perfect plan to power up your business. Manage your subscription and unlock premium features.
                </p>
            </header>

            {isProcessingCheckout && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50 transition-opacity duration-300">
                    <Spinner size="lg" color="text-white" />
                    <p className="mt-4 text-white text-xl font-semibold">Processing your selection...</p>
                    <p className="mt-2 text-gray-200 text-sm">Redirecting to secure payment.</p>
                </div>
            )}

            {error && (
                <div
                    className="my-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200 rounded-md shadow-md max-w-xl w-full mx-auto text-left"
                    role="alert"
                >
                    <div className="flex">
                        {/* Optional: Add an error icon here if Icon component is imported and ready */}
                        {/* <Icon name="error_outline" className="w-6 h-6 mr-3 text-red-500 dark:text-red-400" /> */}
                        <div>
                            <h3 className="font-bold mb-1 text-red-800 dark:text-red-100">Payment Initialization Failed</h3>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-7xl mx-auto"> {/* Ensures PlanSelection uses the available width */}
                <PlanSelection
                    onPlanSelect={handlePlanSelected}
                    isLoading={isProcessingCheckout}
                // themeColor="rose" // Example, or let PlanSelection use its default
                />
            </div>

            <footer className="mt-16 mb-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>You will be redirected to Stripe to complete your payment securely.</p>
                <p className="mt-1">
                    Need help or have questions about billing?{' '}
                    <a
                        href="/contact-support" // Placeholder, or use a mailto: link
                        className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        Contact Support
                    </a>
                </p>
            </footer>
        </div>
    );
};

export default PlanAndPaymentPage;