import React, { Component } from 'react';
import { connect } from 'react-redux';


class Results extends Component {

	render() {

		let results = this.props.store.results

		let result_board = ""
		if(results.equal) {
			result_board = <div className="container">
								<div className="space-around">
									<p className="align-center" key="win">No winners here!</p>
									<p className="align-center" key="players">Players: {results.winner} and {results.looser}</p>
									<p className="align-center" key="loose">Common score: {results.win_score}</p>
								</div>
							</div>
		} else {
			result_board = <div className="container">
								<div className="space-around">
									<p className="align-center" key="win">Winner: {results.winner}</p>
									<p className="align-center" key="loose">Score: {results.win_score}</p>
								</div>
								<div>
									<p className="align-center" key="win_score">Looser: {results.looser}</p>
									<p className="align-center" key="loose_score">Score: {results.loose_score}</p>
								</div>
							</div>
		}
		
		return (
			<section className="results">
				<p className="header align-center h3 space-around">Results</p>
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