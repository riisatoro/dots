import React, { Component } from 'react';
import ReacDOM from 'react-dom';
import axios from 'axios';
import { useForm } from "react-hook-form";

import { connect } from 'react-redux';
import { RECEIVE_AUTH_REPLY } from '../redux/types.js';


function Login(props) {

	const {register, handleSubmit, errors} = useForm();

	const onSubmitLogin = (data) => {
		props.sendLoginForm(data)
	}
          
	return (
		<section>
			<div>
				<div>
					<p>{ props.store.reply.error && props.store.reply.message }</p>
				</div>

				<form onSubmit={handleSubmit(onSubmitLogin)}>
					<input 
						className="" 
						type="text" 
						name="username"
						placeholder="Username"
						ref={register( {required: true, maxLength: 20, pattern: /^[A-za-z0–9]/ } )}>
					</input>
					<p>{errors.username && "This field required."}</p>

					<input 
						className=""
						type="password" 
						name="password"
						placeholder="Password"
						ref={register( {required: true, minLength: 5, pattern: /^[a-zA-Z0-9]/ } )}>
					</input>
					<p>{errors.password && "This field required."}</p>

					<button>Login</button>
				</form>
			</div>
		</section>
	)
}


export default connect(
	state => ({
		store: state
	}),

	dispatch => ({

		sendLoginForm: (data) => {
			const loginFormRequest = (data) => {
				axios.post(
					"api/auth/login/",
					data,
				).then( (response) => { dispatch({type: RECEIVE_AUTH_REPLY, payload: response}) } )
				
			}
			loginFormRequest(data)
		}
	})
)(Login);
