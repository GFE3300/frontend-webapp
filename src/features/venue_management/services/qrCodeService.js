import apiService from '../../../services/api'; // Assuming apiService is correctly set up

/**
 * Fetches a QR code image blob from the backend for a specific layout item (table).
 * @param {object} table - The table item object, must contain an 'id' (which is the LayoutItem UUID).
 * @returns {Promise<Blob>} A promise that resolves with the image blob if successful.
 * @throws {Error} If the API call fails or table.id is missing.
 */
export const generateQrCode = async (table) => { // qrColor and bgColor parameters removed
    if (!table || !table.id) {
        const errMsg = "generateQrCode: table object or table.id is missing.";
        console.error(errMsg, table);
        // Consistently throw an error object that might be caught by the caller.
        const error = new Error("Invalid table data provided for QR code generation.");
        return Promise.reject(error);
    }

    try {
        // The apiService.fetchTableItemQrCode will call the backend endpoint.
        // It's expected to handle the actual GET request and return the blob directly.
        console.log(`qrCodeService: Calling apiService.fetchTableItemQrCode for table ID: ${table.id}`);
        const imageBlob = await apiService.fetchTableItemQrCode(table.id); // No color params passed

        if (imageBlob instanceof Blob) {
            console.log(`qrCodeService: Received blob for table ID ${table.id}. Type: ${imageBlob.type}, Size: ${imageBlob.size}`);
            return imageBlob;
        } else {
            // This case should ideally not be hit if apiService.fetchTableItemQrCode correctly returns a blob or throws
            const errMsg = 'generateQrCode: Unexpected response from API service. Expected Blob.';
            console.error(errMsg, imageBlob);
            throw new Error(errMsg);
        }
    } catch (error) {
        // Log the error for debugging purposes. The error should ideally be
        // an instance of Error, possibly augmented by Axios/apiService with response details.
        // The error from apiService.fetchTableItemQrCode is already quite descriptive.
        console.error(`qrCodeService: Error fetching QR code for item ID ${table.id}:`, error.message || error);

        // Re-throw the error so it can be handled by the calling component (e.g., useQrCodeManager).
        // No need to re-wrap if apiService already provides a good error object.
        throw error;
    }
};

// constructQrDataValue utility is confirmed removed as the backend now handles QR data string construction.