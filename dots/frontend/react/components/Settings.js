import React, { Component } from 'react';
import ReacDOM from 'react-dom';

import { connect } from 'react-redux';


class Settings extends Component {
	
	render(props) {
		return (
			<section className="field">
		    	<div></div>
		    </section>
		  )
		}
}

export default connect(
	state => ({
		store: state
	}),

	dispatch => ({})
)(Settings);