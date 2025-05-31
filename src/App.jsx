import React from 'react';
// Router
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Pages & Features
// import HomePage from './pages/HomePage.jsx'; // Original import, kept for reference
import NotFoundPage from './pages/NotFoundPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CompleteProfilePage from './pages/CompleteProfilePage.jsx';
import RegistrationPage from './features/register/RegistrationPage.jsx';
import BusinessLoginPage from './pages/BusinessLoginPage.jsx';
import BusinessDashboardPage from './pages/BusinessDashboardPage.jsx';
import AdminMenuPreviewPage from './pages/AdminMenuPreviewPage.jsx';

// Updated: Main entry point for Venue Layout Management Feature
import VenueDesignerPage from './features/venue_management/subcomponents/layout_designer/VenueDesignerPage.jsx';

// Components
// import CartDrawer from './components/store/CartDrawer.jsx'; // Original import, kept for consistency if used elsewhere
import PrivateRoute from './components/common/PrivateRoute.jsx';

// Contexts
import { CartProvider } from './contexts/CartContext';
import { FlyingImageProvider } from './components/animations/flying_image/FlyingImageContext.jsx';
import { AuthProvider } from './contexts/AuthContext'; // Crucial import
import { ThemeToggleButton } from './utils/ThemeToggleButton.jsx';

// Contexts & Providers
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { CartProvider } from './contexts/CartContext'; // Original import, kept commented out
import { ThemeProvider } from './utils/ThemeProvider.jsx';

// DND Imports
import { DndProvider } from 'react-dnd';
import { MultiBackend, TouchTransition } from 'dnd-multi-backend'; // Core multi-backend
import { HTML5Backend } from 'react-dnd-html5-backend';        // HTML5 backend for mouse
import { TouchBackend } from 'react-dnd-touch-backend';       // Touch backend for touch devices

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
		{
			id: 'html5',
			backend: HTML5Backend, // For mouse interactions
			transition: TouchTransition, // Specifies how to transition to the next backend (TouchBackend)
		},
		{
			id: 'touch',
			backend: TouchBackend, // For touch interactions
			options: {
				enableMouseEvents: false, // CRITICAL: Prevent TouchBackend from handling mouse events
				delayTouchStart: 150,     // Optional: Delay (ms) to distinguish a tap from a drag intention
			},
			preview: true, // Use native device preview for touch
		},
	],
};

// Router Configuration
const router = createBrowserRouter([
	{
		path: "/",
		// Updated: Root path now points to VenueDesignerPage for the layout management feature
		element: <VenueDesignerPage />,
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
]);

function App() {
	return (
		<React.StrictMode>
			<QueryClientProvider client={queryClient}>
				<DndProvider backend={MultiBackend} options={DNDBackendsConfig}>
					<AuthProvider>
						{/* 
                            If CartProvider is needed globally, it should be placed here. For example:
                        <CartProvider> 
                        */}
						<FlyingImageProvider>
							<ThemeProvider>
								<ThemeToggleButton />
								<RouterProvider router={router} />
								{/* <CartDrawer />  If this is a global drawer, it might be placed here or within a layout component */}
							</ThemeProvider>
						</FlyingImageProvider>
						{/* </CartProvider> */}
					</AuthProvider>
				</DndProvider>
			</QueryClientProvider>
		</React.StrictMode>
	);
}

export default App;