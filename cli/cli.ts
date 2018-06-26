import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import fs from 'fs';
import * as triplesec from 'triplesec';
import FormData from 'form-data';
import ora from 'ora';
import mime from 'mime';

const args: string[] = process.argv.slice(2);
const domain: string = 'https://new.sendsh.it';

async function upload(fileName: string) {
    const spinner = new ora('Encrypting file').start();
    
    const key: string = await new Promise<string>(resolve => triplesec.prng.generate(24, (words: WordArray) =>
        resolve(words.to_hex())
    ));

    const fileData: Buffer = await new Promise<Buffer>((resolve, reject) => fs.readFile(fileName, (err, data) => {
        if (err) {
            return reject(err);
        }
        resolve(data);
    }));

    // Handle file read error

    const opts = {
		data: new Buffer(JSON.stringify({
            url: `data:${mime.getType(fileName)};base64,${fileData.toString('base64')}`,
            name: fileName,
        })),
        key: new Buffer(key)
    };

    const encrypted = await new Promise<Buffer|null>((resolve, reject) => triplesec.encrypt(opts, (err, buff) => {
        if (err) {
            console.log(err);
            return reject(err);
        }
        resolve(buff);
    }));

    spinner.text = 'Uploading file';

    const formData: FormData = new FormData();
    formData.append('upload', encrypted.toString('hex'), 'encrypted');

    const response = await axios.post(`${domain}/api/upload`, formData, {
        headers: formData.getHeaders(),
    });

    const url: string = `${domain}/#/${response.data.id}/${key}`

    spinner.stop();
    console.log(url);
}

upload(args[0]);