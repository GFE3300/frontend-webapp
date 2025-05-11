import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
	envPrefix: 'VITE_',
	plugins: [
		tailwindcss(),
		react(),
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					googlemaps: ['@googlemaps/js-api-loader'],
					maps: [
						'./src/components/maps/MapView',
						'./src/components/maps/GeolocateButton'
					]
				}
			}
		}
	}
})