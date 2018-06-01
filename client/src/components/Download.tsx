import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as filesaver from 'file-saver';
import * as parseDataUri from 'parse-data-uri';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { decrypt } from '../lib/crypto';
import { stagePercent } from '../lib/file';

export interface DownloadRouteProps { id: string; key: string; }
export interface DownloadProps extends RouteComponentProps<DownloadRouteProps> { setProgress: (progress: number) => void; }
export interface DownloadState { message: string; }

class Download extends React.Component<DownloadProps, DownloadState> {

	/**
	 * Order of progress events.
	 *
	 * @type {string[]}
	 */
    private progressOrder: string[] = ['download', 'pbkdf2 (pass 1)', 'scrypt', 'pbkdf2 (pass 2)', 'aes', 'twofish', 'salsa20'];

	/**
	 * Component constructor.
	 */
	constructor(props: DownloadProps) {
		super(props);

		this.state = {
			message: 'Downloading....',
		}
	}

	/**
	 * Component will mount lifecycle event.
	 *
	 * @return {void}
	 */
	public componentWillMount() {
		const { match: { params } } = this.props;

		this.handleDownload(params.id, params.key);
	}

	/**
	 * Download and decrypt the file.
	 *
	 * @param  {string} id
	 * @param  {string} key
	 * @return {void}
	 */
	public async handleDownload(id: string, key: string) {
		const config: AxiosRequestConfig = {
  			onDownloadProgress: (progressEvent: any) => {
				const downloadedPercent: number = (progressEvent.loaded * 100) / progressEvent.total;

                this.props.setProgress(stagePercent(downloadedPercent, this.progressOrder.length, this.progressOrder.indexOf('download')));
            },
            params: {
				id,
			},
        }

        let response: AxiosResponse<string>;

        try {
    		response = await axios.get('/api/download', config);
    	} catch (e) {
    		return this.setState({
    			message: e.message,
    		})
    	}

		const buffer: Buffer = new Buffer(response.data, 'hex');
		const decrypted: Buffer = await decrypt(buffer, key, obj => {
			const stageCompletedPercent: number = (obj.i / obj.total) * 100;

            this.props.setProgress(stagePercent(stageCompletedPercent, this.progressOrder.length, this.progressOrder.indexOf(obj.what)));
		});

		const { url, name } = JSON.parse(decrypted.toString());
		const parsedUri: any = parseDataUri(url);
		const blob: Blob = new Blob([parsedUri.data], { type: parsedUri.mimeType });

		filesaver.saveAs(blob, name);
	}

	/**
	 * Render the component.
	 *
	 * @return {JSX}
	 */
	public render() {
		return (
			<div className="text-center">
				<p>{ this.state.message }</p>
			</div>
		);
	}
}

export default Download;
