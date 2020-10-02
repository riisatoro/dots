import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import { SET_LEADERS } from '../redux/types.js';


class Leaderboard extends Component {

	render() {
		
		let res = this.props.store.leaders

		let list = res.map((item, index) => {
			return <div>
				<div>
				<p key={"win-player"+index}>Winner: <span className="">{item.winner}</span></p>
				<p key={"win-score"+index}>Score: {item.win_score}</p>
				</div>
				<div>
				<p key={"win-looser"+index}>Looser: <span className="">{item.looser}</span></p>
				<p key={"loose-score"+index}>Score:{item.loose_score}</p>
				</div>
				</div>
			
		})

		return (
			<section className="leaderboard">
				<h1>Results</h1>
				<div>
					{list}
					</div>
			</section>
		);
	}
}


export default connect(
	state => ({
		store: state
	}),

	dispatch => ({})
)(Leaderboard);