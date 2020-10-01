import React, { Component } from 'react';
import ReacDOM from 'react-dom';

import { connect } from 'react-redux';
import { HIDE_SETTINGS, START_GAME, SET_COLOR } from '../redux/types.js';

import "../../static/css/settings.css";


class Settings extends Component {
	setSettings(e) {
		this.props.closeSettings();
		this.props.startGame();
	}

	setColor(e) {
		let index = parseInt(e.target.getAttribute('id')[2])
		this.props.setPlayerColor(this.colors[index], e.target.getAttribute('id')[0]);
	}

	render(props) {
		this.colors = [
			"orange", "green", "red", "blue"
		]
		return (
			<section className="field">
		    	<p>Settings</p>
		    	
		    	<div className="">
		    		<form onSubmit={this.setSettings.bind(this)}>
			    	    <div className="">
			    	    	<input type="text" name="player2" placeholder="Player name"/>
							{this.colors.map((i, index) => <div className={i+" choice_color"} key={"1"+index} id={"1-"+index} onClick={this.setColor.bind(this)}></div>)}	
			    	    </div>

			    	    <div className="">
			    	    	<input type="text" name="player2" placeholder="Player name"/>
			    	    	{this.colors.map((i, index) => <div className={i+" choice_color"} key={"2"+index} id={"2-"+index} onClick={this.setColor.bind(this)}></div>)}	
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
		},

		setPlayerColor: (color, player) => {
			dispatch({type: SET_COLOR, payload: {color:color, player: parseInt(player)}})
		}
	})
)(Settings);