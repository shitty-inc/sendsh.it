// Type definitions for triplesec
// Project: triplesec
// Definitions by: Ben Speakman <[AUTHOR URL]>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
interface WordArray {
	sigBytes: number;
	words: number[];
	to_hex: () => string;
}

interface Arguments {
	data: Buffer,
	key: Buffer,
	progress_hook?: (progress: Progress) => void;
}

interface Progress {
	what: string;
	i: number;
	total: number;
}

interface Triplesec {
	prng: { generate: ( n: number, cb: (words: WordArray) => void ) => void };
	encrypt: (arg: Arguments, cb: (err: Error | null, buff: Buffer | null) => void) => void;
	decrypt: (arg: Arguments, cb: (err: Error | null, buff: Buffer | null) => void) => void;
}

declare var triplesec: Triplesec;

declare module 'triplesec' {
    export = triplesec
}