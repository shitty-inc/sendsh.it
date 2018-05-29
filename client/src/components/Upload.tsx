// import axios from 'axios';
import * as React from 'react';
import { encrypt, generatePassword } from '../lib/crypto';
import UploadButton, { UploadedFileData } from './UploadButton';

export interface UploadState { url: any; progress: number; uploaded: boolean; }
export interface UploadProps { setProgress: any; }

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
            const totalStagePercent: number = 0.125;
            let totalOverallPercent: number = (stageCompletedPercent * totalStagePercent) * 100;

            if (obj.what === 'scrypt') {
                 totalOverallPercent += totalStagePercent;
            }

            if (obj.what === 'pbkdf2 (pass 2)') {
                 totalOverallPercent = totalOverallPercent += (totalStagePercent * 2);
            }

            if (obj.what === 'salsa20') {
                 totalOverallPercent = totalOverallPercent += (totalStagePercent * 3);
            }

            if (obj.what === 'twofish') {
                 totalOverallPercent = totalOverallPercent += (totalStagePercent * 4);
            }

            if (obj.what === 'aes') {
                 totalOverallPercent = totalOverallPercent += (totalStagePercent * 5);
            }

            if (obj.what === 'HMAC-SHA512-SHA3') {
                 totalOverallPercent = totalOverallPercent += (totalStagePercent * 6);
            }

            this.props.setProgress(totalOverallPercent * 100);
        });

        const formData: FormData = new FormData();
        const blob: Blob = new Blob([encrypted.toString('hex')], { type: 'application/octet-stream' });

        formData.append('upload', blob, 'encrypted');

        /*const config = {
            onUploadProgress: (progressEvent: any) => {
                const uploadedPercent = (progressEvent.loaded * 100) / progressEvent.total;
                const uploadedFraction = uploadedPercent / 100;
                const totalStageFraction: number = 0.125;
                let totalOverallFraction = uploadedFraction * totalStageFraction;
                totalOverallFraction = totalOverallFraction + 0.875;

                this.props.setProgress(totalOverallFraction * 100);
            }
        }*/

        const response = {data: {id: 'lol'}};// await axios.post('/api/upload', formData, config);

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
                <input type="text" ref={ this.downloadLink } className="form-control" value={ this.state.url } />
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
