import React, { Component } from 'react';
import Header from './Header.js'
import GameField from './GameField.js'
import { connect } from 'react-redux';


class App extends Component {
	render(props) {
		return (
			<section className="content">
				<Header />
				<GameField />
			</section>
		);
	}
}

export default connect(
	state => ({
		testStore: state
	}),
	dispatch => ({}))(App);