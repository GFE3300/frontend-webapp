// frontend/src/App.jsx
// (Showing relevant parts for modification)

import React from 'react';
// Router
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Pages & Features
import NotFoundPage from './pages/NotFoundPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CompleteProfilePage from './pages/CompleteProfilePage.jsx';
import RegistrationPage from './features/register/RegistrationPage.jsx';
import BusinessLoginPage from './pages/BusinessLoginPage.jsx';
import BusinessDashboardPage from './pages/BusinessDashboardPage.jsx';
import AdminMenuPreviewPage from './pages/AdminMenuPreviewPage.jsx';

// Venue Layout Management (Existing)
import VenueDesignerPage from './features/venue_management/subcomponents/layout_designer/VenueDesignerPage.jsx';

// NEW: Customer Menu Page (Userpage)
import UserpageWrapper from './features/menu_view/Userpage.jsx'; // Path to be created

import { KitchenDisplaySystemPage } from './features/kitchen_display_system';


// Components
import PrivateRoute from './components/common/PrivateRoute.jsx';

// Contexts & Providers
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { FlyingImageProvider } from './components/animations/flying_image/FlyingImageContext.jsx';
import { ThemeProvider } from './utils/ThemeProvider.jsx';
import { ThemeToggleButton } from './utils/ThemeToggleButton.jsx';

// DND Imports
import { DndProvider } from 'react-dnd';
import { MultiBackend } from 'dnd-multi-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

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
            transition: {event: 'touchstart', capture: true}, // Simplified transition example
        },
    ],
};

// Router Configuration
const router = createBrowserRouter([
    {
        path: "/",
        // Updated: Root path now points to VenueDesignerPage for the layout management feature
        // For development, you might want to change this temporarily or add a distinct landing page
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
        // element: <LogoutHandlerComponent /> // Or handled contextually
        // Placeholder, actual logout logic is in AuthContext
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
        path: "/kitchen",
        element: <KitchenDisplaySystemPage />,
        errorElement: <NotFoundPage />,
    }
]);

function App() {
    return (
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <DndProvider backend={MultiBackend} options={DNDBackendsConfig}>
                    <AuthProvider>
                        <FlyingImageProvider>
                            <ThemeProvider> 
                                <ThemeToggleButton />
                                <RouterProvider router={router} />
                            </ThemeProvider>
                        </FlyingImageProvider>
                    </AuthProvider>
                </DndProvider>
            </QueryClientProvider>
        </React.StrictMode>
    );
}

export default App;