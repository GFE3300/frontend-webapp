import {
	getFeaturedProducts,
	getWeeklySpecial,
	getCategories,
	getTestimonials
} from '../utils/mockProducts';

export const fetchFeaturedProducts = getFeaturedProducts;
export const fetchWeeklySpecial = getWeeklySpecial;
export const fetchCategories = getCategories;
export const fetchTestimonials = getTestimonials;

// REAL ONE

import axios from 'axios';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useAuth } from '../contexts/AuthContext';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';

const api = axios.create({
	baseURL,
	timeout: 10000,
	withCredentials: true, // For future cookie-based auth
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
	}
});

// Request queue for token refresh flow
let isRefreshing = false;
let failedRequests = [];

const processQueue = (error, token = null) => {
	failedRequests.forEach(prom => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedRequests = [];
};

// Request interceptor for auth token
api.interceptors.request.use(async (config) => {
	const token = localStorage.getItem('accessToken');

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
}, (error) => {
	return Promise.reject(error);
});

// Response interceptor for token refresh
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		const { logout } = useAuth();

		// Handle token expiration
		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedRequests.push({ resolve, reject });
				}).then(() => api(originalRequest))
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const refreshToken = localStorage.getItem('refreshToken');
				if (!refreshToken) throw new Error('No refresh token');

				const { data } = await axios.post(`${baseURL}auth/refresh/`, {
					refresh: refreshToken
				});

				localStorage.setItem('accessToken', data.access);
				api.defaults.headers.Authorization = `Bearer ${data.access}`;

				processQueue(null, data.access);
				return api(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError, null);
				logout();
				window.location.href = '/login';
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		// Normal error handling
		const processedError = {
			...error,
			message: getErrorMessage(error),
			status: error.response?.status || 500
		};

		return Promise.reject(processedError);
	}
);

// Helper methods for common operations
const apiService = {
	get: (url, params, config = {}) => api.get(url, { ...config, params }),
	post: (url, data, config) => api.post(url, data, config),
	put: (url, data, config) => api.put(url, data, config),
	delete: (url, config) => api.delete(url, config),
	createCancelToken: () => axios.CancelToken.source()
};

export default apiService;