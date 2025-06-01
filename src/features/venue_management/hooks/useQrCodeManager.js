import { useState, useCallback, useEffect, useRef } from 'react';
import { generateQrCode as fetchQrApi } from '../services/qrCodeService';
import { downloadBlob } from '../utils/commonUtils';

// Localization
import slRaw, { interpolate } from '../utils/script_lines.js';
const sl = slRaw.venueManagement.useQrCodeManager;
// const slCommon = slRaw; // For general strings if needed

const BACKEND_DISABLED_MESSAGE_PART = "QR code generation endpoint not implemented"; // Keep for matching error
const GENERAL_FAILURE_MESSAGE_PART = "Failed to fetch QR"; // Keep for matching error

const useQrCodeManager = (openAlertModal) => {
    const [qrImageUrls, setQrImageUrls] = useState({});
    const [qrLoadingStates, setQrLoadingStates] = useState({});
    const [qrFetchAttempts, setQrFetchAttempts] = useState({}); // Tracks attempts per table ID
    const openAlertModalRef = useRef(openAlertModal);

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
        const tableIdentifier = table.number ?? table.id;

        let currentAttemptCount = 0;
        if (!isRetry) {
            setQrFetchAttempts(prevAttempts => {
                const newCount = (prevAttempts[table.id] || 0) + 1;
                currentAttemptCount = newCount;
                return { ...prevAttempts, [table.id]: newCount };
            });
        } else {
            currentAttemptCount = (qrFetchAttempts[table.id] || 0); // Use existing count for retries for alert logic
        }

        setQrStatus(table.id, 'loading');

        try {
            const imageBlob = await fetchQrApi(table);
            const imageUrl = URL.createObjectURL(imageBlob);
            setQrStatus(table.id, 'url', imageUrl);
            if (!isRetry) { // Reset attempts on explicit success (not retry success)
                setQrFetchAttempts(prev => ({ ...prev, [table.id]: 0 }));
            }
            return imageBlob;
        } catch (error) {
            const errorMessage = error.message || 'Failed to fetch QR code. Check service.';
            const stableOpenAlert = openAlertModalRef.current;

            if (errorMessage.includes(BACKEND_DISABLED_MESSAGE_PART)) {
                setQrStatus(table.id, 'skipped');
                if (stableOpenAlert && !isRetry && currentAttemptCount <= 1) { // Alert only on first non-retry attempt
                    stableOpenAlert(
                        sl.qrFetchServiceUnavailableTitle || "QR Service Info",
                        interpolate(sl.qrFetchServiceUnavailableMessage || "QR for Table {tableIdentifier} unavailable.", { tableIdentifier }),
                        "info"
                    );
                }
            } else {
                setQrStatus(table.id, 'error');
                const shouldAlertUser = !isRetry || (currentAttemptCount > MAX_SILENT_RETRIES);
                if (stableOpenAlert && shouldAlertUser) {
                    const errorTitle = error.status
                        ? interpolate(sl.qrFetchErrorTitleHttp || "QR Error (HTTP {status})", { status: error.status })
                        : (sl.qrFetchErrorTitleGeneric || "Network Error");
                    const displayErrorMessage = errorMessage.replace(GENERAL_FAILURE_MESSAGE_PART, '').trim();
                    stableOpenAlert(
                        errorTitle,
                        interpolate(sl.qrFetchErrorMessage || "Could not fetch QR for Table {tableIdentifier}: {errorMessage}", { tableIdentifier, errorMessage: displayErrorMessage }),
                        "error"
                    );
                }
            }
            return null;
        }
    }, [setQrStatus, qrFetchAttempts, openAlertModalRef]); // qrFetchAttempts is a dependency now

    const getQrStatus = useCallback((tableId) => ({
        url: qrImageUrls[tableId]?.startsWith('blob:') ? qrImageUrls[tableId] : null,
        loading: !!qrLoadingStates[tableId],
        status: qrImageUrls[tableId] // 'url', 'loading', 'error', 'skipped'
    }), [qrImageUrls, qrLoadingStates]);

    const downloadSingleQr = useCallback(async (table) => {
        const stableOpenAlert = openAlertModalRef.current;
        if (!table || !table.id) {
            if (stableOpenAlert) stableOpenAlert(sl.downloadErrorTitle || "Download Error", sl.downloadErrorInvalidTable || "Invalid table data.", "error");
            return;
        }
        const tableIdentifier = table.number ?? table.id;
        const currentStatus = getQrStatus(table.id).status;

        if (currentStatus === 'skipped') {
            if (stableOpenAlert) stableOpenAlert(
                sl.qrNotAvailableForDownloadTitle || "QR Not Available",
                interpolate(sl.qrNotAvailableServiceMessage || "QR for Table {tableIdentifier} cannot be downloaded (service unavailable).", { tableIdentifier }),
                "info"
            );
            return;
        }
        if (currentStatus === 'error') {
            if (stableOpenAlert) stableOpenAlert(
                sl.qrNotAvailableForDownloadTitle || "QR Not Available",
                interpolate(sl.qrNotAvailablePreviouslyFailedMessage || "QR for Table {tableIdentifier} previously failed.", { tableIdentifier }),
                "warning"
            );
            return;
        }

        let imageBlob;
        if (getQrStatus(table.id).url && !getQrStatus(table.id).loading) {
            try {
                const response = await fetch(getQrStatus(table.id).url);
                if (!response.ok) throw new Error(`Failed to refetch blob: ${response.statusText}`);
                imageBlob = await response.blob();
            } catch (e) {
                console.error(e);
                imageBlob = await fetchQrCodeForTable(table, true); // Retry fetch
            }
        } else {
            imageBlob = await fetchQrCodeForTable(table, true); // Fetch if not available or still loading (force retry)
        }

        if (imageBlob) {
            downloadBlob(imageBlob, `table-${tableIdentifier}-qr.png`);
        } else if (getQrStatus(table.id).status !== 'skipped') { // Avoid double alert if already skipped
            if (stableOpenAlert) stableOpenAlert(
                sl.downloadErrorTitle || "Download Error",
                interpolate(sl.qrNotAvailableGenericDownloadError || "Could not download QR for Table {tableIdentifier}.", { tableIdentifier }),
                "error"
            );
        }
    }, [fetchQrCodeForTable, getQrStatus, openAlertModalRef]);

    const downloadAllQrs = useCallback(async (tables) => {
        const stableOpenAlert = openAlertModalRef.current;
        const validTables = tables.filter(t => t && t.id && typeof t.number === 'number' && !t.isProvisional);
        if (validTables.length === 0) {
            if (stableOpenAlert) stableOpenAlert(sl.noQrCodesToDownloadTitle || "No QR Codes", sl.noQrCodesToDownloadMessage || "No valid tables to download QRs for.", "info");
            return;
        }

        let message = interpolate(sl.downloadStartingMessage || "Preparing to download for {count} table(s).", { count: validTables.length });
        const skippedExist = validTables.some(t => getQrStatus(t.id).status === 'skipped');
        const errorExist = validTables.some(t => getQrStatus(t.id).status === 'error');

        if (skippedExist && errorExist) message += (sl.downloadStartingSomeUnavailable || " Some unavailable/errored.");
        else if (skippedExist) message += (sl.downloadStartingSomeServiceDisabled || " Some service disabled.");
        else if (errorExist) message += (sl.downloadStartingSomeFailed || " Some previously failed.");
        if (stableOpenAlert) stableOpenAlert(sl.downloadStartingTitle || "Download Starting", message, "info");

        const sortedTables = [...validTables].sort((a, b) => (a.number || 0) - (b.number || 0));
        let downloadedCount = 0;
        let failedCount = 0;
        let skippedDuringDownload = 0;

        for (const table of sortedTables) {
            if (getQrStatus(table.id).status === 'skipped') {
                skippedDuringDownload++;
                continue;
            }
            await new Promise(resolve => setTimeout(resolve, 200)); // Brief pause
            const imageBlob = await fetchQrCodeForTable(table, true); // Force retry
            if (imageBlob) {
                downloadBlob(imageBlob, `table-${table.number ?? table.id}-qr.png`);
                downloadedCount++;
            } else {
                if (getQrStatus(table.id).status !== 'skipped') failedCount++; // Don't count as failed if it became skipped
                else skippedDuringDownload++;
            }
        }

        if (stableOpenAlert) {
            if (downloadedCount === validTables.length) {
                stableOpenAlert(sl.downloadCompleteTitle || "Download Complete", interpolate(sl.downloadCompleteMessage || "{count} QRs downloaded.", { count: downloadedCount }), "success");
            } else if (downloadedCount > 0) {
                let partialMsg = interpolate(sl.downloadPartialMessageSuccess || "{downloadedCount} QRs downloaded.", { downloadedCount });
                if (failedCount > 0) partialMsg += interpolate(sl.downloadPartialMessageFailed || " {failedCount} failed.", { failedCount });
                if (skippedDuringDownload > 0) partialMsg += interpolate(sl.downloadPartialMessageSkipped || " {skippedCount} skipped.", { skippedCount: skippedDuringDownload });
                stableOpenAlert(sl.downloadPartialTitle || "Download Partial", partialMsg, "warning");
            } else if (failedCount > 0 && skippedDuringDownload === 0) {
                stableOpenAlert(sl.downloadFailedTitle || "Download Failed", interpolate(sl.downloadFailedAllMessage || "All {count} QRs failed.", { count: failedCount }), "error");
            } else if (skippedDuringDownload > 0 && downloadedCount === 0 && failedCount === 0) {
                stableOpenAlert(sl.qrNotAvailableForDownloadTitle || "QR Not Available", sl.downloadUnavailableAllServiceMessage || "All QRs unavailable (service offline).", "info");
            } else if (failedCount > 0 && skippedDuringDownload > 0) {
                stableOpenAlert(sl.downloadIssueMixedTitle || "Download Issue", interpolate(sl.downloadIssueMixedMessage || "{failedCount} failed, {skippedCount} skipped.", { failedCount, skippedCount: skippedDuringDownload }), "error");
            }
        }
    }, [fetchQrCodeForTable, getQrStatus, openAlertModalRef]);

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

    useEffect(() => { // Cleanup blob URLs on unmount
        return () => {
            Object.values(qrImageUrls).forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [qrImageUrls]);


    return {
        // qrImageUrls, // Exposing these might not be needed if getQrStatus is primary interface
        // qrLoadingStates,
        fetchQrCodeForTable,
        downloadSingleQr,
        downloadAllQrs,
        clearQrDataForTable,
        clearAllQrData,
        getQrStatus,
    };
};

export default useQrCodeManager;