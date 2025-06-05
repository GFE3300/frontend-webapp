import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useStripe } from '@stripe/react-stripe-js';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext'; // Import useSubscription
import { useToast } from '../../contexts/ToastContext';
import PlanSelection from './subcomponents/PlanSelection.jsx';
import Spinner from '../../components/common/Spinner';
import BubbleAnimation from '../../features/register/subcomponents/BubbleAnimation'; // Import BubbleAnimation
import { scriptLines_Components as scriptLines } from './utils/script_lines'; // Import scriptLines

const PlanAndPaymentPage = () => {
    const stripe = useStripe();
    const { addToast } = useToast();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate(); // Initialize useNavigate

    // Get subscription status from context
    const { subscription: currentSubscription, isLoading: isSubscriptionDataLoading } = useSubscription();

    const [isProcessingCheckout, setIsProcessingCheckout] = useState(false); // Renamed from isProcessingSelection
    const [error, setError] = useState(null);
    const vortexRef = useRef(null); // Ref for BubbleAnimation

    const handlePlanSelected = useCallback(async (selectedPlanFromComponent) => {
        if (!isAuthenticated) {
            addToast('Please log in to select a plan.', 'error');
            return;
        }
        if (!stripe) {
            addToast('Stripe is not ready. Please try again in a moment.', 'error');
            console.error('[PlanAndPaymentPage] Stripe.js has not loaded yet.');
            return;
        }

        // Prevent re-subscription to the exact same active plan
        if (currentSubscription && currentSubscription.is_active && currentSubscription.plan_name === selectedPlanFromComponent.id) {
            addToast(scriptLines.planSelection.messages.alreadySubscribedError, 'info');
            console.log("[PlanAndPaymentPage] User is already subscribed to this plan:", selectedPlanFromComponent.id);
            return;
        }

        const planIdentifier = selectedPlanFromComponent.id;

        setIsProcessingCheckout(true);
        setError(null);
        if (vortexRef.current) vortexRef.current.addTurbulence(15000); // Add turbulence on processing

        try {
            const successUrl = `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
            const cancelUrl = `${window.location.origin}/payment-cancel`;

            const payload = {
                plan_name: planIdentifier,
                // Backend settings.py should handle success_url and cancel_url
                // success_url: successUrl, 
                // cancel_url: cancelUrl,
            };

            if (user?.email) {
                payload.customer_email = user.email; // Backend can use this if no Stripe customer exists yet
            }

            console.log('[PlanAndPaymentPage] Creating checkout session with payload:', payload);
            const response = await apiService.createCheckoutSession(payload);

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
        } catch (apiError) {
            console.error('[PlanAndPaymentPage] API error during checkout session creation:', apiError.response?.data || apiError.message, apiError);
            const errorMessage =
                apiError.response?.data?.detail ||
                apiError.response?.data?.error ||
                apiError.message ||
                'Could not initiate your subscription. Please try again or contact support.';
            setError(errorMessage);
            addToast(errorMessage, 'error', 5000);
            setIsProcessingCheckout(false);
        }
    }, [stripe, addToast, isAuthenticated, user, currentSubscription, vortexRef]);

    const handleManageSubscription = useCallback((plan) => {
        // For now, navigate to the billing portal creation endpoint
        // This endpoint would then redirect to Stripe's customer portal
        console.log("[PlanAndPaymentPage] 'Manage Subscription' clicked for plan:", plan.name);
        addToast("Redirecting to subscription management...", "info");

        // Example: If you have a dedicated page for showing subscription details before portal
        // navigate(`/account/subscription-details`);

        // Direct to Stripe Customer Portal via backend
        // The actual implementation of this will be in a subsequent task involving the backend.
        // For now, we can simulate a redirect or point to a placeholder.
        apiService.post('payments/create-customer-portal-session/')
            .then(response => {
                if (response.data.url) {
                    window.location.href = response.data.url;
                } else {
                    addToast("Could not open subscription management portal. Please try again.", "error");
                }
            })
            .catch(err => {
                console.error("Error creating customer portal session:", err);
                addToast("Error accessing subscription management. Please try again.", "error");
            });

    }, [addToast, navigate]); // Add navigate if using it

    // Combined loading state: parent's checkout processing OR subscription data loading
    const pageIsOverallLoading = isProcessingCheckout || isSubscriptionDataLoading;

    return (
        <BubbleAnimation
            ref={vortexRef}
            particleCount={300} // Fewer particles for less distraction
            baseSpeed={0.15}
            rangeSpeed={0.1}
            baseRadius={0.8}
            rangeRadius={1.5}
            backgroundColor="rgba(249, 250, 251, 0)" // Matches bg-gray-50 dark:bg-neutral-900
            containerClassName="dark:bg-gradient-to-br dark:from-purple-950/50 dark:via-neutral-900 dark:to-rose-950/30" // Subtle dark mode gradient
        >
            <div className="flex flex-col items-center justify-start min-h-screen py-12 px-4 font-montserrat"> {/* Removed bg-gray-50 etc. for BubbleAnimation */}
                <header className="text-center mb-10 mt-8 sm:mt-12 relative z-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
                        {scriptLines.planSelection.title}
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 dark:text-neutral-300 max-w-2xl mx-auto">
                        {scriptLines.planSelection.subtitle}
                    </p>
                </header>

                {isProcessingCheckout && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-opacity duration-300">
                        <Spinner size="lg" color="text-white" />
                        <p className="mt-4 text-white text-xl font-semibold">Processing your selection...</p>
                        <p className="mt-2 text-gray-200 text-sm">Redirecting to secure payment.</p>
                    </div>
                )}

                {error && !isProcessingCheckout && ( // Only show general error if not processing checkout (Stripe error handled by Stripe)
                    <div
                        className="my-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200 rounded-md shadow-md max-w-xl w-full mx-auto text-left relative z-10"
                        role="alert"
                    >
                        <div className="flex">
                            <div>
                                <h3 className="font-bold mb-1 text-red-800 dark:text-red-100">Payment Initialization Failed</h3>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="w-full max-w-7xl mx-auto relative z-10">
                    <PlanSelection
                        onPlanSelect={handlePlanSelected}
                        onManageSubscription={handleManageSubscription} // Pass the new handler
                        isLoading={pageIsOverallLoading} // Pass combined loading state
                        themeColor="rose" // Can be made dynamic if needed
                    />
                </div>

                <footer className="mt-16 mb-8 text-center text-sm text-gray-500 dark:text-neutral-400 relative z-10">
                    <p>{scriptLines.planSelection.footerNote}</p>
                    <p className="mt-1">
                        Need help or have questions about billing?{' '}
                        <a
                            href="/contact-support"
                            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            Contact Support
                        </a>
                    </p>
                </footer>
            </div>
        </BubbleAnimation>
    );
};

export default PlanAndPaymentPage;