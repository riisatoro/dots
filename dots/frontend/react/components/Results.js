import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';


import { SHOW_AUTH_FORM, SEND_LOGOUT_REQUEST, SHOW_SETTINGS } from '../redux/types.js';


class Results extends Component {

	render() {

		let results = this.props.store.results

		let result_board = ""
		if(results.equal) {
			result_board = <div className="wrapper_this">
								<div>
									<p className="" key="win">No winners here!</p>
									<p className="" key="players">Players: {results.winner} and {results.looser}</p>
									<p className="" key="loose">Common score: {results.win_score}</p>
								</div>
							</div>
		} else {
			result_board = <div className="wrapper_this">
								<div>
									<p className="" key="win">Winner: {results.winner}</p>
									<p className="" key="loose">Score: {results.win_score}</p>
								</div>
								<div>
									<p className="" key="win_score">Looser: {results.looser}</p>
									<p className="" key="loose_score">Score: {results.loose_score}</p>
								</div>
							</div>
		}
		
		return (
			<section className="results">
				<h1 className="header">Results</h1>
				{result_board}
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