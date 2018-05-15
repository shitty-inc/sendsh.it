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
