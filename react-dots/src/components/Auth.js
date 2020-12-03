import React from 'react';
import { connect } from 'react-redux';
import  Login  from './Login.js';
import  Register  from './Register.js';


function Auth(props) {

	return (
		<section>
		<div className="row">
			<div className="container-fluid col--12 width-90">
						{ props.store.reply.error && <div className="alert alert-danger">{props.store.reply.message}</div> }
			</div>
			
			<div className="col-6">
				<Register />
			</div>

			<div className="col-6">
				<Login />
			</div>
		
		</div>
		</section>
	)
}


export default connect(
	state => ({
		store: state
	}) 
)(Auth);
