import * as React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import Download from './Download';
import Footer from './Footer';
import Upload from './Upload';

class App extends React.Component {

	/**
	 * Render the component.
	 *
	 * @return {JSX}
	 */
    public render() {
        return (
            <Router>
				<div>
			      	<div>
				        <a href="/"><h1>send<span>sh.it</span></h1></a>
				    </div>
			        <Route exact={ true } path="/" component={ Upload } />
			        <Route path="/:id/:key" component={ Download } />
		            <Footer />
		      	</div>
		  	</Router>
        );
    }
}

export default App;
