import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import "../../static/css/results.css";

import { SHOW_AUTH_FORM, SEND_LOGOUT_REQUEST, SHOW_SETTINGS } from '../redux/types.js';


class Results extends Component {

	render() {

		let win_color = ""
		let loose_color = ""
		let res = this.props.store.results
		let players = this.props.store.players

		if (players[0].name == res.winner) {
			win_color = players[0].color
			loose_color = players[1].color
		} else {
			win_color = players[1].color
			loose_color = players[0].color
		}
		
		return (
			<section className="results">
				<h1 className="header">Results</h1>
				<div className="wrapper_this">
					<div>
						<p className="" key="win">Winner: {res.winner} ({win_color})</p>
						<p className="" key="loose">Score: {res.win_score}</p>
					</div>
					<div>
						<p className="" key="win_score">Looser: {res.looser} ({loose_color})</p>
						<p className="" key="loose_score">Score: {res.loose_score}</p>
					</div>
				</div>
			</section>
		);
	}
}

export default connect(
	state => ({
		store: state
	}),

	dispatch => ({
			})
)(Results);