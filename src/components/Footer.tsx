import * as React from 'react';

class Footer extends React.Component {

	/**
	 * Render the component.
	 *
	 * @return {JSX}
	 */
	public render() {
		return (
			<footer id="footer">
				<div className="container text-center">
					<p><a href="https://github.com/threesquared/sendsh.it" target="_blank">About</a></p>
				</div>
			</footer>
		);
	}
}

export default Footer;
