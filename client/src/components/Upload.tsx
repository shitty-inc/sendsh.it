import axios from 'axios';
import * as React from 'react';
import * as triplesec from 'triplesec';
import UploadButton, { UploadedFileData } from './UploadButton';

export interface UploadState { password: any; message: any; }

class Upload extends React.Component<{}, UploadState> {

    public constructor(props: any) {
        super(props);

        this.state = {
            message: null,
            password: null,
        }

        this.handleUpload = this.handleUpload.bind(this);
    }

    public componentWillMount() {
        triplesec.prng.generate(24, words => {
            const password: string = words.to_hex();

            this.setState({
                password,
            })
        });
    }

    public handleUpload(data: UploadedFileData) {
        triplesec.encrypt({
            data: new Buffer(JSON.stringify(data)),
            key: new Buffer(this.state.password),
            progress_hook: (obj) => {
                return obj;
            }
        }, (err: Error, buff: Buffer) => {
            const encrypted: string = buff.toString('hex');
            const formData: FormData = new FormData();
            const blob: Blob = new Blob([encrypted], { type: 'application/octet-stream'});

            formData.append('upload', blob, 'encrypted');

            axios.post('https://q19w604ib9.execute-api.eu-west-1.amazonaws.com/dev/upload', formData).then(res => {
                const id = res.data.id;

                this.setState({
                    message: `${location.origin}/#/${id}/${this.state.password}`,
                })
            })
        });
    }

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
