// src/features/venue_management/services/qrCodeService.js

// This should ideally come from a global config or environment variable
const API_BASE_URL = 'http://127.0.0.1:5001';

export const generateQrCode = async (dataStr, qrColor = 'black', bgColor = 'white') => {
    const queryParams = new URLSearchParams({ data: dataStr, qrColor, bgColor }).toString();

    try {
        const response = await fetch(`${API_BASE_URL}/generate-qr?${queryParams}`);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { detail: `HTTP error ${response.status}: ${response.statusText}` };
            }
            // Throw an object that includes status for better error handling upstream
            throw {
                status: response.status,
                message: errorData.detail || `Failed to fetch QR code. Status: ${response.statusText}`,
                data: errorData
            };
        }

        const imageBlob = await response.blob();
        return imageBlob;

    } catch (error) {
        // If it's an error we threw, re-throw it to preserve status and structured message
        if (error.status) {
            throw error;
        }
        // For network errors or other unexpected issues
        console.error('Network or unexpected error in generateQrCode service:', error);
        throw {
            status: null, // Indicates a network or non-HTTP error
            message: error.message || 'A network error occurred while fetching the QR code.',
            data: null
        };
    }
};