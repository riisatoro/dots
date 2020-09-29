import React, { Component } from 'react';
import ReacDOM from 'react-dom';
import axios from 'axios';

import { connect } from 'react-redux';
import { HIDE_AUTH_FORM, SEND_REGISTER_REQUEST, SEND_LOGIN_REQUEST } from '../redux/types.js';
import getToken from '../actions/token.js';


class Auth extends Component {

    changeInputField(event) {
    	this.setState({value: event.target.value});
    }

	hideAuthForm() {
		this.props.onClickHideAuth()
	}

	onClickLogin(e) {
		e.preventDefault()
		let payload = { 
			username: e.target.username.value,
			password: e.target.password.value
		}
		this.props.onClickLogin(payload)
	}

	onClickRegister(e) {
		e.preventDefault()
		let payload = { 
			username: e.target.username.value,
			email: e.target.email.value,
			password: e.target.password.value,
			password2: e.target.password2.value
		}
		this.props.onClickRegister(payload)
	}

	render(props) {
		return (
			<section >
		    	<div >
		    		<div >
		    			<p >Log in or create your account</p>
		    			<button onClick={this.hideAuthForm.bind(this)}>X</button>
		    			<form onSubmit={this.onClickLogin.bind(this)}>
		    				<input type="text" name="username" placeholder="login"></input>
		    				<input type="password" name="password" placeholder="password"></input>
		    				<button>Login</button>
		    			</form>
		    			<br />
		    			<form onSubmit={this.onClickRegister.bind(this)}>
		    				<input type="text" name="username" placeholder="login"></input>
		    				<input type="email" name="email" placeholder="email"></input>
		    				<input type="password" name="password" placeholder="password"></input>
		    				<input type="password" name="password2" placeholder="confirm password"></input>
		    				<button>Register</button>
		    			</form>
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
		},
		
		onClickLogin: (payload) => {
			const asyncLogin = () => {
				let token = getToken()
				axios({
  					method: 'post',
  					url: '/api/auth/login/',
  					headers: {"X-CSRFToken": getToken()},
  					data: {
    					username : payload.username,
    					password : payload.password,
  					},
  				}
				).then(function (response) {
					let answer = {status:response.status, data:response.data}
					dispatch({type: SEND_LOGIN_REQUEST, payload: answer });
  				});

  				return {type: "", payload: {}}
			}
			dispatch(asyncLogin())
		},
		
		onClickRegister: (payload) => {
			const asyncRegister = () => {
				let token = getToken()
				axios({
  					method: 'post',
  					url: '/api/auth/register/',
  					headers: {"X-CSRFToken": getToken()},
  					data: payload,
  				}
				).then(function (response) {
					let answer = {status:response.status, data:response.data}
					dispatch({type: SEND_REGISTER_REQUEST, payload: answer });
  				});

  				return {type: "", payload: {}}
			}
			dispatch(asyncRegister())
		},
	})
)(Auth);
