import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import { SHOW_AUTH_FORM, SEND_LOGOUT_REQUEST,
SHOW_SETTINGS } from '../redux/types.js';

import Auth from "./Auth.js";


class Header extends Component {

	openAuthForm() {
		this.props.onClickOpenAuth()
	}

	logoutUser(e) {
		this.props.logoutUser();
	}

	openSettings(e) {
		this.props.openSettings();
	}

	render() {
		let navigation = []
		if(this.props.store.user.isAuth) {
			navigation = [
					<a href="#" key="0" className="col-sm-2" onClick={this.openSettings.bind(this)}>New game</a>,
					<a href="#" key="1" className="col-sm-2">Leaderboard</a>,
					<a href="#" key="2" className="col-sm-2" onClick={this.logoutUser.bind(this)}>Logout</a>]
		} else {
			navigation = [<a href="#" key="0" onClick={this.openAuthForm.bind(this)}>Login or Register</a>]
		}

		return (
			<section className="header">
				<h1 >Dots game</h1>
				<div>{navigation}</div>
				{this.props.store.components.showAuth && <Auth />}
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
		}
	})
)(Header);