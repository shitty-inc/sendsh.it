import * as React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import Download from './Download';
import Footer from './Footer';
import Upload from './Upload';

class App extends React.Component {
    public render() {
        return (
            <Router>
				<div>
			      	<div>
				        <a href="/"><h1>send<span>sh.it</span></h1></a>
				    </div>
			        <Route exact={ true } path="/" component={ Upload } />
			        <Route path="/:id/:key" component={ Download } />
			        <div>
		                <p>This site will encrypt a file in your browser using the <a href="http://keybase.github.io/triplesec/">Triplesec</a> library with a random key generated for you by its PRNG.</p>
		                <p>The encrypted data is uploaded to us and you get a unique URL that will allow someone to download and decrypt your file.</p>
		                <p>Files are removed from the server as soon as they are downloaded or once they are over 24hrs old.</p>
		                <p><i>Disclaimer: This is just an experiment, if you have something important to encrypt you should probably aim to know much more about encryption than me.</i></p>
		            </div>
		            <Footer />
		      	</div>
		  	</Router>
        );
    }
}

export default App;
