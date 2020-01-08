import React from 'react';
import Progress from 'react-progress';
import { RouteComponentProps } from 'react-router';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import Download, { DownloadRouteProps } from './Download';
import Footer from './Footer';
import Header from './Header';
import Upload from './Upload';

export interface AppState { progress: number; }

class App extends React.Component<{}, AppState> {

	/**
	 * Component constructor.
	 */
    public constructor(props: {}) {
        super(props);

        this.state = {
			progress: 0,
        }

        this.setProgress = this.setProgress.bind(this);
        this.renderUpload = this.renderUpload.bind(this);
        this.renderDownload = this.renderDownload.bind(this);
    }

    /**
     * Update the progress bar.
     *
     * @param {number} progress
     */
    public setProgress(progress: number) {
    	this.setState({
    		progress,
    	})
    }

    /**
     * Render the upload page.
     *
     * @return {JSX}
     */
    public renderUpload() {
    	return (
    		<Upload
    			setProgress={ this.setProgress }
			/>
		)
    }

    /**
     * Render the download page.
     *
     * @return {JSX}
     */
    public renderDownload(props: RouteComponentProps<DownloadRouteProps>) {
    	return (
    		<Download
                {...props}
    			setProgress={ this.setProgress }
			/>
		)
    }

	/**
	 * Render the component.
	 *
	 * @return {JSX}
	 */
    public render() {
        return (
            <Router>
            	<React.Fragment>
					<div className="container">
						<Progress
							color="#3cb8f1"
							percent={ this.state.progress }
							hideDelay={ 0 }
	                        speed={ 0 }
						/>
						<div className="body">
							<Header />
						    <Switch>
						        <Route exact={ true } path="/" render={ this.renderUpload }/>
						        <Route path="/:id/:key" render={ this.renderDownload } />
					        </Switch>
				        </div>
			      	</div>
			      	<Footer />
		      	</React.Fragment>
		  	</Router>
        );
    }
}

export default App;
