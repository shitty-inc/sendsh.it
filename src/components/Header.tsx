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
		        	<h1 className="h1"><a href="/">send<span>sh.it</span></a></h1>
	        	</div>
		    </div>
		);
	}
}

export default Header;
