import * as React from 'react';
import { RouteComponentProps } from 'react-router';

export interface DownloadProps { id: string; key: string; }

class Download extends React.Component<RouteComponentProps<DownloadProps>> {

	public constructor(props: any) {
        super(props);

        const { match: { params } } = this.props;

        this.state = params;
    }

    public render() {
        return (
            <div />
        );
    }
}

export default Download;
