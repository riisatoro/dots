import React, { Component } from 'react';
import ReacDOM from 'react-dom';

import { connect } from 'react-redux';
import { HIDE_AUTH_FORM } from '../redux/types.js';

import "../../static/css/auth.css"


class Auth extends Component {
	hideAuthForm() {
		this.props.onClickHideAuth()
	}

	render(props) {
		return (
			<section className="auth">
		    	<div className="auth__wrapper">
		    		<div className="auth__block" onClick={this.hideAuthForm.bind(this)}>
		    			<p className="auth__title">Log in or create your account</p>
		    			<from method="POST">
		    			</from>
		    		</div>
		    	</div>	
		    </section>
		  )
		}
}

export default connect(
	state => ({
		store: state
	}),

	dispatch => ({
		onClickHideAuth: () => {
			dispatch({type: HIDE_AUTH_FORM, payload: false})
		}
	})
)(Auth);