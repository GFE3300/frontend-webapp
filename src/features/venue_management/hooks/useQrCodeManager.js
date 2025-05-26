// src/features/venue_management/hooks/useQrCodeManager.js
import { useState, useCallback, useEffect } from 'react';
import { generateQrCode as fetchQrApi } from '../services/qrCodeService';
import { constructQrDataValue, downloadBlob } from '../utils/commonUtils';

const useQrCodeManager = (openAlertModal) => {
    const [qrImageUrls, setQrImageUrls] = useState({}); // { [tableId]: 'blob:url' | 'error' | 'loading' }
    const [qrLoadingStates, setQrLoadingStates] = useState({}); // { [tableId]: boolean } - more explicit loading
    const [qrFetchAttempts, setQrFetchAttempts] = useState({}); // { [tableId]: number }

    const MAX_SILENT_RETRIES = 1; // Max attempts before showing an error modal for the same table

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
            setQrFetchAttempts(prev => ({ ...prev, [table.id]: 0 })); // Reset attempts on success
            return imageBlob;
        } catch (error) {
            console.error(`Error fetching QR for T${table.number ?? 'N/A'} (Attempt ${currentAttempt}):`, error.message, error.data || error);
            setQrStatus(table.id, 'error');

            // Only show modal if openAlertModal is provided and it's not a silent retry or retries exceeded
            if (openAlertModal && currentAttempt <= MAX_SILENT_RETRIES) {
                const errorTitle = error.status ? `QR Error (HTTP ${error.status})` : "Network Error";
                const errorMessage = `QR for T${table.number ?? 'N/A'}: ${error.message || 'Failed to fetch. Check backend.'}`;
                openAlertModal(errorTitle, errorMessage, "error");
            }
            return null;
        }
    }, [qrFetchAttempts, openAlertModal, setQrStatus]);


    const downloadSingleQr = useCallback(async (table, qrColor = "red", bgColor = "blue") => { // Default colors from original LayoutDesigner
        if (!table || !table.id) {
            if (openAlertModal) openAlertModal("Download Error", "Invalid table data for QR download.", "error");
            return;
        }

        // Check if we already have a valid URL (optional: could always refetch for download for consistency)
        let imageBlob;
        if (qrImageUrls[table.id] && qrImageUrls[table.id].startsWith('blob:') && !qrLoadingStates[table.id]) {
            try {
                const response = await fetch(qrImageUrls[table.id]);
                imageBlob = await response.blob();
            } catch (e) {
                // If fetching existing blob URL fails, proceed to refetch
                console.warn("Could not refetch existing blob, fetching new QR for download.", e);
                imageBlob = await fetchQrCodeForTable(table, qrColor, bgColor, true); // isRetry = true to potentially suppress modal
            }
        } else {
            imageBlob = await fetchQrCodeForTable(table, qrColor, bgColor, true); // isRetry = true
        }

        if (imageBlob) {
            downloadBlob(imageBlob, `table-${table.number ?? 'N_A'}-qr.png`);
        } else {
            if (openAlertModal) openAlertModal("Download Error", `Could not download QR for Table ${table.number ?? 'N_A'}. Ensure it can be generated.`, "error");
        }
    }, [fetchQrCodeForTable, openAlertModal, qrImageUrls, qrLoadingStates]);

    const downloadAllQrs = useCallback(async (tables, qrColor = "red", bgColor = "blue") => {
        const validTables = tables.filter(t => t && t.id && typeof t.number === 'number');
        if (validTables.length === 0) {
            if (openAlertModal) openAlertModal("No QR Codes", "There are no tables with valid numbers to download QR codes for.", "info");
            return;
        }
        if (openAlertModal) openAlertModal("Download Starting", `Preparing to download ${validTables.length} QR code(s). This may take a moment.`, "info");

        const sortedTables = [...validTables].sort((a, b) => (a.number || 0) - (b.number || 0));

        for (const table of sortedTables) {
            // Slight delay between downloads can help with browser handling multiple downloads
            await new Promise(resolve => setTimeout(resolve, 300));
            const imageBlob = await fetchQrCodeForTable(table, qrColor, bgColor, true); // isRetry = true
            if (imageBlob) {
                downloadBlob(imageBlob, `table-${table.number ?? 'N_A'}-qr.png`);
            } else {
                console.warn(`Could not fetch blob for table ${table.number ?? 'N_A'} (ID: ${table.id}) to download.`);
                // Optionally, notify user about specific failures after loop if openAlertModal is available
            }
        }
    }, [fetchQrCodeForTable, openAlertModal]);

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

    // Cleanup effect to revoke URLs when component unmounts or tables change significantly
    useEffect(() => {
        // This effect is tricky because `qrImageUrls` is a dependency.
        // A more robust cleanup might be tied to the lifecycle of `designedTables` in LayoutDesigner.
        // For now, the explicit `clearAllQrData` or `clearQrDataForTable` is more reliable.
        return () => {
            Object.values(qrImageUrls).forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [qrImageUrls]); // Be cautious with this dependency array if it causes too many re-runs.

    return {
        qrImageUrls,
        qrLoadingStates,
        qrFetchAttempts, // Mostly for internal use or debugging
        fetchQrCodeForTable,
        downloadSingleQr,
        downloadAllQrs,
        clearQrDataForTable,
        clearAllQrData,
        getQrStatus: (tableId) => ({ url: qrImageUrls[tableId], loading: qrLoadingStates[tableId] }),
    };
};

export default useQrCodeManager;