import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';

export const apiInstance = axios.create({ 
	baseURL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
	}
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
	failedQueue.forEach(prom => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

// Use apiInstance for interceptors
apiInstance.interceptors.request.use(
	config => {
		const token = localStorage.getItem('accessToken');
		if (token) {
			config.headers['Authorization'] = 'Bearer ' + token;
		}
		return config;
	},
	error => {
		return Promise.reject(error);
	}
);

apiInstance.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise(function (resolve, reject) {
					failedQueue.push({ resolve, reject });
				})
					.then(token => {
						originalRequest.headers['Authorization'] = 'Bearer ' + token;
						return apiInstance(originalRequest); // Use apiInstance
					})
					.catch(err => {
						return Promise.reject(err);
					});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const refreshToken = localStorage.getItem('refreshToken');
			if (!refreshToken) {
				isRefreshing = false;
				return Promise.reject(new Error("No refresh token available."));
			}

			try {
				const rs = await axios.post(`${baseURL}auth/refresh/`, { // Use axios directly for refresh to avoid interceptor loop
					refresh: refreshToken,
				});
				const { access } = rs.data;
				localStorage.setItem('accessToken', access);
				apiInstance.defaults.headers.common['Authorization'] = 'Bearer ' + access; // Set on apiInstance
				originalRequest.headers['Authorization'] = 'Bearer ' + access;
				processQueue(null, access);
				return apiInstance(originalRequest); // Use apiInstance
			} catch (_error) {
				processQueue(_error, null);
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
				return Promise.reject(_error);
			} finally {
				isRefreshing = false;
			}
		}
		return Promise.reject(error);
	}
);

// apiService still uses apiInstance internally
const apiService = {
	get: (url, params, config = {}) => apiInstance.get(url, { ...config, params }),
	post: (url, data, config) => apiInstance.post(url, data, config),
	put: (url, data, config) => apiInstance.put(url, data, config),
	delete: (url, config) => apiInstance.delete(url, config),
	registerUserAndBusiness: (data) => apiInstance.post('auth/register/', data),
};

export default apiService;