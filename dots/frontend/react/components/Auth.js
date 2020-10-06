import React, { Component } from 'react';
import ReacDOM from 'react-dom';
import axios from 'axios';
import { useForm } from "react-hook-form";

import { connect } from 'react-redux';
import  Login  from './Login.js';
import  Register  from './Register.js';



function Auth(props) {

	return (
		<section>
			<Register />
			<Login />
		</section>
	)
}


export default connect(
	state => ({
		store: state
	}) 
)(Auth);
