/**
 * Read a file as a data URL.
 *
 * @param {File} file
 * @return {Promise<string>}
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
 * @param {string} b64Data
 * @param {string} type
 * @param {number} sliceSize
 * @return {Blob}
 */
export const b64toBlob = (b64Data: string, type: string = '', sliceSize: number = 512): Blob => {
    const byteCharacters: string = atob(b64Data);
    const byteArrays: Uint8Array[] = [];

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

/**
 * Find out the total complete percentage given a number of stages and the current stages progress.
 *
 * @param {number} stageCompletedPercent
 * @param {number} numberOfStages
 * @param {number} currentStageNumber
 * @return {number}
 */
export const stagePercent = (stageCompletedPercent: number, numberOfStages: number, currentStageNumber: number): number => {
    const stageTotalFraction: number = 1 / numberOfStages;
    const stageCompletedFraction: number = stageCompletedPercent / 100;
    let totalCompletedFraction: number = (stageCompletedFraction * stageTotalFraction) * 100;
    totalCompletedFraction += (stageCompletedFraction * currentStageNumber)

    return totalCompletedFraction * 100;
}
