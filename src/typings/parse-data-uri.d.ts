declare module 'parse-data-uri' {
    const parseDataUri: (uri: string) => {
    	data: Buffer;
    	mimeType: string;
    }

    export = parseDataUri;
}
