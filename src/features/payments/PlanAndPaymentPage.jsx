import React, { useState, useCallback, useRef, useEffect } from 'react';
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
// eslint-disable-next-line
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../../components/common/Icon';

const PlanAndPaymentPage = () => {
    const stripe = useStripe();
    const { addToast } = useToast();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate(); // Initialize useNavigate

    const { subscription: currentSubscription, isLoading: isSubscriptionDataLoading } = useSubscription();

    const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
    const [error, setError] = useState(null);
    const vortexRef = useRef(null);

    // MODIFICATION: State for referral code and alert visibility
    const [referralCode, setReferralCode] = useState(null);
    const [isReferralAlertVisible, setIsReferralAlertVisible] = useState(true);

    // MODIFICATION: useEffect to read referral code from sessionStorage on mount
    useEffect(() => {
        const pendingCode = sessionStorage.getItem('pendingReferralCode');
        if (pendingCode) {
            setReferralCode(pendingCode);
            setIsReferralAlertVisible(true);
            // Important: Clear the code from storage after reading it
            sessionStorage.removeItem('pendingReferralCode');
            console.log(`[PlanAndPaymentPage] Referral code "${pendingCode}" loaded from session storage and cleared.`);
        }
    }, []); // Empty dependency array ensures this runs only once on mount

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

        if (currentSubscription && currentSubscription.is_active && currentSubscription.plan_name === selectedPlanFromComponent.id) {
            addToast(scriptLines.planSelection.messages.alreadySubscribedError, 'info');
            return;
        }

        const planIdentifier = selectedPlanFromComponent.id;

        setIsProcessingCheckout(true);
        setError(null);
        if (vortexRef.current) vortexRef.current.addTurbulence(15000);

        try {
            const payload = {
                plan_name: planIdentifier,
            };

            if (user?.email) {
                payload.customer_email = user.email;
            }

            // MODIFICATION: Add referral code to the API payload if it exists
            if (referralCode) {
                payload.referral_code = referralCode;
            }

            console.log('[PlanAndPaymentPage] Creating checkout session with payload:', payload);
            const response = await apiService.createCheckoutSession(payload);

            const sessionId = response.data?.sessionId;

            if (!sessionId) {
                console.error('[PlanAndPaymentPage] Session ID not received from backend. Response data:', response.data);
                throw new Error("Failed to initialize payment session. Please try again or contact support.");
            }

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
    }, [stripe, addToast, isAuthenticated, user, currentSubscription, vortexRef, referralCode]);

    const handleManageSubscription = useCallback((plan) => {
        console.log("[PlanAndPaymentPage] 'Manage Subscription' clicked for plan:", plan.name);
        addToast("Redirecting to subscription management...", "info");
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
    }, [addToast, navigate]);

    const pageIsOverallLoading = isProcessingCheckout || isSubscriptionDataLoading;

    return (
        <BubbleAnimation
            ref={vortexRef}
            particleCount={300}
            baseSpeed={0.15}
            rangeSpeed={0.1}
            baseRadius={0.8}
            rangeRadius={1.5}
            backgroundColor="rgba(249, 250, 251, 0)"
            containerClassName="dark:bg-gradient-to-br dark:from-purple-950/50 dark:via-neutral-900 dark:to-rose-950/30"
        >
            <div className="flex flex-col items-center justify-start min-h-screen py-12 px-4 font-montserrat">
                <header className="text-center mb-6 mt-8 sm:mt-12 relative z-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
                        {scriptLines.planSelection.title}
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 dark:text-neutral-300 max-w-2xl mx-auto">
                        {scriptLines.planSelection.subtitle}
                    </p>
                </header>

                {/* MODIFICATION: Add referral code feedback UI */}
                <AnimatePresence>
                    {referralCode && isReferralAlertVisible && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }}
                            className="relative z-10 my-4 p-4 max-w-2xl w-full mx-auto bg-green-50 dark:bg-green-900/40 border border-green-300 dark:border-green-600 rounded-lg shadow-md flex items-center justify-between gap-4"
                            role="alert"
                        >
                            <div className="flex items-center gap-3">
                                <Icon name="celebration" className="w-6 h-6 text-green-600 dark:text-green-300 flex-shrink-0" />
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                    Referral code <span className="font-bold">"{referralCode}"</span> applied! Your discount will be reflected at checkout.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsReferralAlertVisible(false)}
                                className="p-1 rounded-full text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-700/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                aria-label="Dismiss message"
                            >
                                <Icon name="close" className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isProcessingCheckout && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-opacity duration-300">
                        <Spinner size="lg" color="text-white" />
                        <p className="mt-4 text-white text-xl font-semibold">Processing your selection...</p>
                        <p className="mt-2 text-gray-200 text-sm">Redirecting to secure payment.</p>
                    </div>
                )}

                {error && !isProcessingCheckout && (
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
                        onManageSubscription={handleManageSubscription}
                        isLoading={pageIsOverallLoading}
                        themeColor="rose"
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