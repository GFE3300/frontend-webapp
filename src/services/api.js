// src/services/api.js
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

// ... (existing interceptors: apiInstance.interceptors.request.use, apiInstance.interceptors.response.use) ...
// Ensure your interceptors correctly handle token refresh and don't interfere with FormData Content-Type.
// The current request interceptor correctly skips Authorization header attachment if 'X-Bypass-Auth-Interceptor' is set.
// For FormData requests, Content-Type is usually set by the browser, so avoid overriding it in the interceptor
// unless it's for 'application/json' specifically. Your current interceptor seems fine as it only adds Auth.

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

apiInstance.interceptors.request.use(
    config => {
        if (config.headers && config.headers['X-Bypass-Auth-Interceptor']) {
            delete config.headers['X-Bypass-Auth-Interceptor']; 
            return config;
        }

        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        // For FormData, Content-Type is set automatically by Axios/browser.
        // Avoid overriding it here unless 'application/json' is explicitly intended for all other cases.
        // The default apiInstance headers already set Content-Type to application/json.
        // If a request passes a specific Content-Type in its config, it should be used.
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

        if (originalRequest.headers && originalRequest.headers['X-Bypass-Auth-Interceptor-Original']) {
             delete originalRequest.headers['X-Bypass-Auth-Interceptor-Original'];
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return apiInstance(originalRequest);
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
                // Notify AuthContext or redirect to login
                // Example: window.dispatchEvent(new Event('auth-error-needs-logout'));
                const noRefreshError = new Error("No refresh token available. Please log in again.");
                noRefreshError.isAxiosError = true;
                noRefreshError.config = originalRequest;
                noRefreshError.requiresLogout = true; // Custom flag
                return Promise.reject(noRefreshError);
            }

            try {
                const rs = await axios.post(`${baseURL}auth/refresh/`, {
                    refresh: refreshToken,
                });
                const { access } = rs.data;
                localStorage.setItem('accessToken', access);
                
                // Update the Authorization header for the original request and subsequent default for apiInstance
                apiInstance.defaults.headers.common['Authorization'] = 'Bearer ' + access;
                originalRequest.headers['Authorization'] = 'Bearer ' + access;
                
                processQueue(null, access);
                return apiInstance(originalRequest);
            } catch (_error) {
                processQueue(_error, null);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                // Notify AuthContext or redirect to login
                // Example: window.dispatchEvent(new Event('auth-error-needs-logout'));
                _error.isRefreshError = true; 
                _error.requiresLogout = true; // Custom flag
                return Promise.reject(_error);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);


const apiService = {
    get: (url, params, config = {}) => apiInstance.get(url, { ...config, params }),
    post: (url, data, config) => apiInstance.post(url, data, config),
    put: (url, data, config) => apiInstance.put(url, data, config),
    patch: (url, data, config) => apiInstance.patch(url, data, config),
    delete: (url, config) => apiInstance.delete(url, config),

    registerUserAndBusiness: (data) => {
        return apiInstance.post('auth/register/', data, {
            headers: {
                'X-Bypass-Auth-Interceptor': true,
                'X-Bypass-Auth-Interceptor-Original': true // Add this if you want the response interceptor to also bypass
            }
        });
    },

    uploadUserProfileImage: (file) => {
        const formData = new FormData();
        formData.append('profile_image', file);
        return apiInstance.put('accounts/user/profile-image/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    uploadBusinessLogo: (businessId, file) => {
        const formData = new FormData();
        formData.append('logo', file);
        return apiInstance.put(`businesses/${businessId}/logo/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    uploadProductImage: (productId, file) => {
        const formData = new FormData();
        formData.append('image', file);
        return apiInstance.post(`products/${productId}/upload-image/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Axios will set this with boundary for FormData
            },
        });
    },

    deleteProductImage: (productId) => {
        return apiInstance.delete(`products/${productId}/delete-image/`);
    },
};

export default apiService;