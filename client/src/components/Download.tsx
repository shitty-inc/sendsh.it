import axios from 'axios';
import * as filesaver from 'file-saver';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { decrypt } from '../lib/crypto';
import { b64toBlob } from '../lib/file';

export interface DownloadProps { id: string; key: string; }

class Download extends React.Component<RouteComponentProps<DownloadProps>, any> {

	/**
	 * Component constructor.
	 */
	constructor(props: RouteComponentProps<DownloadProps>) {
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
		const response = await axios.get('https://q19w604ib9.execute-api.eu-west-1.amazonaws.com/dev/download', {
			params: {
				id,
			}
		});

		const decrypted: Buffer = await decrypt(new Buffer(response.data.file, 'hex'), key, (obj) => {
			return obj;
		});

		const { file, name } = JSON.parse(decrypted.toString());
		const mimeString: string = file.split(',')[0].split(':')[1].split(';')[0];
		const blob: Blob = b64toBlob(file.split(',')[1], mimeString);

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
