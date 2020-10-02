import React, { Component } from 'react';
import ReacDOM from 'react-dom';
import { connect } from 'react-redux';

import { DRAW_DOT, PLAYER_CHANGED, CHECK_FIELD_FULL, HIDE_LEADERS } from '../redux/types.js'
import getToken from '../actions/token.js';
import axios from 'axios';

import "../../static/css/game_field.css";



class GameField extends Component {

	dot_clicked(e) {
		let index = e.target.id;
		let y_axe = index%5;
		let x_axe = (index-y_axe)/5;
		console.log(this.props.store.turn)

		this.props.onDotClicked([y_axe, x_axe], this.props.store.turn)
		this.props.checkFieldFull()
		if(this.props.store.game_end){
			this.props.saveMatchResults(this.props.store.results)
		}
		this.props.onPlayerChanged()
	}

	render(props) {
		let item = this.props.store.field.map((i, index_i) => 
			<div className="input__row" key={index_i}>
				{i.map((j, index_j) => 
					<div className={j} key={index_i*5 + index_j} id={index_i*5 + index_j} onClick={this.dot_clicked.bind(this)}>
					</div>)}
			</div>);


		return (
			<section className="field">
		    	<div>{item}</div>
		    </section>
		  )
		}
}

export default connect(
	state => ({
		store: state
	}),
	dispatch => ({
		onPlayerChanged: () => {
			dispatch({type: PLAYER_CHANGED})
		},

		onDotClicked: (position) => {
			dispatch({type: DRAW_DOT, payload: position})
		},

		checkFieldFull: () => {
			dispatch({type: CHECK_FIELD_FULL})
		},

		saveMatchResults: (results) => {
			
		},

		hideLeaders: () => {
			dispatch({type: HIDE_LEADERS})	
		}
	}
	))(GameField);