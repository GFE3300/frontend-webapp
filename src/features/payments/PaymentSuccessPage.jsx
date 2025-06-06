import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import Icon from '../../components/common/Icon';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner'; // Import Spinner
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { scriptLines_Components as scriptLines } from './utils/script_lines';
import BubbleAnimation from '../../features/register/subcomponents/BubbleAnimation'; // For background

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const {
        subscription,
        fetchSubscriptionStatus,
        isLoading: isSubscriptionContextLoading
    } = useSubscription();

    const [sessionId, setSessionId] = useState(null);
    const [pageLoadingState, setPageLoadingState] = useState('initializing'); // 'initializing', 'fetching_subscription', 'success', 'error'
    const [pageError, setPageError] = useState(null);

    const successTexts = scriptLines.paymentSuccessPage;

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };
    const iconVariants = {
        hidden: { scale: 0.5, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 150, damping: 15, delay: 0.2 } },
    };

    useEffect(() => {
        const sId = searchParams.get('session_id');
        if (sId) {
            setSessionId(sId);
            console.log('[PaymentSuccessPage] Payment successful for session ID:', sId);
            setPageLoadingState('fetching_subscription');
            // Trigger subscription status refetch
            fetchSubscriptionStatus()
                .then(() => {
                    // The useSubscription hook will update `subscription` and `isSubscriptionContextLoading`
                    // We don't need to do anything specific here with the direct result of fetchSubscriptionStatus
                    // as the component will re-render when the context's state changes.
                    // The `useEffect` below will handle moving to 'success' state.
                })
                .catch(err => {
                    console.error("[PaymentSuccessPage] Error refetching subscription after success:", err);
                    setPageError(successTexts.errors.subscriptionUpdateFailed);
                    setPageLoadingState('error');
                });
        } else {
            console.warn('[PaymentSuccessPage] Session ID not found in URL.');
            setPageError(successTexts.errors.missingSessionId);
            setPageLoadingState('error');
        }
    }, [searchParams, fetchSubscriptionStatus, successTexts.errors]);

    useEffect(() => {
        // This effect waits for the subscription context to finish loading
        // after `fetchSubscriptionStatus` has been called.
        if (pageLoadingState === 'fetching_subscription' && !isSubscriptionContextLoading) {
            setPageLoadingState('success'); // Assume success for now, specific plan display handled below
        }
    }, [isSubscriptionContextLoading, pageLoadingState]);

    const handleGoToDashboard = () => {
        navigate('/dashboard/business');
    };

    const handleManageSubscription = useCallback(() => {
        // This would ideally redirect to the Stripe Customer Portal via a backend endpoint
        navigate('/plans'); // Placeholder or actual manage page
        // Example for future:
        // apiService.post('payments/create-customer-portal-session/')
        //     .then(response => { if (response.data.url) window.location.href = response.data.url; })
        //     .catch(err => console.error("Failed to create portal session", err));
    }, [navigate]);


    const renderContent = () => {
        if (pageLoadingState === 'initializing' || (pageLoadingState === 'fetching_subscription' && isSubscriptionContextLoading)) {
            return (
                <div className="text-center">
                    <Spinner size="lg" />
                    <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
                        {pageLoadingState === 'initializing' ? successTexts.loading.checkingDetails : successTexts.loading.finalizingSubscription}
                    </p>
                </div>
            );
        }

        if (pageLoadingState === 'error') {
            return (
                <div className="text-center">
                    <motion.div variants={iconVariants} initial="hidden" animate="visible">
                        <Icon
                            name="error"
                            className="w-20 h-20 sm:w-24 sm:h-24 text-red-500 dark:text-red-400 mx-auto mb-6"
                            variations={{ fill: 1, weight: 500 }}
                        />
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                        Problem with Confirmation
                    </h1>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                        {pageError || "An unexpected error occurred."}
                    </p>
                    <Button
                        onClick={handleGoToDashboard}
                        variant="solid"
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
                    >
                        Go to Dashboard
                    </Button>
                </div>
            );
        }

        // Success State
        const userName = user?.firstName || 'Valued Customer';
        const planName = subscription?.plan_name_display || 'your chosen'; // Use subscription from context
        const thankYouText = (subscription ? successTexts.thankYouMessage : successTexts.thankYouGeneric)
            .replace('{userName}', userName)
            .replace('{planName}', planName);

        return (
            <>
                <motion.div variants={iconVariants} initial="hidden" animate="visible">
                    <Icon
                        name="check_circle"
                        className="w-15 h-15 sm:w-20 sm:h-20 text-green-500 dark:text-green-400 mx-auto mb-6"
                        variations={{ fill: 1, weight: 500 }}
                        style={{ fontSize: '4rem' }}
                    />
                </motion.div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                    {subscription ? successTexts.titleSubscriptionActivated : successTexts.title}
                </h1>

                <p className="text-lg text-gray-700 dark:text-gray-300 mb-8" dangerouslySetInnerHTML={{ __html: thankYouText }} />
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                    {successTexts.accessMessage}
                </p>

                {sessionId && (
                    <p className="flex flex-col gap-2 items-center justify-center text-sm text-gray-500 dark:text-neutral-400 mb-8">
                        {successTexts.transactionIdLabel} <span className="font-mono w-full overflow-hidden bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded text-xs">{sessionId}</span>
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={handleGoToDashboard}
                        variant="solid"
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-lg py-3 px-8"
                    >
                        {successTexts.buttons.goToDashboard}
                    </Button>
                    <Button
                        onClick={handleManageSubscription}
                        variant="outline"
                        className="text-indigo-600 border-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-neutral-700 text-lg py-3 px-8"
                    >
                        {successTexts.buttons.viewBilling}
                    </Button>
                </div>

                <p className="mt-10 text-xs text-gray-400 dark:text-gray-500">
                    If you have any questions, please{' '}
                    <a
                        href="/contact-support"
                        className="underline hover:text-indigo-500 dark:hover:text-indigo-400"
                    >
                        {successTexts.links.contactSupport}
                    </a>.
                </p>
            </>
        );
    };

    return (
        <BubbleAnimation // Using BubbleAnimation for background consistency
            particleCount={200}
            baseSpeed={0.1}
            rangeSpeed={0.05}
            baseRadius={0.6}
            rangeRadius={1.2}
            backgroundColor="rgba(249, 250, 251, 0)" // Transparent to show gradient
            containerClassName="dark:bg-gradient-to-br dark:from-green-950/40 dark:via-neutral-900 dark:to-indigo-950/30"
        >
            <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 font-montserrat text-center relative z-10">
                <motion.div
                    className="bg-white dark:bg-neutral-800 p-8 sm:p-12 rounded-xl shadow-2xl max-w-lg w-full"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {renderContent()}
                </motion.div>
            </div>
        </BubbleAnimation>
    );
};

export default PaymentSuccessPage;