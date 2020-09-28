import React, { Component } from 'react';
import { connect } from 'react-redux';

import { SHOW_AUTH_FORM } from '../redux/types.js';

import Auth from "./Auth.js";


class Header extends Component {

	openAuthForm() {
		this.props.onClickOpenAuth()
	}

	render() {
		let navigation = []
		if(this.props.store.user.isAuth) {
			navigation = [
					<a href="#">New game</a>,
					<a href="#">Leaderboard</a>,
					<a href="#">Logout</a>]
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
		}
	})
)(Header);