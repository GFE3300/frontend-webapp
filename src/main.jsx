import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './contexts/CartContext';
import { FlyingImageProvider } from './components/animations/flying_image/FlyingImageContext.jsx';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<CartProvider>
			<FlyingImageProvider>
				<App />
			</FlyingImageProvider>
		</CartProvider>
	</StrictMode>,
)
