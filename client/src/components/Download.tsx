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
	 * Order of download stage events.
	 *
	 * @type {string[]}
	 */
    private downloadStages: string[] = [
		'download',
		'pbkdf2 (pass 1)',
		'scrypt',
		'pbkdf2 (pass 2)',
		'aes',
		'twofish',
		'salsa20'
	];

	/**
	 * Component constructor.
	 */
	constructor(props: DownloadProps) {
		super(props);

		this.state = {
			message: 'Downloading some shit...',
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

                this.props.setProgress(stagePercent(downloadedPercent, this.downloadStages.length, this.downloadStages.indexOf('download')));
            },
            params: {
				id,
			},
        }

        let response: AxiosResponse<string>;

        try {
    		response = await axios.get('https://y4si76dsxj.execute-api.eu-west-1.amazonaws.com/dev/api/download', config);
    	} catch (e) {
    		this.props.setProgress(0);

    		return this.setState({
    			message: e.message,
    		})
    	}

    	this.setState({
            message: 'Decrypting some shit...',
        });

		const buffer: Buffer = new Buffer(response.data, 'hex');
		const decrypted: Buffer = await decrypt(buffer, key, obj => {
			const stageCompletedPercent: number = (obj.i / obj.total) * 100;

            this.props.setProgress(stagePercent(stageCompletedPercent, this.downloadStages.length, this.downloadStages.indexOf(obj.what)));
		});

		const { url, name } = JSON.parse(decrypted.toString());
		const parsedUri: any = parseDataUri(url);
		const blob: Blob = new Blob([parsedUri.data], { type: parsedUri.mimeType });

		this.setState({
            message: 'Done',
        });

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
