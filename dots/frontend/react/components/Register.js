import React, { Component } from 'react';
import ReacDOM from 'react-dom';
import axios from 'axios';
import { useForm } from "react-hook-form";

import { connect } from 'react-redux';
import { RECEIVE_AUTH_REPLY } from '../redux/types.js';


function Register(props) {

	const {register, handleSubmit, errors} = useForm();
	
	const onSubmitRegister = (data) => {
		if(data.password == data.password2) {
			props.sendRegisterForm(data);
		}
	};

	return (
		<section>
			<div>
				<div>
					<p>{ props.store.reply.error && props.store.reply.message }</p>
				</div>
				<form onSubmit={handleSubmit(onSubmitRegister)}>
					<input 
						className="" 
						type="text" 
						name="username"
						placeholder="Username"
						ref={register( {required: true, minLength: 5, maxLength: 20, pattern: /^[A-za-z0–9_]/ } )}>
					</input>
					<p>{errors.username && "Max 20 characters only A-z and numbers"}</p>

					<input 
						className="" 
						type="email" 
						name="email"
						placeholder="Email"
						ref={register( {required: true, pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.(com)/ } )}>
					</input>
					<p>{errors.email && "Invalid email"}</p>

					<input 
						className="" 
						type="password" 
						name="password"
						placeholder="Password"
						ref={register( {required: true, minLength: 5, pattern: /^[a-zA-Z0-9]/ } )}>
					</input>
					<p>{errors.password && "Password should be more than 5 characters and numbers"}</p>
					
					<input 
						className="" 
						type="password" 
						name="password2"
						placeholder="Confirm password"
						ref={register( {required: true, minLength: 5, pattern: /^[a-zA-Z0-9]/ } )}>
					</input>
					<p>{errors.password2 && "Password should be more than 5 characters and numbers"}</p>

					<button>Register</button>
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
		sendRegisterForm: (data) => {
			const registerFormRequest = (data) => {
				axios.post(
					"api/auth/register/",
					data,
				).then( (response) => { dispatch({type: RECEIVE_AUTH_REPLY, payload: response}) } )
				
			}
			registerFormRequest(data)
		}
	})
)(Register);
