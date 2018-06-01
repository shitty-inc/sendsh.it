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
 * Find out the total complete percentage given a number of stages and the current stages progress.
 *
 * @param {number} stageCompletedPercent
 * @param {number} numberOfStages
 * @param {number} currentStageNumber
 * @return {number}
 */
export const stagePercent = (stageCompletedPercent: number, numberOfStages: number, currentStageNumber: number): number => {
    const totalStageFraction: number = (100 / numberOfStages) / 100;
    let totalOverallFraction: number = (stageCompletedPercent / 100) * totalStageFraction;

    totalOverallFraction = totalOverallFraction += (totalStageFraction * currentStageNumber);

    return totalOverallFraction * 100;
}
