import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import { RECEIVE_LEADERS } from '../redux/types.js';


class Leaderboard extends Component {
	componentDidMount() {
		this.props.getLeaderboard(this.props.store.user.token)
	}
	
	render() {
		let data = this.props.store.leaders

		return (
			<section className="leaderboard">

					{data.map((item, index) =>{

						if(item.equal)
						{return(
							<div key={index}>
								<p>No winners here!</p>
								<p>{item.winner} and {item.looser}</p>
								<p>Score: {item.win_score}</p>
							</div>)
						}
						else 
						{return(
							<div key={index}>
								<p>Winner: {item.winner}</p>
								<p>Looser: {item.looser}</p>
								<p>Win score: {item.win_score}</p>
								<p>Loose score: {item.loose_score}</p>
							</div>)
						}
					})}
				
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