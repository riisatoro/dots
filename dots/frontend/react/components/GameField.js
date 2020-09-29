import React, { Component } from 'react';
import ReacDOM from 'react-dom';
import { connect } from 'react-redux';

import { DRAW_DOT } from '../redux/types.js'

import "../../static/css/game_field.css";


class GameField extends Component {

	dot_clicked(e) {
		let index = e.target.id;
		let y_axe = index%10;
		let x_axe = (index-y_axe)/10;
		console.log({y_axe, x_axe})
		this.props.onDotClicked({y_axe, x_axe})
	}

	render(props) {

		let item = this.props.store.field.map((i, index_i) => 
			<div className="input__row" key={index_i}>
				{i.map((j, index_j) => 
					<div className={j} key={index_i*10 + index_j} id={index_i*10 + index_j} onClick={this.dot_clicked.bind(this)}>
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
		onDotClicked: (position) => {
			dispatch({type: DRAW_DOT, payload: position})
		}
	}
	))(GameField);