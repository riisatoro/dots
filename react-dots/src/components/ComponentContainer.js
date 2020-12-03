import React, { Component } from 'react';
import { connect } from 'react-redux';

import Auth from './Auth.js';
import GameField from './GameField.js';
import Settings from './Settings.js';
import Results from './Results.js';
import Leaderboard from './Leaderboard.js';

import "../../public/css/default.css";


class ComponentContainer extends Component {
	render() {
		return (
			<section className="ComponentContainer">
				{ this.props.store.components.auth && <Auth /> }
		  		{ this.props.store.components.showSettings && <Settings /> }
			    { this.props.store.components.showField && <GameField /> }
			    { this.props.store.game_end && <Results /> }
			    { this.props.store.components.showLeaders && <Leaderboard /> }
		    </section>
		)
	}
}

export default connect(
	state => ({
		store: state
	})
)(ComponentContainer);