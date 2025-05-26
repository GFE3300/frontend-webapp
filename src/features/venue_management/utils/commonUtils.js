// src/features/venue_management/utils/commonUtils.js

export const constructQrDataValue = (table) => {
    if (!table || typeof table !== 'object') {
        console.warn("constructQrDataValue called with invalid table input:", table);
        return `Error:InvalidTableData`;
    }
    const id = table.id ?? 'unknown-id';
    const number = table.number ?? 'N/A';
    const seats = table.seats ?? 0;
    // Consider making the domain configurable
    return `https://your-app-domain.com/table-service?tableId=${id}&tableNumber=${number}&seats=${seats}`;
};

export const downloadBlob = (blob, filename) => {
    if (!(blob instanceof Blob)) {
        console.error("downloadBlob: First argument must be a Blob.", blob);
        return;
    }
    if (typeof filename !== 'string') {
        console.error("downloadBlob: Second argument must be a string for the filename.", filename);
        return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};