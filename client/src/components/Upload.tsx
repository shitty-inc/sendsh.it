import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as clipboard from 'clipboard';
import * as React from 'react';
import { encrypt, generatePassword } from '../lib/crypto';
import { stagePercent } from '../lib/file';
import UploadButton, { UploadedFileData } from './UploadButton';

export interface UploadProps { setProgress: (progress: number) => void; }
export interface UploadState { url: string; progress: number; uploaded: boolean; message: string; }

class Upload extends React.Component<UploadProps, UploadState> {

    /**
     * Input element that holds the link to download the file.
     *
     * @type {HTMLInputElement}
     */
    public downloadLink: React.RefObject<HTMLInputElement>;

    /**
     * Button element to copy the download link.
     *
     * @type {HTMLButtonElement}
     */
    public copyButton: React.RefObject<HTMLButtonElement>;

    /**
     * Clipboard library
     * 
     * @type {clipboard}
     */
    public clipboard: clipboard;

    /**
     * Order of upload stage events.
     *
     * @type {string[]}
     */
    private uploadStages: string[] = [
        'pbkdf2 (pass 1)',
        'scrypt',
        'pbkdf2 (pass 2)',
        'salsa20',
        'twofish',
        'aes',
        'HMAC-SHA512-SHA3',
        'upload'
    ];

    /**
     * Component constructor.
     */
    public constructor(props: UploadProps) {
        super(props);

        this.state = {
            message: '',
            progress: 0,
            uploaded: false,
            url: '',
        }

        this.handleUpload = this.handleUpload.bind(this);
        this.downloadLink = React.createRef();
        this.copyButton = React.createRef();
    }

    /**
     * Bind copy button and select download link text.
     */
    public bindCopyButton() {
        const downloadLink: HTMLInputElement = this.downloadLink.current as HTMLInputElement;
        const copyButton: HTMLButtonElement = this.copyButton.current as HTMLButtonElement;

        this.clipboard = new clipboard(
			copyButton, {
			  target: () => downloadLink
			}
        )

        downloadLink.select();
    }

    /**
     * Encrypt and upload the file.
     *
     * @param  {UploadedFileData} data
     * @return {void}
     */
    public async handleUpload(data: UploadedFileData) {
        this.setState({
            message: 'Encrypting some shit...',
        });

        const password: string = await generatePassword();

        const encrypted: Buffer = await encrypt(new Buffer(JSON.stringify(data)), password, obj => {
            const stageCompletedPercent: number = (obj.i / obj.total) * 100;

            this.props.setProgress(stagePercent(stageCompletedPercent, this.uploadStages.length, this.uploadStages.indexOf(obj.what)));
        });

        const formData: FormData = new FormData();
        const blob: Blob = new Blob([encrypted.toString('hex')], {
            type: 'application/octet-stream',
        });

        formData.append('upload', blob, 'encrypted');

        const config: AxiosRequestConfig = {
            onUploadProgress: (progressEvent: any) => {
                const uploadedPercent: number = (progressEvent.loaded * 100) / progressEvent.total;

                if (uploadedPercent !== 100) {
                    this.props.setProgress(stagePercent(uploadedPercent, this.uploadStages.length, this.uploadStages.indexOf('upload')));
                }
            }
        }

        this.setState({
            message: 'Uploading some shit...',
        });

        let response: AxiosResponse<{ id: string }>;

        try {
            response = await axios.post('https://y4si76dsxj.execute-api.eu-west-1.amazonaws.com/dev/api/upload', formData, config);
        } catch (e) {
            this.props.setProgress(0);

            return this.setState({
                message: e.message,
            })
        }

        this.setState({
            message: 'Copy this shit',
            uploaded: true,
            url: `${location.origin}/#/${response.data.id}/${password}`,
        });

        this.props.setProgress(100);
        this.bindCopyButton();
    }

    /**
     * Render the upload button.
     *
     * @return {JSX}
     */
    public renderUploadButton() {
        if (this.state.uploaded === true) {
            return null;
        }

        return (
            <UploadButton
                handleUpload={ this.handleUpload }
            />
        );
    }

    /**
     * Render the link to download the file.
     *
     * @return {JSX}
     */
    public renderDownloadLink() {
        if (this.state.uploaded === false) {
            return null;
        }

        return (
            <div className="input-group col-md-6 col-md-offset-3">
                <input
                    readOnly={ true }
                    type="text"
                    ref={ this.downloadLink }
                    className="form-control"
                    value={ this.state.url }
                />
                <span className="input-group-btn">
                    <button
                        className="btn btn-default"
                        type="button"
                        ref={ this.copyButton }
                    >
                        <span className="glyphicon glyphicon-copy" />
                    </button>
                </span>
            </div>
        );
    }

    /**
     * Render the component.
     *
     * @return {JSX}
     */
    public render() {
        return (
            <div className="text-center col-md-12">
                <p>{ this.state.message }</p>
                { this.renderUploadButton() }
                { this.renderDownloadLink() }
            </div>
        );
    }
}

export default Upload;
