import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import { SET_LEADERS } from '../redux/types.js';


class Leaderboard extends Component {

	componentDidMount() {
		this.props.getData();
	}

	render() {
		let res = this.props.store.leaders
		let list = []
		
		list = res.map( (item, index) => {
			return (<div>
				<div>
				<p key={"win-player"+index}>Winner: <span className="">{item.winner}</span></p>
				<p key={"win-score"+index}>Score: {item.win_score}</p>
				</div>
				<div>
				<p key={"win-looser"+index}>Looser: <span className="">{item.looser}</span></p>
				<p key={"loose-score"+index}>Score:{item.loose_score}</p>
				</div>
				</div>)
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

/*
<p className="" key="win">Winner: {this.res.winner} ({this.win_color})</p>
<p className="" key="loose">Score: {this.res.win_score}</p>
<p className="" key="win_score">Looser: {this.res.looser} ({this.loose_color})</p>
<p className="" key="loose_score">Score: {this.res.loose_score}</p>
*/

export default connect(
	state => ({
		store: state
	}),

	dispatch => ({
		getData: (payload) => {
			const asyncGetLeaders = () => {
				axios({
  					method: 'get',
  					url: '/api/match/'
  					}
				).then(function (response) {
					let data = response.data
					dispatch({type: SET_LEADERS, payload: data });
  				});

  				return {type: "", payload: {}}
			}
			dispatch(asyncGetLeaders())
		}

			})
)(Leaderboard);