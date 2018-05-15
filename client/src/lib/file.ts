/**
 * Read a file as a data URL.
 *
 * @type {[type]}
 */
export const readAsDataURL = (file: File): Promise<string> => {
    const reader: FileReader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onerror = () => {
            reader.abort();
            reject(new DOMException('Problem loading file.'));
        };

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.readAsDataURL(file);
    });
};

/**
 * Convert base64 string to Blob.
 *
 * @type {[type]}
 */
export const b64toBlob = (b64Data: string, type: string = '', sliceSize: number = 512): Blob => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, {
        type,
    });
};
