import { useState, useCallback, useEffect, useRef } from 'react';
import { generateQrCode as fetchQrApi } from '../services/qrCodeService';
import { downloadBlob } from '../utils/commonUtils';

const BACKEND_DISABLED_MESSAGE_PART = "QR code generation endpoint not implemented";
const GENERAL_FAILURE_MESSAGE_PART = "Failed to fetch QR";

const useQrCodeManager = (openAlertModal) => {
    const [qrImageUrls, setQrImageUrls] = useState({});
    const [qrLoadingStates, setQrLoadingStates] = useState({});
    const [qrFetchAttempts, setQrFetchAttempts] = useState({});
    const openAlertModalRef = useRef(openAlertModal); // Ref for stable openAlertModal

    useEffect(() => {
        openAlertModalRef.current = openAlertModal;
    }, [openAlertModal]);


    const MAX_SILENT_RETRIES = 1;

    const setQrStatus = useCallback((tableId, status, url = null) => {
        setQrImageUrls(prev => ({ ...prev, [tableId]: status === 'url' ? url : status }));
        setQrLoadingStates(prev => ({ ...prev, [tableId]: status === 'loading' }));
    }, []);

    const fetchQrCodeForTable = useCallback(async (table, isRetry = false) => {
        if (!table || !table.id) {
            console.warn("fetchQrCodeForTable: Invalid table or table.id", table);
            return null;
        }

        let attemptCountForThisCall = 0;

        if (!isRetry) {
            setQrFetchAttempts(prevAttempts => {
                const newCount = (prevAttempts[table.id] || 0) + 1;
                attemptCountForThisCall = newCount; // Capture for use in this specific call
                return { ...prevAttempts, [table.id]: newCount };
            });
        } else {
            // For retries, we might not want to increment the "official" attempt count in state,
            // or we rely on the caller to manage retry logic more explicitly.
            // For simplicity, we'll assume `isRetry` means we don't modify `qrFetchAttempts` state here.
            // If `attemptCountForThisCall` is needed for logging/alerting on retries, it should be passed or handled.
        }

        setQrStatus(table.id, 'loading');

        try {
            const imageBlob = await fetchQrApi(table);
            const imageUrl = URL.createObjectURL(imageBlob);
            setQrStatus(table.id, 'url', imageUrl);
            if (!isRetry) {
                setQrFetchAttempts(prev => ({ ...prev, [table.id]: 0 })); // Reset attempts on success
            }
            return imageBlob;
        } catch (error) {
            const errorMessage = error.message || 'Failed to fetch QR code. Check service.';
            // Use the captured attemptCountForThisCall for logging/alerting if it was set
            const logAttemptCount = isRetry ? 'retry' : attemptCountForThisCall;
            console.error(`Error fetching QR for Table ${table.number ?? table.id} (Attempt ${logAttemptCount}):`, errorMessage, error);

            const stableOpenAlertModal = openAlertModalRef.current;

            if (errorMessage.includes(BACKEND_DISABLED_MESSAGE_PART)) {
                setQrStatus(table.id, 'skipped');
                if (stableOpenAlertModal && !isRetry && attemptCountForThisCall <= 1) {
                    stableOpenAlertModal("QR Service Info", `QR code generation for Table ${table.number ?? table.id} is currently unavailable (endpoint not ready).`, "info");
                }
            } else {
                setQrStatus(table.id, 'error');
                // Alert if it's not a silent retry OR if max retries (based on attemptCountForThisCall if available) would be exceeded.
                // This retry alert logic might need refinement based on how `isRetry` and explicit attempt counts are managed.
                const shouldAlert = !isRetry || (isRetry && (attemptCountForThisCall > MAX_SILENT_RETRIES || MAX_SILENT_RETRIES === 0));
                if (stableOpenAlertModal && shouldAlert) {
                    const errorTitle = error.status ? `QR Error (HTTP ${error.status})` : "Network Error";
                    stableOpenAlertModal(errorTitle, `Could not fetch QR for Table ${table.number ?? table.id}: ${errorMessage.replace(GENERAL_FAILURE_MESSAGE_PART, '').trim()}`, "error");
                }
            }
            return null;
        }
        // Make fetchQrCodeForTable stable by removing qrFetchAttempts from dependencies.
        // It now uses functional updates for setQrFetchAttempts.
        // openAlertModal is accessed via ref to ensure stability if its reference changes.
    }, [setQrStatus]); // Removed openAlertModal, qrFetchAttempts. Added openAlertModalRef.current usage.

    const getQrStatus = useCallback((tableId) => ({
        url: qrImageUrls[tableId]?.startsWith('blob:') ? qrImageUrls[tableId] : null,
        loading: !!qrLoadingStates[tableId],
        status: qrImageUrls[tableId]
    }), [qrImageUrls, qrLoadingStates]);

    const downloadSingleQr = useCallback(async (table) => {
        // ... (previous implementation was likely okay, just ensure it uses the stable fetchQrCodeForTable and openAlertModalRef.current)
        if (!table || !table.id) {
            if (openAlertModalRef.current) openAlertModalRef.current("Download Error", "Invalid table data for QR download.", "error");
            return;
        }
        const currentStatus = qrImageUrls[table.id]; // Read directly from state
        if (currentStatus === 'skipped') {
            if (openAlertModalRef.current) openAlertModalRef.current("QR Not Available", `QR code for Table ${table.number ?? table.id} cannot be downloaded as the generation service is unavailable.`, "info");
            return;
        }
        if (currentStatus === 'error') {
            if (openAlertModalRef.current) openAlertModalRef.current("QR Not Available", `QR code for Table ${table.number ?? table.id} could not be generated previously. Try refreshing or check logs.`, "warning");
            return;
        }
        let imageBlob;
        if (currentStatus && currentStatus.startsWith('blob:') && !qrLoadingStates[table.id]) { // Read directly
            try {
                const response = await fetch(currentStatus);
                if (!response.ok) throw new Error(`Failed to refetch blob: ${response.statusText}`);
                imageBlob = await response.blob();
            } catch (e) {
                console.warn("Could not refetch existing blob, fetching new QR for download.", e);
                imageBlob = await fetchQrCodeForTable(table, true);
            }
        } else {
            imageBlob = await fetchQrCodeForTable(table, true);
        }
        if (imageBlob) {
            downloadBlob(imageBlob, `table-${table.number ?? table.id}-qr.png`);
        } else if (qrImageUrls[table.id] !== 'skipped') { // Read directly
            if (openAlertModalRef.current) openAlertModalRef.current("Download Error", `Could not download QR for Table ${table.number ?? table.id}. Ensure it can be generated.`, "error");
        }
    }, [fetchQrCodeForTable, qrImageUrls, qrLoadingStates, getQrStatus]); // getQrStatus itself might not be needed here if directly accessing qrImageUrls/qrLoadingStates

    const downloadAllQrs = useCallback(async (tables) => {
        // ... (previous implementation was likely okay, ensure it uses stable fetchQrCodeForTable and openAlertModalRef.current)
        const validTables = tables.filter(t => t && t.id && typeof t.number === 'number' && !t.isProvisional);
        if (validTables.length === 0) {
            if (openAlertModalRef.current) openAlertModalRef.current("No QR Codes", "There are no valid, numbered tables to download QR codes for.", "info");
            return;
        }
        // ... (rest of the logic, using openAlertModalRef.current and the now stable fetchQrCodeForTable)
        const SkippedTablesExist = validTables.some(table => qrImageUrls[table.id] === 'skipped');
        const ErrorTablesExist = validTables.some(table => qrImageUrls[table.id] === 'error');

        if (openAlertModalRef.current) {
            let message = `Preparing to download available QR code(s) for ${validTables.length} table(s). This may take a moment.`;
            if (SkippedTablesExist && ErrorTablesExist) message += " Some QRs are unavailable or errored.";
            else if (SkippedTablesExist) message += " Some QRs are unavailable (service disabled).";
            else if (ErrorTablesExist) message += " Some QRs previously failed to generate.";
            openAlertModalRef.current("Download Starting", message, "info");
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
            await new Promise(resolve => setTimeout(resolve, 200));
            const imageBlob = await fetchQrCodeForTable(table, true);
            if (imageBlob) {
                downloadBlob(imageBlob, `table-${table.number ?? table.id}-qr.png`);
                downloadedCount++;
            } else {
                console.warn(`Could not fetch blob for table ${table.number ?? table.id} (ID: ${table.id}) to download.`);
                if (qrImageUrls[table.id] !== 'skipped') failedCount++;
                else skippedDuringDownload++;
            }
        }
        if (openAlertModalRef.current) {
            if (downloadedCount === validTables.length) {
                openAlertModalRef.current("Download Complete", `Successfully downloaded ${downloadedCount} QR codes.`, "success");
            } else if (downloadedCount > 0) {
                let partialMessage = `Successfully downloaded ${downloadedCount} QR codes.`;
                if (failedCount > 0) partialMessage += ` ${failedCount} failed.`;
                if (skippedDuringDownload > 0) partialMessage += ` ${skippedDuringDownload} skipped (service unavailable).`;
                openAlertModalRef.current("Download Partial", partialMessage, "warning");
            } else if (failedCount > 0 && skippedDuringDownload === 0) {
                openAlertModalRef.current("Download Failed", `All ${failedCount} QR codes could not be downloaded at this time.`, "error");
            } else if (skippedDuringDownload > 0 && downloadedCount === 0 && failedCount === 0) {
                openAlertModalRef.current("QR Not Available", "All QR codes are currently unavailable because the generation service is offline.", "info");
            } else if (failedCount > 0 && skippedDuringDownload > 0) {
                openAlertModalRef.current("Download Issue", `No QR codes downloaded. ${failedCount} failed, ${skippedDuringDownload} skipped (service unavailable).`, "error");
            }
        }
    }, [fetchQrCodeForTable, qrImageUrls]);

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
        // qrFetchAttempts, // Not directly exposed if managed internally for stability
        fetchQrCodeForTable,
        downloadSingleQr,
        downloadAllQrs,
        clearQrDataForTable,
        clearAllQrData,
        getQrStatus,
    };
};

export default useQrCodeManager;