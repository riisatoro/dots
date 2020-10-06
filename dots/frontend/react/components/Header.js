import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import { SHOW_AUTH_FORM, SEND_LOGOUT_REQUEST,
SHOW_SETTINGS, HIDE_RESULTS, SHOW_LEADERS, HIDE_LEADERS,SET_LEADERS } from '../redux/types.js';
import "../../static/css/header.css";
import Auth from "./Auth.js";


class Header extends Component {

	openAuthForm() {
		this.props.onClickOpenAuth()
	}

	logoutUser(e) {
		this.props.logoutUser();
	}

	openSettings(e) {
		this.props.hideResults();
		this.props.openSettings();
	}

	onOpenLeaders(e) {
		this.props.getData();
		this.props.openLeaders();
	}

	render() {
		let navigation = []
		if(this.props.store.user.auth) {
			navigation = [
					<a href="#" key="0" className="col-sm-2" onClick={this.openSettings.bind(this)}>New game</a>,
					<a href="#" key="1" className="col-sm-2" onClick={this.onOpenLeaders.bind(this)}>Leaderboard</a>,
					<a href="#" key="2" className="col-sm-2" onClick={this.logoutUser.bind(this)}>Logout</a>]
		} else {
			navigation = [<a href="#" key="0" onClick={this.openAuthForm.bind(this)}>Login or Register</a>]
		}

		return (
			<section className="header">
				<div className="">
				<h1 className="header">Dots game</h1>
				<div>{navigation}</div>
				{this.props.store.components.auth && <Auth />}
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

		onClickHideAuth: () => {
			dispatch({type: HIDE_AUTH_FORM, payload: false})
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

		openLeaders: () => {
			dispatch({type: SHOW_LEADERS, payload: {}})	
		},

		getData: () => {
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
)(Header);