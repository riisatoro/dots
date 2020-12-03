import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import { 
	SHOW_AUTH_FORM, 
	SEND_LOGOUT_REQUEST,
	SHOW_SETTINGS, 
	HIDE_RESULTS, 
	HIDE_LEADERS, 
	RECEIVE_AUTH_REPLY, 
	RECEIVE_LEADERS } from '../redux/types.js';

class Header extends Component {

	openAuthForm() {
		this.props.onClickOpenAuth()
		console.log("Open")
	}

	logoutUser(e) {
		this.props.logoutUser();
	}

	openSettings(e) {
		this.props.hideResults();
		this.props.openSettings();
	}

	onOpenLeaders(e) {
		this.props.getLeaderboard(this.props.store.user.token);
	}

	render() {
		let navigation = []
		if(this.props.store.user.auth) {
			navigation = [
				<div className="col-sm-8 col-md-3 new-game" key="new-game">
					<a href="#" key="0" className="container" onClick={this.openSettings.bind(this)}>New game</a>
				</div>,
				<div className="col-sm-8 col-md-3" key="leaders">
					<a href="#" key="1" className="container" onClick={this.onOpenLeaders.bind(this)}>Leaderboard</a>
				</div>,
				<div className="col-sm-8 col-md-3" key="logout">
					<a href="#" key="2" className="container" onClick={this.logoutUser.bind(this)}>Logout</a>
				</div>
			]
		} else {
			navigation = [
				<div className="col-6 align-center" key="login">
					<a href="#" key="0" onClick={this.openAuthForm.bind(this)}>Login or Register</a>
				</div>
			]
		}

		return (
			<section className="header">
				<div className="container-fluid">
					
					<div className="row">
						<h1 className="container align-center">Dots game</h1>
					</div>

					<div className="row justify-content-center">
						{navigation}
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
		onClickOpenAuth: () => {
			dispatch({type: SHOW_AUTH_FORM, payload: true})
		},
		
		logoutUser: () => {
			const asyncLogout = () => {
				axios({
  					method: 'get',
  					url: '/api/auth/logout/'
  				}
				).then(function (response) {
					dispatch({type: SEND_LOGOUT_REQUEST, payload: {} });
  				});

  				return {type: "", payload: {}}
			}
			dispatch(asyncLogout())
		},

		openSettings: () => {
			dispatch({type: SHOW_SETTINGS, payload: {}})
		},

		hideResults: () => {
			dispatch({type: HIDE_RESULTS, payload: {}})	
		},

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
)(Header);