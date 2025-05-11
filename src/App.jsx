import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, BrowserRouter as Router } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import CartDrawer from './components/store/CartDrawer.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CompleteProfilePage from './pages/CompleteProfilePage.jsx';
import PrivateRoute from './components/common/PrivateRoute.jsx';

// Contexts
import { CartProvider } from './contexts/CartContext';
import { FlyingImageProvider } from './components/animations/flying_image/FlyingImageContext.jsx';
import { AuthProvider } from './contexts/AuthContext';

const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<AuthProvider>
				<HomePage />
			</AuthProvider>
		),
		errorElement: <NotFoundPage />,
	},
	{
		path: "/login",
		element: (
			<AuthProvider>
				<LoginPage />
			</AuthProvider>
		),
		errorElement: <NotFoundPage />,
	},
	{
		path: "/logout",
		
	},
	{
		path: "/register",
		element: (
			<AuthProvider>
				<LoginPage />
			</AuthProvider>
		),
		errorElement: <NotFoundPage />,
	},
	{
		path: "/complete-profile",
		element: (
					<CompleteProfilePage />
		),
		errorElement: <NotFoundPage />,
	}
]);

function App() {
	return (
		<React.StrictMode>
			<CartProvider>
				<FlyingImageProvider>
					{/* Renders the pages */}

					<RouterProvider router={router} />

					{/* This lives at the app root so the drawer can overlay any page */}
					<CartDrawer />

				</FlyingImageProvider>
			</CartProvider>
		</React.StrictMode>
	)
};

export default App;