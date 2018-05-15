import axios from 'axios';
import * as React from 'react';
import { encrypt, generate } from '../lib/crypto';
import UploadButton, { UploadedFileData } from './UploadButton';

export interface UploadState { password: any; message: any; }

class Upload extends React.Component<{}, UploadState> {

    /**
     * Component constructor.
     */
    public constructor(props: {}) {
        super(props);

        this.state = {
            message: 'Pick a file (5MB)',
            password: null,
        }

        this.handleUpload = this.handleUpload.bind(this);
    }

    /**
     * Component will mount lifecycle event.
     *
     * @return {void}
     */
    public async componentWillMount() {
        const password: string = await generate();

        this.setState({
            password,
        });
    }

    /**
     * Encrypt and upload the file.
     *
     * @param  {UploadedFileData} data
     * @return {void}
     */
    public async handleUpload(data: UploadedFileData) {
        const encrypted: Buffer = await encrypt(new Buffer(JSON.stringify(data)), this.state.password, (obj) => {
            return obj;
        });

        const formData: FormData = new FormData();
        const blob: Blob = new Blob([encrypted.toString('hex')], { type: 'application/octet-stream' });

        formData.append('upload', blob, 'encrypted');

        const response = await axios.post('https://q19w604ib9.execute-api.eu-west-1.amazonaws.com/dev/upload', formData)

        this.setState({
            message: `${location.origin}/#/${response.data.id}/${this.state.password}`,
        })
    }

    /**
     * Render the component.
     *
     * @return {JSX}
     */
    public render() {
        return (
            <div>
                <p>{ this.state.message }</p>
                <UploadButton
                    handleUpload={ this.handleUpload }
                />
            </div>
        );
    }
}

export default Upload;
