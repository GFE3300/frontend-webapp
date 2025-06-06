import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';

export const apiInstance = axios.create({
    baseURL,
    timeout: 10000, // Increased timeout slightly for potentially larger layout data
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
                const noRefreshError = new Error("No refresh token available. Please log in again.");
                noRefreshError.isAxiosError = true; // Custom property
                noRefreshError.config = originalRequest;
                noRefreshError.requiresLogout = true; // Custom property for AuthContext
                return Promise.reject(noRefreshError);
            }

            try {
                const rs = await axios.post(`${baseURL}auth/refresh/`, {
                    refresh: refreshToken,
                });
                const { access } = rs.data;
                localStorage.setItem('accessToken', access);

                // Update default header for subsequent apiInstance calls
                apiInstance.defaults.headers.common['Authorization'] = 'Bearer ' + access;
                // Update header for the current retried request
                originalRequest.headers['Authorization'] = 'Bearer ' + access;

                processQueue(null, access);
                return apiInstance(originalRequest);
            } catch (_error) {
                processQueue(_error, null);
                // It's crucial to inform the AuthContext or similar to perform a full logout
                // if refresh fails. This can be done by a custom property on the error.
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                delete apiInstance.defaults.headers.common['Authorization']; // Clear auth header
                _error.isRefreshError = true; // Custom property
                _error.requiresLogout = true; // Custom property for AuthContext
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
                'X-Bypass-Auth-Interceptor': true, // To prevent attaching possibly non-existent token
                'X-Bypass-Auth-Interceptor-Original': true // To prevent retry logic on 401 for this specific call
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
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    deleteProductImage: (productId) => {
        return apiInstance.delete(`products/${productId}/delete-image/`);
    },

    // --- Venue Layout Management API Signatures ---
    /**
     * Fetches the active venue layout for the current user's active business.
     * @returns {Promise<AxiosResponse<object>>} The Axios response object containing venue layout data.
     */
    getActiveVenueLayout: async () => {
        try {
            console.log("[API SERVICE] Attempting to fetch active venue layout from /api/venue/layout/active/");
            const response = await apiInstance.get('venue/layout/active/');
            console.log("[API SERVICE] Active venue layout fetched successfully. Status:", response.status);
            return response; // Consumers can access response.data
        } catch (error) {
            console.error("[API SERVICE] Error fetching active venue layout:", error.response?.data || error.message || error);
            throw error;
        }
    },

    /**
     * Saves the active venue layout for the current user's active business.
     * @param {object} layoutData - The complete layout data to save.
     *        Should include: name, grid_rows, grid_cols, grid_subdivision, items.
     *        Items should have base properties and item_specific_props nested.
     * @returns {Promise<AxiosResponse<object>>} The Axios response object containing the saved venue layout data.
     */
    saveActiveVenueLayout: async (layoutData) => {
        try {
            // Using JSON.parse(JSON.stringify()) for logging ensures circular references are handled if any, and object is fully resolved.
            console.log("[API SERVICE] Attempting to save active venue layout to /api/venue/layout/active/. Data snapshot:", JSON.parse(JSON.stringify(layoutData)));
            const response = await apiInstance.put('venue/layout/active/', layoutData);
            console.log("[API SERVICE] Active venue layout saved successfully. Status:", response.status);
            return response; // Consumers can access response.data
        } catch (error) {
            console.error("[API SERVICE] Error saving active venue layout:", error.response?.data || error.message || error);
            throw error;
        }
    },

    /**
     * Fetches a QR code image for a specific table layout item.
     * @param {string} itemId - The UUID of the layout item (table).
     * @returns {Promise<Blob>} A promise that resolves with the image blob.
     * @throws {Error} If the API call fails or itemId is missing.
     */
    fetchTableItemQrCode: async (itemId) => {
        if (!itemId) {
            const errMsg = "[API SERVICE] fetchTableItemQrCode: itemId is required.";
            console.error(errMsg);
            return Promise.reject(new Error(errMsg));
        }
        try {
            console.log(`[API SERVICE] Attempting to fetch QR code for itemId: ${itemId} from /api/venue/layout-item/${itemId}/qr-code/`);
            const response = await apiInstance.get(`venue/layout-item/${itemId}/qr-code/`, {
                responseType: 'blob'
            });
            console.log(`[API SERVICE] QR code for itemId ${itemId} fetched. Type: ${response.data?.type}, Size: ${response.data?.size}`);
            return response.data;
        } catch (error) {
            let errorMessage = `[API SERVICE] Failed to fetch QR for item ${itemId}.`;
            if (error.response) {
                if (error.response.data instanceof Blob && error.response.data.type === 'application/json') {
                    try {
                        const errorJsonText = await error.response.data.text();
                        const errorJson = JSON.parse(errorJsonText);
                        errorMessage += ` Server error: ${errorJson.detail || errorJson.message || errorJsonText}`;
                    } catch (e) {
                        console.error("[API SERVICE] Failed to parse blob error response:", e);
                        errorMessage += ` Server returned an error (could not parse blob response). Status: ${error.response.status}.`;
                    }
                } else if (error.response.data?.detail) {
                    errorMessage += ` Server error: ${error.response.data.detail}.`;
                } else if (error.response.data?.message) {
                    errorMessage += ` Server error: ${error.response.data.message}.`;
                } else {
                    errorMessage += ` Server responded with status ${error.response.status}.`;
                }
            } else if (error.request) {
                errorMessage += ' No response received from server.';
            } else {
                errorMessage += ` Error: ${error.message || 'Unknown error'}.`;
            }
            console.error(`[API SERVICE] Error fetching QR code for itemId ${itemId}. Full error: `, error, "Constructed message:", errorMessage);

            const customError = new Error(errorMessage);
            customError.status = error.response?.status;
            customError.originalError = error;
            throw customError;
        }
    },

    /**
     * Fetches products for the admin menu preview.
     * The backend should scope this to the authenticated user's active business.
     * Requests only active products.
     * @returns {Promise<AxiosResponse<object>>} The Axios response containing product data.
     */
    getAdminMenuPreviewProducts: async () => {
        try {
            // console.log("[API SERVICE] Fetching admin menu preview products (active=true by default).");
            // Backend should scope by user's active business via token.
            // The endpoint /products/ should support an `is_active` filter.
            const response = await apiInstance.get('products/', { params: { is_active: 'true' } });
            // console.log("[API SERVICE] Admin menu preview products fetched successfully. Status:", response.status, "Data:", response.data);
            return response; // Return full Axios response for useQuery
        } catch (error) {
            console.error("[API SERVICE] Error fetching admin menu preview products:", error.response?.data || error.message || error);
            throw error; // TanStack Query will handle this error
        }
    },
};

export default apiService;