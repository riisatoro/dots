import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import { SHOW_AUTH_FORM, SEND_LOGOUT_REQUEST } from '../redux/types.js';

import Auth from "./Auth.js";


class Header extends Component {

	openAuthForm() {
		this.props.onClickOpenAuth()
	}

	logoutUser(e) {
		this.props.logoutUser();
	}

	render() {
		let navigation = []
		if(this.props.store.user.isAuth) {
			navigation = [
					<a href="#">New game</a>,
					<a href="#">Leaderboard</a>,
					<a href="#" onClick={this.logoutUser.bind(this)}>Logout</a>]
		} else {
			navigation = [<a href="#" onClick={this.openAuthForm.bind(this)}>Login or Register</a>]
		}
		

		console.log(this.props.store.user.isAuth)

		return (
			<section className="header">
				<h1 className="header__logo">Dots game</h1>
				<div className="header__nav">{navigation}</div>
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
	})
)(Header);