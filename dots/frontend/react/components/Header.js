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
		switch(this.props.store.user.isAuth){
			case true: navigation = [
					<a href="#">New game</a>,
					<a href="#">Leaderboard</a>,
					<a href="#">Logout</a>,
				];
			case false: navigation = [
					<a href="#" onClick={this.openAuthForm.bind(this)}>Login or Register</a>,
				];
		}

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