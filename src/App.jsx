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
import AdminMenuPreviewPage from './pages/AdminMenuPreviewPage.jsx';
import UserpageWrapper from './features/menu_view/Userpage.jsx';
import PlanAndPaymentPage from './features/payments/PlanAndPaymentPage.jsx';
import PaymentSuccessPage from './features/payments/PaymentSuccessPage.jsx';
import PaymentCancelPage from './features/payments/PaymentCancelPage.jsx';

import DashboardLayout from './features/dashboard/DashboardLayout.jsx';
import OverviewPage from './features/dashboard/pages/OverviewPage.jsx';
import OrdersPage from './features/dashboard/pages/OrdersPage.jsx';
import ProductsPage from './features/dashboard/pages/ProductsPage.jsx';
import InventoryPage from './features/dashboard/pages/InventoryPage.jsx';
import VenuePage from './features/dashboard/pages/VenuePage.jsx';
import AnalyticsPage from './features/dashboard/pages/AnalyticsPage.jsx';

// MODIFIED: Import new settings pages
import SettingsPage from './features/dashboard/pages/SettingsPage.jsx';
import ProfileSettingsPage from './features/dashboard/pages/settings/ProfileSettingsPage.jsx';
import SubscriptionBillingPage from './features/dashboard/pages/settings/SubscriptionBillingPage.jsx';

// Venue Layout Management (Existing)
import VenueDesignerPage from './features/venue_management/subcomponents/layout_designer/VenueDesignerPage.jsx';

// Components
import PrivateRoute from './components/common/PrivateRoute.jsx';

// Contexts & Providers
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { FlyingImageProvider } from './components/animations/flying_image/FlyingImageContext.jsx';
import { ThemeProvider } from './utils/ThemeProvider.jsx';
import { ThemeToggleButton } from './utils/ThemeToggleButton.jsx';
import { ToastProvider } from './contexts/ToastContext';
import { Navigate } from 'react-router-dom';

// DND Imports
import { DndProvider } from 'react-dnd';
import { MultiBackend } from 'dnd-multi-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

// Initialize Stripe (outside of the component to avoid re-creating on re-renders)
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
            transition: { event: 'touchstart', capture: true },
        },
    ],
};

// Router Configuration
const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/dashboard/business" replace />,
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
        // Placeholder for logout logic, usually handled within AuthContext/components
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
                <DashboardLayout />
            </PrivateRoute>
        ),
        errorElement: <NotFoundPage />,
        children: [
            { index: true, element: <Navigate to="overview" replace /> },
            { path: "overview", element: <OverviewPage /> },
            { path: "orders", element: <OrdersPage /> },
            { path: "products", element: <ProductsPage /> },
            { path: "inventory", element: <InventoryPage /> },
            { path: "venue", element: <VenuePage /> },
            { path: "analytics", element: <AnalyticsPage /> },
            // MODIFIED: Settings route and its children
            {
                path: "settings",
                element: <SettingsPage />, // Renders the SettingsPage layout with sub-navigation
                children: [
                    // Default child for /settings, redirects to profile. SettingsPage handles its own redirect too.
                    { index: true, element: <Navigate to="profile" replace /> },
                    { path: "profile", element: <ProfileSettingsPage /> },
                    { path: "billing", element: <SubscriptionBillingPage /> },
                    // Add other settings sub-routes here
                ]
            },
            {
                path: "menu-preview",
                element: (
                    <PrivateRoute requiredRoles={['ADMIN', 'MANAGER']}>
                        <AdminMenuPreviewPage />
                    </PrivateRoute>
                ),
            },
            {
                path: "venue-designer",
                element: (
                    <PrivateRoute requiredRoles={['ADMIN', 'MANAGER']}>
                        <VenueDesignerPage />
                    </PrivateRoute>
                ),
            },
        ]
    },
    {
        path: "/dashboard/unauthorized",
        element: <div><h1>Access Denied</h1><p>You do not have permission to view this page.</p></div>,
    },
    // MODIFIED: Removed redundant /dashboard/business/menu-preview and /venue-designer as they are now nested
    // {
    //     path: "/dashboard/business/menu-preview",
    //     // ...
    // },
    // {
    //     path: "/venue-designer",
    //     // ...
    // },
    {
        path: "/plans",
        element: (
            <PrivateRoute requiredRoles={['USER', 'ADMIN', 'MANAGER', 'STAFF']}> {/* Ensure USER role if direct access from registration */}
                {stripePromise ? (
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
        path: "/payment-success",
        element: <PaymentSuccessPage />,
        errorElement: <NotFoundPage />,
    },
    {
        path: "/payment-cancel",
        element: <PaymentCancelPage />,
        errorElement: <NotFoundPage />,
    },

    // ADMIN ROUTES
    {
        path: "affiliates",
        element: (
            <PrivateRoute requiredRoles={['ADMIN']}>
                <AffiliatesPage />
            </PrivateRoute>
        ),
    },
    {
        path: "affiliates/:affiliateId",
        element: (
            <PrivateRoute requiredRoles={['ADMIN']}>
                <AffiliateDetailPage />
            </PrivateRoute>
        ),
    },
]);

function App() {
    return (
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <DndProvider backend={MultiBackend} options={DNDBackendsConfig}>
                    <AuthProvider> {/* AuthProvider is outer */}
                        <SubscriptionProvider> {/* SubscriptionProvider is inner */}
                            <ToastProvider>
                                <FlyingImageProvider>
                                    <ThemeProvider>
                                        <ThemeToggleButton />
                                        <RouterProvider router={router} />
                                    </ThemeProvider>
                                </FlyingImageProvider>
                            </ToastProvider>
                        </SubscriptionProvider>
                    </AuthProvider>
                </DndProvider>
            </QueryClientProvider>
        </React.StrictMode>
    );
}

export default App;