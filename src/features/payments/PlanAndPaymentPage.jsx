import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripe } from '@stripe/react-stripe-js';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

// Local Imports
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useToast } from '../../contexts/ToastContext';
import { useValidatePromoCode } from '../../contexts/ProductDataContext';
import PlanSelection from './subcomponents/PlanSelection.jsx';
import Spinner from '../../components/common/Spinner';
import BubbleAnimation from '../../features/register/subcomponents/BubbleAnimation';
import { scriptLines_Components as scriptLines } from './utils/script_lines';
import Icon from '../../components/common/Icon';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';

const PlanAndPaymentPage = () => {
    const stripe = useStripe();
    const { addToast } = useToast();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const { subscription: currentSubscription, isLoading: isSubscriptionDataLoading } = useSubscription();

    const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
    const [error, setError] = useState(null);
    const vortexRef = useRef(null);

    const [referralCode, setReferralCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [validationStatus, setValidationStatus] = useState('idle'); // 'idle', 'validating', 'valid', 'invalid'
    const [validationMessage, setValidationMessage] = useState('');

    const validateCodeMutation = useValidatePromoCode({
        onMutate: () => {
            setValidationStatus('validating');
            setValidationMessage('');
        },
        onSuccess: (data) => {
            if (data.valid) {
                setAppliedDiscount(data);
                setValidationStatus('valid');
                setValidationMessage('Discount applied successfully!');
                addToast('Discount applied!', 'success');
            } else {
                setAppliedDiscount(null);
                setValidationStatus('invalid');
                setValidationMessage(data.message || 'Invalid discount code.');
                addToast(data.message || 'Invalid Code', 'error');
            }
        },
        onError: (err) => {
            setAppliedDiscount(null);
            setValidationStatus('invalid');
            const errorMessage = err.response?.data?.message || 'Could not validate code. Please try again.';
            setValidationMessage(errorMessage);
            addToast(errorMessage, 'error');
        },
    });

    useEffect(() => {
        const pendingCode = sessionStorage.getItem('pendingReferralCode');
        if (pendingCode) {
            setReferralCode(pendingCode);
            // Automatically trigger validation if user and business context are available
            if (user?.activeBusinessId) {
                validateCodeMutation.mutate({
                    code_name: pendingCode,
                    business_identifier: user.activeBusinessId,
                });
            }
            sessionStorage.removeItem('pendingReferralCode'); // Clean up after use
        }
    }, [user, validateCodeMutation]); // Depends on user context being ready


    const handlePlanSelected = useCallback(async (selectedPlan) => {
        if (!isAuthenticated || !stripe) {
            addToast(!isAuthenticated ? 'Please log in to select a plan.' : 'Stripe is not ready.', 'error');
            return;
        }

        setIsProcessingCheckout(true);
        setError(null);
        if (vortexRef.current) vortexRef.current.addTurbulence(15000);

        try {

            const payload = {
                plan_name: selectedPlan.id,
                referral_code: appliedDiscount?.valid ? referralCode : null,
            };

            const response = await apiService.createCheckoutSession(payload);
            const { sessionId } = response.data;

            if (!sessionId) throw new Error("Failed to initialize payment session.");

            const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
            if (stripeError) throw stripeError;

        } catch (apiError) {
            const errorMessage = apiError.response?.data?.error || apiError.message || 'Could not initiate your subscription.';
            setError(errorMessage);
            addToast(errorMessage, 'error', 5000);
            setIsProcessingCheckout(false);
        }
    }, [stripe, addToast, isAuthenticated, referralCode, appliedDiscount]);

    const handleManageSubscription = useCallback((plan) => {
        addToast("Redirecting to subscription management...", "info");
        apiService.post('payments/create-customer-portal-session/')
            .then(response => {
                if (response.data.url) window.location.href = response.data.url;
            })
            .catch(err => {
                addToast("Error accessing subscription management.", "error");
            });
    }, [addToast]);

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
                <header className="text-center mb-10 mt-8 sm:mt-12 relative z-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
                        {scriptLines.planSelection.title}
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 dark:text-neutral-300 max-w-2xl mx-auto">
                        {scriptLines.planSelection.subtitle}
                    </p>
                </header>

                <div className="w-full max-w-lg mx-auto relative z-10 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <InputField
                            label="Discount Code"
                            name="referralCode"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                            placeholder="Enter code here"
                            disabled={validateCodeMutation.isPending}
                            adornment={
                                <Button
                                    variant="solid"
                                    color="primary"
                                    size="sm"
                                    className="mr-1 my-1"
                                    onClick={() => validateCodeMutation.mutate({ code_name: referralCode, business_identifier: user.activeBusinessId })}
                                    isLoading={validationStatus === 'validating'}
                                    disabled={!referralCode || validationStatus === 'validating' || !user?.activeBusinessId}
                                >
                                    Apply
                                </Button>
                            }
                        />
                        <AnimatePresence>
                            {validationMessage && (
                                <motion.p
                                    key="validation-message"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className={`text-xs mt-1.5 ml-1 ${validationStatus === 'valid' ? 'text-green-600 dark:text-green-400'
                                        : validationStatus === 'invalid' ? 'text-red-600 dark:text-red-400' : 'text-neutral-500'
                                        }`}
                                >
                                    {validationMessage}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {error && !isProcessingCheckout && (
                    <div
                        className="my-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200 rounded-md shadow-md max-w-xl w-full mx-auto text-left relative z-10"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <div className="w-full max-w-7xl mx-auto relative z-10">
                    <PlanSelection
                        onPlanSelect={handlePlanSelected}
                        onManageSubscription={handleManageSubscription}
                        isLoading={pageIsOverallLoading}
                        themeColor="rose"
                        appliedDiscount={appliedDiscount} // Pass the discount data down
                    />
                </div>

                <footer className="mt-16 mb-8 text-center text-sm text-gray-500 dark:text-neutral-400 relative z-10">
                    <p>{scriptLines.planSelection.footerNote}</p>
                </footer>
            </div>
        </BubbleAnimation>
    );
};

export default PlanAndPaymentPage;