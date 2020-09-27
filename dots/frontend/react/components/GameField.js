import React, { Component } from 'react';
import ReacDOM from 'react-dom';
import { connect } from 'react-redux';

import "./game_field.css";

class GameField extends Component {

	render(props) {
		let item = this.props.testStore

		return (
			<section className="field">
		    	<div>{item}</div>
		    </section>
		  )
		}
}

export default connect(
	state => ({
		testStore: state
	}),
	dispatch => ({}))(GameField);

/*
[<input type="text" value="0"></input>,
				
				<input type="text" value="2"></input>,
				<input type="text" value="3"></input>
				]
*/