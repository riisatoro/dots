import React, { Component } from 'react';
import { connect } from 'react-redux';

import Header from './Header.js';
import GameField from './GameField.js';
import Settings from './Settings.js';

class App extends Component {
	render() {
		return (
			<section className="content">
				<Header />
				{ this.props.store.components.showSettings && <Settings />}
				{ this.props.store.components.showField && <GameField />}
			</section>
		);
	}
}

export default connect(
	state => ({
		store: state
	}),

	dispatch => ({})
)(App);