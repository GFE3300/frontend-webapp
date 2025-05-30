// src/features/venue_management/hooks/useQrCodeManager.js
import { useState, useCallback, useEffect } from 'react';
import { generateQrCode as fetchQrApi } from '../services/qrCodeService'; // This now takes only 'table'
import { downloadBlob } from '../utils/commonUtils'; // constructQrDataValue is no longer used here

// Check if IS_BACKEND_QR_ENABLED is accessible here, or assume based on error message.
// For simplicity, we'll check the error message.
const BACKEND_DISABLED_MESSAGE_PART = "QR code generation endpoint not implemented"; // Updated based on apiService simulation
const GENERAL_FAILURE_MESSAGE_PART = "Failed to fetch QR"; // General failure part

const useQrCodeManager = (openAlertModal) => {
    const [qrImageUrls, setQrImageUrls] = useState({}); // { [tableId]: 'blob:url' | 'error' | 'skipped' | 'loading' }
    const [qrLoadingStates, setQrLoadingStates] = useState({});
    const [qrFetchAttempts, setQrFetchAttempts] = useState({});

    const MAX_SILENT_RETRIES = 1; // This can be 0 if we want to alert on first failure.

    const setQrStatus = useCallback((tableId, status, url = null) => {
        setQrImageUrls(prev => ({ ...prev, [tableId]: status === 'url' ? url : status }));
        setQrLoadingStates(prev => ({ ...prev, [tableId]: status === 'loading' }));
    }, []);

    const fetchQrCodeForTable = useCallback(async (table, isRetry = false) => {
        if (!table || !table.id) {
            console.warn("fetchQrCodeForTable: Invalid table or table.id", table);
            return null;
        }

        const currentAttempt = (qrFetchAttempts[table.id] || 0) + 1;
        if (!isRetry) { // Only update attempt count for non-programmatic retries (initial fetch)
            setQrFetchAttempts(prev => ({ ...prev, [table.id]: currentAttempt }));
        }
        setQrStatus(table.id, 'loading');

        // Data string construction is now handled by backend.
        // const dataStr = constructQrDataValue(table); // REMOVED

        try {
            // fetchQrApi (generateQrCode from qrCodeService) now only takes 'table'
            const imageBlob = await fetchQrApi(table);
            const imageUrl = URL.createObjectURL(imageBlob);
            setQrStatus(table.id, 'url', imageUrl);
            if (!isRetry) setQrFetchAttempts(prev => ({ ...prev, [table.id]: 0 })); // Reset attempts on success
            return imageBlob;
        } catch (error) {
            const errorMessage = error.message || 'Failed to fetch QR code. Check service.';
            console.error(`Error fetching QR for Table ${table.number ?? table.id} (Attempt ${currentAttempt}):`, errorMessage, error);

            // Check for specific "endpoint not implemented" message which implies backend is effectively "disabled" for this feature
            if (errorMessage.includes(BACKEND_DISABLED_MESSAGE_PART)) {
                setQrStatus(table.id, 'skipped');
                if (openAlertModal && currentAttempt <= 1 && !isRetry) { // Show only once per table on initial try
                    openAlertModal("QR Service Info", `QR code generation for Table ${table.number ?? table.id} is currently unavailable (endpoint not ready).`, "info");
                }
            } else {
                setQrStatus(table.id, 'error');
                if (openAlertModal && (!isRetry || currentAttempt > MAX_SILENT_RETRIES)) { // Alert if it's not a silent retry or if max retries exceeded
                    const errorTitle = error.status ? `QR Error (HTTP ${error.status})` : "Network Error";
                    openAlertModal(errorTitle, `Could not fetch QR for Table ${table.number ?? table.id}: ${errorMessage.replace(GENERAL_FAILURE_MESSAGE_PART, '').trim()}`, "error");
                }
            }
            return null;
        }
    }, [qrFetchAttempts, openAlertModal, setQrStatus]); // Removed qrColor, bgColor

    const downloadSingleQr = useCallback(async (table) => { // qrColor, bgColor removed
        if (!table || !table.id) {
            if (openAlertModal) openAlertModal("Download Error", "Invalid table data for QR download.", "error");
            return;
        }

        const currentStatus = qrImageUrls[table.id];
        if (currentStatus === 'skipped') {
            if (openAlertModal) openAlertModal("QR Not Available", `QR code for Table ${table.number ?? table.id} cannot be downloaded as the generation service is unavailable.`, "info");
            return;
        }
        if (currentStatus === 'error') {
            if (openAlertModal) openAlertModal("QR Not Available", `QR code for Table ${table.number ?? table.id} could not be generated previously. Try refreshing or check logs.`, "warning");
            // Optionally, one could attempt a retry here:
            // const refreshedBlob = await fetchQrCodeForTable(table, true);
            // if (!refreshedBlob) return; // If retry fails, exit.
            return;
        }


        let imageBlob;
        if (currentStatus && currentStatus.startsWith('blob:') && !qrLoadingStates[table.id]) {
            try {
                const response = await fetch(currentStatus); // Fetch the existing blob URL
                if (!response.ok) throw new Error(`Failed to refetch blob: ${response.statusText}`);
                imageBlob = await response.blob();
            } catch (e) {
                console.warn("Could not refetch existing blob, fetching new QR for download.", e);
                imageBlob = await fetchQrCodeForTable(table, true); // Pass true for isRetry
            }
        } else {
            imageBlob = await fetchQrCodeForTable(table, true); // Pass true for isRetry
        }

        if (imageBlob) {
            downloadBlob(imageBlob, `table-${table.number ?? table.id}-qr.png`);
        } else if (qrImageUrls[table.id] !== 'skipped') { // Don't show error if skipped by backend config
            if (openAlertModal) openAlertModal("Download Error", `Could not download QR for Table ${table.number ?? table.id}. Ensure it can be generated.`, "error");
        }
    }, [fetchQrCodeForTable, openAlertModal, qrImageUrls, qrLoadingStates]);

    const downloadAllQrs = useCallback(async (tables) => { // qrColor, bgColor removed
        const validTables = tables.filter(t => t && t.id && typeof t.number === 'number' && !t.isProvisional);
        if (validTables.length === 0) {
            if (openAlertModal) openAlertModal("No QR Codes", "There are no valid, numbered tables to download QR codes for.", "info");
            return;
        }

        const SkippedTablesExist = validTables.some(table => qrImageUrls[table.id] === 'skipped');
        const ErrorTablesExist = validTables.some(table => qrImageUrls[table.id] === 'error');

        if (openAlertModal) {
            let message = `Preparing to download available QR code(s) for ${validTables.length} table(s). This may take a moment.`;
            if (SkippedTablesExist && ErrorTablesExist) message += " Some QRs are unavailable or errored.";
            else if (SkippedTablesExist) message += " Some QRs are unavailable (service disabled).";
            else if (ErrorTablesExist) message += " Some QRs previously failed to generate.";
            openAlertModal("Download Starting", message, "info");
        }


        const sortedTables = [...validTables].sort((a, b) => (a.number || 0) - (b.number || 0));
        let downloadedCount = 0;
        let failedCount = 0;
        let skippedDuringDownload = 0;

        for (const table of sortedTables) {
            if (qrImageUrls[table.id] === 'skipped') {
                console.log(`Skipping download for Table ${table.number ?? table.id} as QR service is unavailable for it.`);
                skippedDuringDownload++;
                continue;
            }
            // If previously errored, we might attempt a re-fetch here or just skip
            // For now, we re-fetch.
            await new Promise(resolve => setTimeout(resolve, 200)); // Small delay between fetches
            const imageBlob = await fetchQrCodeForTable(table, true); // isRetry = true
            if (imageBlob) {
                downloadBlob(imageBlob, `table-${table.number ?? table.id}-qr.png`);
                downloadedCount++;
            } else {
                console.warn(`Could not fetch blob for table ${table.number ?? table.id} (ID: ${table.id}) to download.`);
                if (qrImageUrls[table.id] !== 'skipped') failedCount++; // Count as failed if not explicitly skipped now
                else skippedDuringDownload++;
            }
        }

        if (openAlertModal) {
            if (downloadedCount === validTables.length) {
                openAlertModal("Download Complete", `Successfully downloaded ${downloadedCount} QR codes.`, "success");
            } else if (downloadedCount > 0) {
                let partialMessage = `Successfully downloaded ${downloadedCount} QR codes.`;
                if (failedCount > 0) partialMessage += ` ${failedCount} failed.`;
                if (skippedDuringDownload > 0) partialMessage += ` ${skippedDuringDownload} skipped (service unavailable).`;
                openAlertModal("Download Partial", partialMessage, "warning");
            } else if (failedCount > 0 && skippedDuringDownload === 0) { // All attempted downloads failed
                openAlertModal("Download Failed", `All ${failedCount} QR codes could not be downloaded at this time.`, "error");
            } else if (skippedDuringDownload > 0 && downloadedCount === 0 && failedCount === 0) { // All were skipped
                openAlertModal("QR Not Available", "All QR codes are currently unavailable because the generation service is offline.", "info");
            } else if (failedCount > 0 && skippedDuringDownload > 0) { // Mixed failures and skips, none successful
                openAlertModal("Download Issue", `No QR codes downloaded. ${failedCount} failed, ${skippedDuringDownload} skipped (service unavailable).`, "error");
            }
        }

    }, [fetchQrCodeForTable, openAlertModal, qrImageUrls]);

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
        // Cleanup object URLs on unmount
        return () => {
            Object.values(qrImageUrls).forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [qrImageUrls]); // Run only when qrImageUrls itself changes, not its content potentially


    return {
        qrImageUrls,
        qrLoadingStates,
        qrFetchAttempts,
        fetchQrCodeForTable,
        downloadSingleQr,
        downloadAllQrs,
        clearQrDataForTable,
        clearAllQrData,
        getQrStatus: (tableId) => ({
            url: qrImageUrls[tableId]?.startsWith('blob:') ? qrImageUrls[tableId] : null,
            loading: !!qrLoadingStates[tableId],
            status: qrImageUrls[tableId]
        }),
    };
};

export default useQrCodeManager;