// src/features/venue_management/services/qrCodeService.js

// This should ideally come from a global config or environment variable
const API_BASE_URL = 'http://127.0.0.1:5001';
const IS_BACKEND_QR_ENABLED = false; // <--- SET THIS TO false FOR NOW

export const generateQrCode = async (dataStr, qrColor = 'black', bgColor = 'white') => {
    if (!IS_BACKEND_QR_ENABLED) {
        console.warn("QR Code generation is in frontend-only mode. No backend call will be made.");
        // Option 1: Simulate an error or "not available" state
        return Promise.reject({
            status: null, // Or a specific status like 'SKIPPED'
            message: 'QR generation backend is disabled in frontend-only mode.',
            data: { detail: 'Backend QR service is not enabled.' }
        });

        // Option 2: Return a placeholder image Blob (more involved, needs a canvas or library)
        // For now, let's stick to Option 1 for simplicity to focus on core layout bugs.
        // Example for placeholder (if you had a function to create a placeholder image):
        // const placeholderBlob = await createPlaceholderQrBlob(dataStr);
        // return placeholderBlob;
    }

    // Original fetch logic (only runs if IS_BACKEND_QR_ENABLED is true)
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
            throw {
                status: response.status,
                message: errorData.detail || `Failed to fetch QR code. Status: ${response.statusText}`,
                data: errorData
            };
        }

        const imageBlob = await response.blob();
        return imageBlob;

    } catch (error) {
        if (error.status) {
            throw error;
        }
        console.error('Network or unexpected error in generateQrCode service:', error);
        throw {
            status: null,
            message: error.message || 'A network error occurred while fetching the QR code.',
            data: null
        };
    }
};

// Example placeholder function (if you chose Option 2 above)
// async function createPlaceholderQrBlob(dataStr) {
//     return new Promise(resolve => {
//         const canvas = document.createElement('canvas');
//         canvas.width = 128;
//         canvas.height = 128;
//         const ctx = canvas.getContext('2d');
//         if (ctx) {
//             ctx.fillStyle = 'lightgray';
//             ctx.fillRect(0, 0, 128, 128);
//             ctx.fillStyle = 'black';
//             ctx.textAlign = 'center';
//             ctx.font = '10px Arial';
//             ctx.fillText('QR Placeholder', 64, 60);
//             ctx.fillText(dataStr.substring(0, 15) + "...", 64, 75);
//         }
//         canvas.toBlob(blob => resolve(blob), 'image/png');
//     });
// }