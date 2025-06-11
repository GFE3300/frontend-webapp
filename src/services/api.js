import axios from 'axios';
import i18n from '../i18n';

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


apiInstance.interceptors.request.use(async (config) => {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add Accept-Language header to every request
    const currentLanguage = i18n.language;
    if (currentLanguage) {
        // Send the primary language subtag (e.g., 'en' from 'en-US')
        config.headers['Accept-Language'] = currentLanguage.split('-')[0];
    }

    return config;
});


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
    get: (url, config) => apiInstance.get(url, config),
    post: (url, data, config) => apiInstance.post(url, data, config),
    put: (url, data, config) => apiInstance.put(url, data, config),
    patch: (url, data, config) => apiInstance.patch(url, data, config),
    delete: (url, config) => apiInstance.delete(url, config),

    updateCurrentUser: (data) => {
        return apiInstance.patch('/auth/user/', data);
    },

    registerUserAndBusiness: (data) => {
        return apiInstance.post('auth/register/', data, {
            headers: {
                'X-Bypass-Auth-Interceptor': true, // To prevent attaching possibly non-existent token
                'X-Bypass-Auth-Interceptor-Original': true // To prevent retry logic on 401 for this specific call
            }
        });
    },

    /**
     * Validates a registration field for uniqueness against the backend.
     * @param {string} fieldName - The name of the field to validate (e.g., 'email', 'business_username').
     * @param {string} value - The value of the field to validate.
     * @returns {Promise<AxiosResponse<object>>} The Axios response object containing validation result.
     */
    validateRegistrationField: (fieldName, value) => {
        return apiInstance.post('auth/validate-field/', {
            field_name: fieldName,
            value: value,
        }, {
            headers: {
                // This call should be public, but bypassing the interceptor ensures no stale tokens interfere.
                'X-Bypass-Auth-Interceptor-Original': true
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
            // console.log("[API SERVICE] Attempting to fetch active venue layout from /api/venue/layout/active/");
            const response = await apiInstance.get('venue/layout/active/');
            // console.log("[API SERVICE] Active venue layout fetched successfully. Status:", response.status);
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
            // console.log("[API SERVICE] Attempting to save active venue layout to /api/venue/layout/active/. Data snapshot:", JSON.parse(JSON.stringify(layoutData)));
            const response = await apiInstance.put('venue/layout/active/', layoutData);
            // console.log("[API SERVICE] Active venue layout saved successfully. Status:", response.status);
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
            // console.log(`[API SERVICE] Attempting to fetch QR code for itemId: ${itemId} from /api/venue/layout-item/${itemId}/qr-code/`);
            const response = await apiInstance.get(`venue/layout-item/${itemId}/qr-code/`, {
                responseType: 'blob'
            });
            // console.log(`[API SERVICE] QR code for itemId ${itemId} fetched. Type: ${response.data?.type}, Size: ${response.data?.size}`);
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
            // console.error(`[API SERVICE] Error fetching QR code for itemId ${itemId}. Full error: `, error, "Constructed message:", errorMessage);

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
            throw error;
        }
    },


    // --- Payment Related API Signatures ---
    /**
     * Creates a Stripe Checkout session.
     * @param {object} checkoutPayload - Payload containing the plan identifier.
     *        e.g., { plan_name: "your_internal_plan_id" }
     * @returns {Promise<AxiosResponse<object>>} The Axios response object containing session data (e.g., session ID).
     */
    createCheckoutSession: (checkoutPayload) => {
        // console.log("[API SERVICE] Attempting to create Stripe Checkout session with payload:", checkoutPayload);
        return apiInstance.post('payments/create-checkout-session/', checkoutPayload);
    },

    /**
     * Fetches the current user's subscription status.
     * @returns {Promise<AxiosResponse<object>>} The Axios response object containing subscription data.
     */
    getSubscriptionStatus: () => {
        // console.log("[API SERVICE] Fetching subscription status from /api/payments/subscription-status/");
        return apiInstance.get('payments/subscription-status/');
    },

    /**
     * Creates a Stripe Customer Portal session.
     * @returns {Promise<AxiosResponse<object>>} The Axios response object containing the portal session URL.
     */
    createCustomerPortalSession: () => {
        // console.log("[API SERVICE] Attempting to create Stripe Customer Portal session.");
        return apiInstance.post('payments/create-customer-portal-session/');
    },

    /**
     * Fetches the real-time status of all tables for the live orders dashboard.
     * @returns {Promise<AxiosResponse<Array<object>>>} The Axios response containing an array of table statuses.
     */
    getLiveOrdersView: () => {
        return apiInstance.get('orders/live-view/');
    },

    /**
     * Updates the status or payment status of a specific order.
     * @param {string} orderId - The UUID of the order to update.
     * @param {{status?: string, payment_status?: string}} data - The payload containing the new status or payment status.
     * @returns {Promise<AxiosResponse<object>>} The Axios response.
     */
    updateOrderStatus: (orderId, data) => {
        return apiInstance.patch(`orders/${orderId}/`, data);
    },

    getCommandBarSummary: () => {
        return apiInstance.get('analytics/command-bar-summary/');
    },

    getActionItems: () => {
        return apiInstance.get('analytics/action-items/');
    },

    getProductMovers: (period = 'today') => {
        return apiInstance.get('analytics/product-movers/', { params: { period } });
    },

    /**
     * Fetches a lightweight list of active orders for the Kitchen Display System.
     * @returns {Promise<AxiosResponse<Array<object>>>}
     */
    getKitchenOrders: () => {
        return apiInstance.get('orders/kitchen-view/');
    },

    /**
     * Switches the user's active business context.
     * @param {string} businessId - The UUID of the business to switch to.
     * @returns {Promise<AxiosResponse<{access: string, refresh: string}>>}
     */
    switchBusiness: (businessId) => {
        return apiInstance.post('auth/switch-business/', { business_id: businessId });
    },

    /**
     * Fetches the list of businesses the current user is a member of.
     * @returns {Promise<AxiosResponse<Array<{id: string, name: string, role: string}>>>}
     */
    getMyBusinesses: () => {
        return apiInstance.get('businesses/');
    },

    /**
     * Creates a new business.
     * @param {object} businessData - The data for the new business (e.g., { name, username, email, etc. }).
     * @returns {Promise<AxiosResponse<object>>} The created business object, including new auth tokens.
     */
    createBusiness: (businessData) => {
        return apiInstance.post('businesses/', businessData);
    },

    /**
     * Fetches the list of team members for a specific business.
     * @param {string} businessId - The UUID of the business.
     * @returns {Promise<AxiosResponse<Array<object>>>}
     */
    getBusinessMembers: (businessId) => {
        return apiInstance.get(`businesses/${businessId}/members/`);
    },

    /**
     * Invites a new member to a business.
     * @param {string} businessId - The UUID of the business.
     * @param {{email: string, role: string}} inviteData - The invite details.
     * @returns {Promise<AxiosResponse<object>>}
     */
    inviteMember: (businessId, inviteData) => {
        return apiInstance.post(`businesses/${businessId}/invite/`, inviteData);
    },

    /**
     * Removes a team member from a business.
     * @param {string} businessId - The UUID of the business.
     * @param {string} membershipId - The UUID of the membership record to delete.
     * @returns {Promise<AxiosResponse>}
     */
    removeMember: (businessId, membershipId) => {
        return apiInstance.delete(`businesses/${businessId}/members/${membershipId}/`);
    },

    /**
     * Updates a team member's role in a business.
     * @param {string} businessId - The UUID of the business.
     * @param {string} membershipId - The UUID of the membership record to update.
     * @param {{role: string}} roleData - The new role.
     * @returns {Promise<AxiosResponse>}
     */
    updateMemberRole: (businessId, membershipId, roleData) => {
        return apiInstance.patch(`businesses/${businessId}/members/${membershipId}/role/`, roleData);
    },

    /**
     * Fetches pending invitations for a specific business.
     * @param {string} businessId - The UUID of the business.
     * @returns {Promise<AxiosResponse<Array<object>>>}
     */
    getPendingInvitations: (businessId) => {
        return apiInstance.get(`businesses/${businessId}/invitations/`);
    },

    /**
     * Resends a pending invitation.
     * @param {string} businessId - The UUID of the business.
     * @param {string} invitationId - The UUID of the invitation to resend.
     * @returns {Promise<AxiosResponse>}
     */
    resendInvitation: (businessId, invitationId) => {
        return apiInstance.post(`businesses/${businessId}/invitations/${invitationId}/resend/`);
    },

    /**
     * Revokes (deletes) a pending invitation.
     * @param {string} businessId - The UUID of the business.
     * @param {string} invitationId - The UUID of the invitation to revoke.
     * @returns {Promise<AxiosResponse>}
     */
    revokeInvitation: (businessId, invitationId) => {
        return apiInstance.delete(`businesses/${businessId}/invitations/${invitationId}/`);
    },

    /**
     * Accepts an invitation to join a business.
     * @param {{token: string, password?: string}} payload - The invitation token and optional password for new users.
     * @returns {Promise<AxiosResponse<object>>} The response, which may include auth tokens for new users.
     */
    acceptInvitation: (payload) => {
        return apiInstance.post('auth/accept-invite/', payload, {
            headers: { 'X-Bypass-Auth-Interceptor-Original': true }
        });
    },

    /**
     * Fetches information about an invitation using its token. (Assumed endpoint for pre-flight check)
     * @param {string} token - The invitation token.
     * @returns {Promise<AxiosResponse<object>>}
     */
    getInvitationInfoByToken: (token) => {
        return apiInstance.get(`auth/invitation-info/${token}/`, {
            headers: { 'X-Bypass-Auth-Interceptor-Original': true }
        });
    },
    getContextPermissions: () => apiInstance.get('businesses/context-permissions/'),
};

export default apiService;