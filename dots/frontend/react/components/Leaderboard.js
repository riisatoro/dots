import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import "../../static/css/leaderboard.css";

import { RECEIVE_LEADERS } from '../redux/types.js';


class Leaderboard extends Component {
	componentDidMount() {
		this.props.getLeaderboard(this.props.store.user.token)
	}
	
	render() {
		let data = this.props.store.leaders
		let win_list = []
		let equal_list = []

		return (
			<section className="leaderboard">
				<div>
					{data.map(item =>
						<p></p>
					)}
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