import React from 'react';
// ReactDOM import is usually in main.jsx, not App.jsx
// import ReactDOM from 'react-dom/client'; 
import { createBrowserRouter, RouterProvider } from 'react-router-dom'; // Removed unused BrowserRouter as Router

import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import CartDrawer from './components/store/CartDrawer.jsx';
import LoginPage from './pages/LoginPage.jsx'; // This might be a general login chooser page
import CompleteProfilePage from './pages/CompleteProfilePage.jsx';
import RegistrationPage from './features/register/RegistrationPage.jsx';
import BusinessLoginPage from './pages/BusinessLoginPage.jsx'; // Assuming this is the correct import path
import BusinessDashboardPage from './pages/BusinessDashboardPage.jsx';
import PrivateRoute from './components/common/PrivateRoute.jsx';

// Contexts
import { CartProvider } from './contexts/CartContext';
import { FlyingImageProvider } from './components/animations/flying_image/FlyingImageContext.jsx';
import { AuthProvider } from './contexts/AuthContext'; // Crucial import

// Define routes without per-route AuthProvider, as it will be global
const router = createBrowserRouter([
	{
		path: "/",
		element: <HomePage />,
		errorElement: <NotFoundPage />,
	},
	{
		path: "/login",
		element: <LoginPage />, // General login chooser if you have one
		errorElement: <NotFoundPage />,
	},
	{
		path: "/login/business", // Specific route for business login
		element: <BusinessLoginPage />,
		errorElement: <NotFoundPage />,
	},
	{
		path: "/logout", // This route likely triggers a logout action and redirects
		// element: <LogoutHandlerComponent /> // Or handled via button click contextually
	},
	{
		path: "/register",
		element: <RegistrationPage />,
		errorElement: <NotFoundPage />,
	},
	{
		path: "/complete-profile",
		element: <CompleteProfilePage />, // Might also need to be within AuthProvider if it uses auth context
		errorElement: <NotFoundPage />,
	},
	{
		path: "/dashboard/business",
		element: (
			<PrivateRoute requiredRoles={['ADMIN', 'MANAGER', 'STAFF']}>
				<BusinessDashboardPage />
			</PrivateRoute>
		),
		errorElement: <NotFoundPage />, // Or a specific dashboard error boundary
	},
	// Example of an unauthorized page route
	{
		path: "/dashboard/unauthorized",
		element: <div><h1>Access Denied</h1><p>You do not have permission to view this page.</p></div>, // Simple unauthorized page
	}
]);

function App() {
	return (
		<React.StrictMode>
			{/* AuthProvider now wraps RouterProvider, making auth context available to all routes */}
			<AuthProvider>
				<CartProvider>
					<FlyingImageProvider>
						<RouterProvider router={router} />
						<CartDrawer />
					</FlyingImageProvider>
				</CartProvider>
			</AuthProvider>
		</React.StrictMode>
	);
}

export default App;