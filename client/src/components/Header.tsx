import * as React from 'react';

class Header extends React.Component {

	/**
	 * Render the component.
	 *
	 * @return {JSX}
	 */
	public render() {
		return (
			<div className="row logo">
	      		<div className="col-md-12 text-center">
		        	<a href="/"><h1 className="h1">send<span>sh.it</span></h1></a>
	        	</div>
		    </div>
		);
	}
}

export default Header;
