import React from 'react';
// Router
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Stripe
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useTheme } from './utils/ThemeProvider.jsx';

import AdminOnlyRoute from './components/common/AdminOnlyRoute.jsx';

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
import CreateBusinessPage from './features/dashboard/pages/CreateBusinessPage.jsx';

// Import Staff Portal pages
import StaffLoginPage from './features/staff_portal/pages/admin/StaffLoginPage.jsx';
import StaffDashboardLayout from './features/staff_portal/StaffDashboardLayout.jsx';
import AffiliatesPage from './features/staff_portal/pages/admin/AffiliatesPage.jsx';
import AffiliateDetailPage from './features/staff_portal/pages/admin/AffiliateDetailPage.jsx';
import PayoutsPage from './features/staff_portal/pages/admin/PayoutsPage.jsx';
import StaffDashboardPage from './features/staff_portal/pages/StaffDashboardPage.jsx';
import AcceptInvitePage from './pages/AcceptInvitePage.jsx';

// Import Dashboard Pages
import DashboardLayout from './features/dashboard/DashboardLayout.jsx';
import OverviewPage from './features/dashboard/pages/OverviewPage.jsx';
import ProductsPage from './features/dashboard/pages/ProductsPage.jsx';
import InventoryPage from './features/dashboard/pages/InventoryPage.jsx';
import VenuePage from './features/dashboard/pages/VenuePage.jsx';
import OrdersDashboardPage from './features/live_orders_view/LiveOrdersPage.jsx';
import AnalyticsPage from './features/dashboard/pages/AnalyticsPage.jsx';
import SettingsPage from './features/dashboard/pages/SettingsPage.jsx';
import UserProfile from './features/settings_menu/components/UserProfile.jsx';
import BusinessProfilePage from './features/settings_menu/components/BusinessProfilePage.jsx';
import VenueDesignerPage from './features/venue_management/subcomponents/layout_designer/VenueDesignerPage.jsx';
import KitchenDisplayPage from './features/kitchen_display_system/pages/KitchenDisplayPage.jsx';

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

// DND Imports
import { DndProvider } from 'react-dnd';
import { MultiBackend } from 'dnd-multi-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

// DEVELOPMENT
import LanguageSwitcher from './components/common/LanguageSwitcher.jsx';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
    console.error("Stripe publishable key is not set. Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env file.");
}
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

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
        path: "/login/business",
        element: <BusinessLoginPage />,
        errorElement: <NotFoundPage />,
    },
    {
        path: "/logout",
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
        path: "/staff/login",
        element: <StaffLoginPage />,
    },
    {
        path: "/staff",
        element: (
            <PrivateRoute staffOnly={true}>
                <StaffDashboardLayout />
            </PrivateRoute>
        ),
        errorElement: <NotFoundPage />,
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: "dashboard", element: <StaffDashboardPage /> },

            {
                path: "manage-affiliates",
                element: <AdminOnlyRoute><AffiliatesPage /></AdminOnlyRoute>,
            },
            {
                path: "manage-affiliates/:affiliateId",
                element: <AdminOnlyRoute><AffiliateDetailPage /></AdminOnlyRoute>,
            },
            {
                path: "payouts",
                element: <AdminOnlyRoute><PayoutsPage /></AdminOnlyRoute>,
            },
        ]
    },
    {
        path: "/accept-invite",
        element: <AcceptInvitePage />,
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
            { path: "orders", element: <OrdersDashboardPage /> },
            { path: "products", element: <ProductsPage /> },
            { path: "inventory", element: <InventoryPage /> },
            { path: "venue", element: <VenuePage /> },
            { path: "analytics", element: <AnalyticsPage /> },
            {
                path: "settings",
                element: <SettingsPage />, // This is our new layout component
                children: [
                    // Redirect the base /settings path to the profile page by default
                    { index: true, element: <Navigate to="profile" replace /> },
                    { path: "profile", element: <UserProfile /> },
                    { path: "business", element: <BusinessProfilePage /> },
                    // Add other pages as they are built, e.g.:
                    // { path: "security", element: <SecurityPage /> },
                    // { path: "billing", element: <BillingPage /> },
                ]
            },
            // FIX: The link in the switcher pointed here, but the standalone page should be a top-level route.
            // This nested route is no longer needed. The correct route is added below.
            // { path: "create", element: <CreateBusinessPage /> },
        ]
    },
    // --- NEW: Add the standalone Create Business page route ---
    {
        path: "/dashboard/business/create",
        element: (
            <PrivateRoute>
                <CreateBusinessPage />
            </PrivateRoute>
        ),
        errorElement: <NotFoundPage />,
    },
    {
        path: "/dashboard/unauthorized",
        element: <div><h1>Access Denied</h1><p>You do not have permission to view this page.</p></div>,
    },
    {
        path: "/plans",
        element: (
            <PrivateRoute requiredRoles={['USER', 'ADMIN', 'MANAGER', 'STAFF']}>
                {stripePromise ? (
                    <Elements stripe={stripePromise}>
                        <PlanAndPaymentPage />
                    </Elements>
                ) : (
                    <div>Loading Stripe... </div>
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
]);

const App = () => {
    const { theme } = useTheme();

    return (
        <div className="App">
            <div className='fixed z-50 top-0 w-full h-12 flex items-center justify-between px-4 bg-white dark:bg-neutral-900 dark:text-neutral-100 border-b border-neutral-300 dark:border-neutral-700 shadow-sm'>
                <LanguageSwitcher />
            </div>
            <ThemeToggleButton />
            <RouterProvider router={router} />
        </div>
    );
}

function AppWrapper() {

    return (
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <DndProvider backend={MultiBackend} options={DNDBackendsConfig}>
                    <AuthProvider>
                        <SubscriptionProvider>
                            <ToastProvider>
                                <FlyingImageProvider>
                                    <ThemeProvider>

                                        <App />

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

export default AppWrapper;  