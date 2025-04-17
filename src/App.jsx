import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import CartDrawer from './components/store/CartDrawer.jsx';

const router = createBrowserRouter([
	{
		path: "/",
		element: <HomePage />,
		errorElement: <NotFoundPage />,

	}
]);

function App() {
	return (
		<React.StrictMode>
			{/* Renders the pages */}
			<RouterProvider router={router} />

			{/* This lives at the app root so the drawer can overlay any page */}
			<CartDrawer />
		</React.StrictMode>
	)
}

export default App;