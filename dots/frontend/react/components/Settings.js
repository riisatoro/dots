import React, { Component } from 'react';
import ReacDOM from 'react-dom';

import { connect } from 'react-redux';
import { HIDE_SETTINGS, START_GAME } from '../redux/types.js';

import "../../static/css/settings.css";


class Settings extends Component {
	
	setSettings(e) {
		this.props.closeSettings();
		this.props.startGame();
	}

	setColor(e) {
		console.log(e.target.getAttribute('id'))
	}

	render(props) {
		let colors = [
			"orange_block", "green_block", "red_block", "blue_block"
		]
		return (
			<section className="field">
		    	<p>Settings</p>
		    	
		    	<div className="">
		    		<form onSubmit={this.setSettings.bind(this)}>
			    	    <div className="">
			    	    	<input type="text" name="player2" placeholder="Player name"/>
							{colors.map((i, index) => <div className={i} key={"1"+index} id={"1-"+index} onClick={this.setColor.bind(this)}></div>)}	
			    	    </div>

			    	    <div className="">
			    	    	<input type="text" name="player2" placeholder="Player name"/>
			    	    	{colors.map((i, index) => <div className={i} key={"2"+index} id={"2-"+index} onClick={this.setColor.bind(this)}></div>)}	
			    	    </div>
			    	    <button>Start!</button>
			    	</form>
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
		closeSettings: () => {
			dispatch({type: HIDE_SETTINGS, payload: {}})
		},

		startGame: () => {
			dispatch({type: START_GAME, payload: {}})
		}
	})
)(Settings);