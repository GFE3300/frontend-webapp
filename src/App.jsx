import React from 'react';
// Router
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Pages & Features
import HomePage from './pages/HomePage.jsx'; // Though "/" route currently points to VenueManagementPage
import NotFoundPage from './pages/NotFoundPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CompleteProfilePage from './pages/CompleteProfilePage.jsx';
import RegistrationPage from './features/register/RegistrationPage.jsx';
import BusinessLoginPage from './pages/BusinessLoginPage.jsx';
import BusinessDashboardPage from './pages/BusinessDashboardPage.jsx';
import { VenueManagementPage } from './features/venue_management/subcomponents/index.js'; // Main page for "/"

// Components
import CartDrawer from './components/store/CartDrawer.jsx'; // Original import, kept for consistency
import PrivateRoute from './components/common/PrivateRoute.jsx';
import { ThemeToggleButton } from './utils/ThemeToggleButton.jsx';

// Contexts & Providers
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './contexts/CartContext'; // Original import, kept for consistency
import { FlyingImageProvider } from './components/animations/flying_image/FlyingImageContext.jsx';
import { AuthProvider } from './contexts/AuthContext';
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
// This defines the pipeline: HTML5Backend first for mouse, then TouchBackend for touch.
const DNDBackendsConfig = {
	backends: [
		{
			id: 'html5',
			backend: HTML5Backend, // For mouse interactions
			transition: TouchTransition, // Specifies how to transition to the next backend (TouchBackend)
			// TouchTransition will pass events to the next backend if the current one doesn't handle them.
		},
		{
			id: 'touch',
			backend: TouchBackend, // For touch interactions
			options: {
				enableMouseEvents: false, // CRITICAL: Prevent TouchBackend from handling mouse events, as HTML5Backend does that.
				delayTouchStart: 150,     // Optional: Delay (ms) to distinguish a tap from a drag intention. Helps prevent accidental drags.
				// Adjust as needed for UX. Common values are 100-250ms.
				// scrollAngleRanges: [    // Optional: Useful if your draggable items are on a scrollable page/canvas.
				// Defines angular ranges (in degrees, 0 is right) where touch movement is treated as scrolling.
				// e.g., { start: 30, end: 150 } for primarily vertical scrolling.
				// ],
			},
			preview: true, // Use native device preview for touch (often a screenshot of the item).
			// Set to false if you want to use a custom drag layer for touch as well.
			// No transition_out needed for the last backend in the chain.
		},
	],
};

// Router Configuration (same as your provided version)
const router = createBrowserRouter([
	{
		path: "/",
		element: <VenueManagementPage />, // Root path now points to VenueDesignerPage via VenueManagementPage export
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
	}
	// Consider adding a route for HomePage if it's still intended to be accessible
	// e.g., { path: "/home", element: <HomePage /> }
]);

function App() {
	return (
		<React.StrictMode>
			<QueryClientProvider client={queryClient}>
				{/* DndProvider now uses MultiBackend with the defined configuration */}
				<DndProvider backend={MultiBackend} options={DNDBackendsConfig}>
					<AuthProvider>
						{/* Note: CartProvider was imported but not used in your original App.jsx providers. 
                            If it's needed globally, it should be placed here. For example:
                        <CartProvider> */}
						<FlyingImageProvider>
							<ThemeProvider>
								<ThemeToggleButton />
								<RouterProvider router={router} />
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