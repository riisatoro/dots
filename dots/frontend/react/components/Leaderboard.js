import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import "../../static/css/leaderboard.css";

import { RECEIVE_LEADERS, } from '../redux/types.js';


class Leaderboard extends Component {
	componentDidMount() {
		this.props.getLeaderboard(this.props.store.user.token)
	}
	
	render() {
		let data = this.props.store.leaders
		return (
			<section className="leaderboard">
				<h1>Results</h1>
				<div>
					{data.map((item, index) => {
						return <div key={index}>
							<p>Winner: {item.winner}</p>
							<p>captured {item.win_score} points</p>
							<p>Looser: {item.looser}</p>
							<p>captured {item.loose_score} points</p>
						</div>
					}) }
				</div>	
			</section>
		);
	}
}


export default connect(
	state => ({
		store: state
	}),
	dispatch=>({
		getLeaderboard: (token) => {
			const getLeaderboardRequest = (token) => {
				axios({
					method: "GET",
					url: "api/match/",
					headers: {"Authorization": "Token "+token}
				}).then( (response) => { dispatch({type: RECEIVE_LEADERS, payload: response}) } )
				
			}
			getLeaderboardRequest(token)
		}
	})
)(Leaderboard);