import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as React from 'react';
import { encrypt, generatePassword } from '../lib/crypto';
import { stagePercent } from '../lib/file';
import UploadButton, { UploadedFileData } from './UploadButton';

export interface UploadProps { setProgress: (progress: number) => void; }
export interface UploadState { url: string; progress: number; uploaded: boolean; }

class Upload extends React.Component<UploadProps, UploadState> {

    /**
     * Input element that holds the link to download the file.
     *
     * @type {HTMLInputElement}
     */
    private downloadLink: React.RefObject<HTMLInputElement>;

    /**
     * Component constructor.
     */
    public constructor(props: UploadProps) {
        super(props);

        this.state = {
            progress: 0,
            uploaded: false,
            url: '',
        }

        this.handleUpload = this.handleUpload.bind(this);
        this.downloadLink = React.createRef();
    }

    /**
     * Encrypt and upload the file.
     *
     * @param  {UploadedFileData} data
     * @return {void}
     */
    public async handleUpload(data: UploadedFileData) {
        const password: string = await generatePassword();

        const encrypted: Buffer = await encrypt(new Buffer(JSON.stringify(data)), password, obj => {
            const stageCompletedPercent: number = (obj.i / obj.total) / 100;
            let currentStageNumber: number;

            switch(obj.what) {
                case 'scrypt':
                    currentStageNumber = 1;
                    break;
                case 'pbkdf2 (pass 2)':
                    currentStageNumber = 2;
                    break;
                case 'salsa20':
                    currentStageNumber = 3;
                    break;
                case 'twofish':
                    currentStageNumber = 4;
                    break;
                case 'aes':
                    currentStageNumber = 5;
                    break;
                case 'HMAC-SHA512-SHA3':
                    currentStageNumber = 6;
                    break;
                default:
                    currentStageNumber = 0;
            }

            this.props.setProgress(stagePercent(stageCompletedPercent, 8, currentStageNumber));
        });

        const formData: FormData = new FormData();
        const blob: Blob = new Blob([encrypted.toString('hex')], { type: 'application/octet-stream' });

        formData.append('upload', blob, 'encrypted');

        const config: AxiosRequestConfig = {
            onUploadProgress: (progressEvent: any) => {
                const uploadedPercent: number = (progressEvent.loaded * 100) / progressEvent.total;

                this.props.setProgress(stagePercent(uploadedPercent, 8, 7));
            }
        }

        const response: AxiosResponse<{ id: string }> = await axios.post('/api/upload', formData, config)

        this.setState({
            uploaded: true,
            url: `${location.origin}/#/${response.data.id}/${password}`,
        });

        const node: HTMLInputElement | null = this.downloadLink.current;
        if (node) {
            node.select();
        }
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
            <div className="input-group">
                <input
                    readOnly={ true }
                    type="text"
                    ref={ this.downloadLink }
                    className="form-control"
                    value={ this.state.url }
                />
                <span className="input-group-btn">
                    <button className="btn btn-default" type="button">
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
            <div className="text-center col-md-6 col-md-offset-3">
                { this.renderUploadButton() }
                { this.renderDownloadLink() }
            </div>
        );
    }
}

export default Upload;
