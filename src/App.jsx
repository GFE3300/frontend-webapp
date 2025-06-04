// frontend/src/App.jsx

import React from 'react';
// Router
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Stripe
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Pages & Features
import NotFoundPage from './pages/NotFoundPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CompleteProfilePage from './pages/CompleteProfilePage.jsx';
import RegistrationPage from './features/register/RegistrationPage.jsx';
import BusinessLoginPage from './pages/BusinessLoginPage.jsx';
import BusinessDashboardPage from './pages/BusinessDashboardPage.jsx';
import AdminMenuPreviewPage from './pages/AdminMenuPreviewPage.jsx';
import UserpageWrapper from './features/menu_view/Userpage.jsx';
import PlanAndPaymentPage from './features/payments/PlanAndPaymentPage.jsx';
import PaymentSuccessPage from './features/payments/PaymentSuccessPage.jsx'; // Added
import PaymentCancelPage from './features/payments/PaymentCancelPage.jsx';  // Added

// Venue Layout Management (Existing)
import VenueDesignerPage from './features/venue_management/subcomponents/layout_designer/VenueDesignerPage.jsx';

// Components
import PrivateRoute from './components/common/PrivateRoute.jsx';

// Contexts & Providers
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { FlyingImageProvider } from './components/animations/flying_image/FlyingImageContext.jsx';
import { ThemeProvider } from './utils/ThemeProvider.jsx';
import { ThemeToggleButton } from './utils/ThemeToggleButton.jsx';
import { ToastProvider } from './contexts/ToastContext'; // Ensure ToastProvider is here

// DND Imports
import { DndProvider } from 'react-dnd';
import { MultiBackend } from 'dnd-multi-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

// Initialize Stripe (outside of the component to avoid re-creating on re-renders)
// Replace with your actual Stripe publishable key, ideally from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
    console.error("Stripe publishable key is not set. Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env file.");
}
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;


// TanStack Query Client Configuration
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

// DND Multi-Backend Configuration
const DNDBackendsConfig = {
    backends: [
        { id: 'html5', backend: HTML5Backend },
        {
            id: 'touch',
            backend: TouchBackend,
            options: { enableMouseEvents: false, delayTouchStart: 150 },
            preview: true,
            transition: { event: 'touchstart', capture: true }, // Simplified transition example
        },
    ],
};

// Router Configuration
const router = createBrowserRouter([
    {
        path: "/",
        element: <VenueDesignerPage />,
        errorElement: <NotFoundPage />,
    },
    {
        path: "/menu/:businessIdentifier/table/:tableLayoutItemId",
        element: <UserpageWrapper />,
        errorElement: <NotFoundPage />,
    },
    {
        path: "/login",
        element: <LoginPage />,
        errorElement: <NotFoundPage />,
    },
    {
        path: "/login/business",
        element: <BusinessLoginPage />,
        errorElement: <NotFoundPage />,
    },
    {
        path: "/logout",
        // Placeholder
    },
    {
        path: "/register",
        element: <RegistrationPage />,
        errorElement: <NotFoundPage />,
    },
    {
        path: "/complete-profile",
        element: <CompleteProfilePage />,
        errorElement: <NotFoundPage />,
    },
    {
        path: "/dashboard/business",
        element: (
            <PrivateRoute requiredRoles={['ADMIN', 'MANAGER', 'STAFF']}>
                <BusinessDashboardPage />
            </PrivateRoute>
        ),
        errorElement: <NotFoundPage />,
    },
    {
        path: "/dashboard/unauthorized",
        element: <div><h1>Access Denied</h1><p>You do not have permission to view this page.</p></div>,
    },
    {
        path: "/dashboard/business/menu-preview",
        element: (
            <PrivateRoute requiredRoles={['ADMIN', 'MANAGER']}>
                <AdminMenuPreviewPage />
            </PrivateRoute>
        ),
        errorElement: <NotFoundPage />,
    },
    {
        path: "/venue-designer",
        element: <VenueDesignerPage />,
        errorElement: <NotFoundPage />,
    },
    {
        path: "/plans",
        element: (
            <PrivateRoute requiredRoles={['USER', 'ADMIN', 'MANAGER', 'STAFF']}>
                {stripePromise ? ( // Only render if stripePromise is loaded
                    <Elements stripe={stripePromise}>
                        <PlanAndPaymentPage />
                    </Elements>
                ) : (
                    <div>Loading Stripe... Ensure VITE_STRIPE_PUBLISHABLE_KEY is set.</div>
                )}
            </PrivateRoute>
        ),
        errorElement: <NotFoundPage />,
    },
    {
        path: "/payment-success", // Added
        element: <PaymentSuccessPage />,
        errorElement: <NotFoundPage />,
    },
    {
        path: "/payment-cancel",  // Added
        element: <PaymentCancelPage />,
        errorElement: <NotFoundPage />,
    },
]);

function App() {
    return (
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <DndProvider backend={MultiBackend} options={DNDBackendsConfig}>
                    <AuthProvider>
                        <ToastProvider> {/* Make sure ToastProvider wraps components using useToast */}
                            <FlyingImageProvider>
                                <ThemeProvider>
                                    <ThemeToggleButton />
                                    <RouterProvider router={router} />
                                </ThemeProvider>
                            </FlyingImageProvider>
                        </ToastProvider>
                    </AuthProvider>
                </DndProvider>
            </QueryClientProvider>
        </React.StrictMode>
    );
}

export default App;