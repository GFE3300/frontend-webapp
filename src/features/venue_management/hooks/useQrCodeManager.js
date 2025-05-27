// src/features/venue_management/hooks/useQrCodeManager.js
import { useState, useCallback, useEffect } from 'react';
import { generateQrCode as fetchQrApi } from '../services/qrCodeService';
import { constructQrDataValue, downloadBlob } from '../utils/commonUtils';

// Check if IS_BACKEND_QR_ENABLED is accessible here, or assume based on error message.
// For simplicity, we'll check the error message.
const BACKEND_DISABLED_MESSAGE_PART = "backend is disabled";

const useQrCodeManager = (openAlertModal) => {
    const [qrImageUrls, setQrImageUrls] = useState({}); // { [tableId]: 'blob:url' | 'error' | 'skipped' | 'loading' }
    const [qrLoadingStates, setQrLoadingStates] = useState({});
    const [qrFetchAttempts, setQrFetchAttempts] = useState({});

    const MAX_SILENT_RETRIES = 1;

    const setQrStatus = useCallback((tableId, status, url = null) => {
        setQrImageUrls(prev => ({ ...prev, [tableId]: status === 'url' ? url : status }));
        setQrLoadingStates(prev => ({ ...prev, [tableId]: status === 'loading' }));
    }, []);

    const fetchQrCodeForTable = useCallback(async (table, qrColor = 'black', bgColor = 'white', isRetry = false) => {
        if (!table || !table.id) {
            console.warn("fetchQrCodeForTable: Invalid table or table.id", table);
            return null;
        }

        const currentAttempt = (qrFetchAttempts[table.id] || 0) + 1;
        setQrFetchAttempts(prev => ({ ...prev, [table.id]: currentAttempt }));
        setQrStatus(table.id, 'loading');

        const dataStr = constructQrDataValue(table);

        try {
            const imageBlob = await fetchQrApi(dataStr, qrColor, bgColor);
            const imageUrl = URL.createObjectURL(imageBlob);
            setQrStatus(table.id, 'url', imageUrl);
            setQrFetchAttempts(prev => ({ ...prev, [table.id]: 0 }));
            return imageBlob;
        } catch (error) {
            const errorMessage = error.message || 'Failed to fetch. Check backend.';
            console.error(`Error/Info fetching QR for T${table.number ?? 'N/A'} (Attempt ${currentAttempt}):`, errorMessage, error.data || error);

            if (errorMessage.includes(BACKEND_DISABLED_MESSAGE_PART)) {
                setQrStatus(table.id, 'skipped'); // New status for when backend is off
                // Optionally, show a one-time info alert if desired, or none if this is expected.
                // if (openAlertModal && !isRetry) { // Avoid repeated alerts
                //    openAlertModal("QR Info", `QR code generation is currently offline.`, "info");
                // }
            } else {
                setQrStatus(table.id, 'error'); // Actual fetch error
                if (openAlertModal && currentAttempt <= MAX_SILENT_RETRIES) {
                    const errorTitle = error.status ? `QR Error (HTTP ${error.status})` : "Network Error";
                    openAlertModal(errorTitle, `QR for T${table.number ?? 'N/A'}: ${errorMessage}`, "error");
                }
            }
            return null;
        }
    }, [qrFetchAttempts, openAlertModal, setQrStatus]);

    const downloadSingleQr = useCallback(async (table, qrColor = "red", bgColor = "blue") => {
        if (!table || !table.id) {
            if (openAlertModal) openAlertModal("Download Error", "Invalid table data for QR download.", "error");
            return;
        }

        const currentStatus = qrImageUrls[table.id];
        if (currentStatus === 'skipped' || currentStatus === 'error') {
            if (openAlertModal) openAlertModal("QR Not Available", `QR code for Table ${table.number ?? 'N_A'} cannot be downloaded as it's currently unavailable or the backend is offline.`, "info");
            return;
        }

        let imageBlob;
        if (currentStatus && currentStatus.startsWith('blob:') && !qrLoadingStates[table.id]) {
            try {
                const response = await fetch(currentStatus);
                imageBlob = await response.blob();
            } catch (e) {
                console.warn("Could not refetch existing blob, fetching new QR for download.", e);
                imageBlob = await fetchQrCodeForTable(table, qrColor, bgColor, true);
            }
        } else {
            imageBlob = await fetchQrCodeForTable(table, qrColor, bgColor, true);
        }

        if (imageBlob) {
            downloadBlob(imageBlob, `table-${table.number ?? 'N_A'}-qr.png`);
        } else if (qrImageUrls[table.id] !== 'skipped') { // Don't show error if skipped
            if (openAlertModal) openAlertModal("Download Error", `Could not download QR for Table ${table.number ?? 'N_A'}. Ensure it can be generated.`, "error");
        }
    }, [fetchQrCodeForTable, openAlertModal, qrImageUrls, qrLoadingStates]);

    const downloadAllQrs = useCallback(async (tables, qrColor = "red", bgColor = "blue") => {
        const validTables = tables.filter(t => t && t.id && typeof t.number === 'number');
        if (validTables.length === 0) {
            if (openAlertModal) openAlertModal("No QR Codes", "There are no tables with valid numbers to download QR codes for.", "info");
            return;
        }

        // Check if any table will actually attempt a download
        const canDownloadAny = validTables.some(table => qrImageUrls[table.id] !== 'skipped' && qrImageUrls[table.id] !== 'error');
        if (!canDownloadAny && validTables.every(table => qrImageUrls[table.id] === 'skipped' || qrImageUrls[table.id] === 'error')) {
            if (openAlertModal) openAlertModal("QR Not Available", "All QR codes are currently unavailable or the backend is offline.", "info");
            return;
        }

        if (openAlertModal) openAlertModal("Download Starting", `Preparing to download available QR code(s). This may take a moment.`, "info");

        const sortedTables = [...validTables].sort((a, b) => (a.number || 0) - (b.number || 0));
        let downloadedCount = 0;

        for (const table of sortedTables) {
            if (qrImageUrls[table.id] === 'skipped' || qrImageUrls[table.id] === 'error') {
                console.log(`Skipping download for Table ${table.number ?? 'N_A'} as QR is unavailable/skipped.`);
                continue;
            }
            await new Promise(resolve => setTimeout(resolve, 300));
            const imageBlob = await fetchQrCodeForTable(table, qrColor, bgColor, true);
            if (imageBlob) {
                downloadBlob(imageBlob, `table-${table.number ?? 'N_A'}-qr.png`);
                downloadedCount++;
            } else {
                console.warn(`Could not fetch blob for table ${table.number ?? 'N_A'} (ID: ${table.id}) to download.`);
            }
        }
        if (openAlertModal && downloadedCount < validTables.length && downloadedCount > 0) {
            openAlertModal("Download Partial", `Successfully downloaded ${downloadedCount} QR codes. Some were unavailable.`, "warning");
        } else if (downloadedCount === 0 && validTables.length > 0 && !validTables.every(t => qrImageUrls[t.id] === 'skipped')) {
            // Only show "all failed" if none were explicitly "skipped" from the start
            openAlertModal("Download Failed", "No QR codes could be downloaded at this time.", "error");
        }


    }, [fetchQrCodeForTable, openAlertModal, qrImageUrls]);

    // ... (revokeQrUrl, clearQrDataForTable, clearAllQrData, useEffect cleanup remain the same) ...
    const revokeQrUrl = useCallback((tableId) => {
        const url = qrImageUrls[tableId];
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    }, [qrImageUrls]);

    const clearQrDataForTable = useCallback((tableId) => {
        revokeQrUrl(tableId);
        setQrImageUrls(prev => { const n = { ...prev }; delete n[tableId]; return n; });
        setQrLoadingStates(prev => { const n = { ...prev }; delete n[tableId]; return n; });
        setQrFetchAttempts(prev => { const n = { ...prev }; delete n[tableId]; return n; });
    }, [revokeQrUrl]);

    const clearAllQrData = useCallback(() => {
        Object.keys(qrImageUrls).forEach(id => revokeQrUrl(id));
        setQrImageUrls({});
        setQrLoadingStates({});
        setQrFetchAttempts({});
    }, [qrImageUrls, revokeQrUrl]);

    useEffect(() => {
        return () => {
            Object.values(qrImageUrls).forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [qrImageUrls]);


    return {
        qrImageUrls,
        qrLoadingStates,
        qrFetchAttempts,
        fetchQrCodeForTable,
        downloadSingleQr,
        downloadAllQrs,
        clearQrDataForTable,
        clearAllQrData,
        getQrStatus: (tableId) => ({ url: qrImageUrls[tableId], loading: qrLoadingStates[tableId], status: qrImageUrls[tableId] }), // Pass full status
    };
};

export default useQrCodeManager;