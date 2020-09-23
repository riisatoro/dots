import React, { Component } from 'react';
import ReacDOM from 'react-dom';


class App extends Component {
	render() {
		return (
			<h1>Welcome to the 'Dots' game!</h1>
		);
	}
}

ReacDOM.render(<App />, document.getElementById('react-app'));