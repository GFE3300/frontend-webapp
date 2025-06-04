import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/common/Icon'; // Assuming Icon component path
import { useAuth } from '../../contexts/AuthContext'; // Assuming AuthContext path
import Button from '../../components/common/Button'; // Using the common Button for consistency

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth(); // Get user context

    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // To manage initial loading/check

    useEffect(() => {
        const sId = searchParams.get('session_id');
        if (sId) {
            setSessionId(sId);
            console.log('Payment successful for session ID:', sId);
            // Potential future actions:
            // 1. Send sId to backend to verify and finalize subscription details if not fully handled by webhooks.
            //    (This is often done by webhooks, but a client-side confirmation can be an option)
            // 2. Trigger a refetch of user data if AuthContext or another context manages subscription status.
            //    e.g., auth.refreshUserProfile();
            //    For now, we assume webhooks handle the backend state update, and the dashboard will
            //    fetch the latest user/subscription status.
        } else {
            console.warn('Session ID not found in URL. This could indicate an issue or direct navigation.');
            // Optionally, redirect or show a more generic message if session_id is crucial and missing.
            // For now, we'll allow the page to render, but the "Transaction ID" part won't show.
        }
        setIsLoading(false); // Done processing URL params
    }, [searchParams]);

    const handleGoToDashboard = () => {
        navigate('/dashboard/business');
    };

    if (isLoading) {
        // Optional: Show a quick loading spinner while checking URL params
        return (
            <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-gray-50 dark:bg-neutral-900 font-montserrat">
                {/* <Spinner size="lg" /> */}
                <p>Loading payment confirmation...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-gray-50 dark:bg-neutral-900 font-montserrat text-center">
            <div className="bg-white dark:bg-neutral-800 p-8 sm:p-12 rounded-xl shadow-2xl max-w-lg w-full">
                <Icon
                    name="check_circle" // Material Symbols name for a filled check circle
                    className="w-20 h-20 sm:w-24 sm:h-24 text-green-500 dark:text-green-400 mx-auto mb-6"
                    variations={{ fill: 1, weight: 500 }} // Assuming 'fill: 1' makes it solid
                />

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                    Payment Successful!
                </h1>

                <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                    Thank you, {user?.firstName || 'Valued Customer'}! Your subscription has been activated.
                    You can now access all the premium features of your chosen plan.
                </p>

                {sessionId && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                        Transaction ID: <span className="font-mono bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded text-xs">{sessionId}</span>
                    </p>
                )}

                <Button
                    onClick={handleGoToDashboard}
                    variant="solid" // Assuming 'solid' is your primary button style
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-lg py-3 px-8 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                    Go to Dashboard
                </Button>

                <p className="mt-10 text-xs text-gray-400 dark:text-gray-500">
                    If you have any questions, please{' '}
                    <a
                        href="/contact-support" // Placeholder or actual link
                        className="underline hover:text-indigo-500 dark:hover:text-indigo-400"
                    >
                        contact our support team
                    </a>.
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;