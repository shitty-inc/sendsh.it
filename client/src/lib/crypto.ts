import * as triplesec from 'triplesec';

/**
 * Generate a password from the PRNG.
 *
 * @param  {number} data
 * @return {Promise<string>}
 */
export const generate = (n: number = 24): Promise<string> =>
	new Promise(resolve => triplesec.prng.generate(n, (words: WordArray) =>
		resolve(words.to_hex())));

/**
 * Decrypt a buffer.
 *
 * @param  {Buffer} data
 * @param  {string} key
 * @param  {Function} progress
 * @return {Promise<Buffer>}
 */
export const encrypt = (data: Buffer, key: string, progress: (obj: any) => void): Promise<Buffer> =>
	new Promise((resolve, reject) => triplesec.encrypt({
		data,
        key: new Buffer(key),
        progress_hook: progress
	}, (err: Error, buff: Buffer) =>
		err ? reject(err) : resolve(buff)));

/**
 * Encrypt a buffer.
 *
 * @param  {Buffer} data
 * @param  {string} key
 * @param  {Function} progress
 * @return {Promise<Buffer>}
 */
export const decrypt = (data: Buffer, key: string, progress: (obj: any) => void): Promise<Buffer> =>
	new Promise((resolve, reject) => triplesec.decrypt({
		data,
        key: new Buffer(key),
        progress_hook: progress
	}, (err: Error, buff: Buffer) =>
		err ? reject(err) : resolve(buff)));
