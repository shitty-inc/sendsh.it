import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as filesaver from 'file-saver';
import * as parseDataUri from 'parse-data-uri';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { decrypt } from '../lib/crypto';
import { b64toBlob } from '../lib/file';

export interface DownloadRouteProps { id: string; key: string; }
export interface DownloadProps extends RouteComponentProps<DownloadRouteProps> { setProgress: (progress: number) => void; }
export interface DownloadState { message: string; }

class Download extends React.Component<DownloadProps, DownloadState> {

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
            params: {
				id,
			}
        }

		const response: AxiosResponse<string> = await axios.get('/api/download', config);

		const buffer: Buffer = new Buffer(response.data, 'hex');
		const decrypted: Buffer = await decrypt(buffer, key, obj => {
			return obj;
		});

		const { url, name } = JSON.parse(decrypted.toString());
		const parsedUri: any = parseDataUri(url);
		const blob: Blob = b64toBlob(parsedUri.data.toString(), parsedUri.mimeType);

		filesaver.saveAs(blob, name);
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
			</div>
		);
	}
}

export default Download;
