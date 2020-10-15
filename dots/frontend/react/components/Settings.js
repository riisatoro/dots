import React, { Component } from 'react';
import ReacDOM from 'react-dom';
import { useForm } from "react-hook-form";

import { connect } from 'react-redux';
import { HIDE_SETTINGS, START_NEW_GAME, SET_COLOR, UPDATE_PLAYERS_NAME, COLOR_CHOOSED } from '../redux/types.js';

import "../../static/css/settings.css";


function Settings(props) {
	const {register, handleSubmit, errors} = useForm();

	let colors = ["orange_color", "red_color", "blue_color", "yellow_color", "green_color"]

	let color_error = ""

	function color1Clicked(e) {
		props.setPlayerColor(0, e.target.id)
	}

	function color2Clicked(e) {
		props.setPlayerColor(1, e.target.id)
	}

	function submitForm(e) {
		if (props.store.players[0].index != props.store.players[1].index 
			&& props.store.players[0].index != -1
			&& props.store.players[1].index != -1)
		{
			props.startNewGame()
		}
		else {
			console.log("error")
			color_error = "Please, choose a color. Colors can' be the same."
		}
	}


	return (
		<section className="field">
		<p>Choose a color. Colors can't be the same.</p>
		<form onSubmit={handleSubmit(submitForm)}>
			<p>Player 1</p>
				<input 
					type="text"
					name="player1"
					placeholder="Nickname"
					ref={register({required: true, minLength:5, maxLength: 20, pattern: /^[A-za-z0–9]/ })} />
				
				
					{colors.map((color, index) =>
					<div className="wrapper_color" key={index+"_wrapper"}>
						<input 
							type="radio" 
							key={index*10} 
							id={index} 
							name="color1"
							onClick={color1Clicked} /> <div className={color}> </div>
					</div>
					)}
				

			<p>Player 2</p>
			<input 
				type="text"
				name="player2"
				placeholder="Nickname"
				ref={register({required: true, minLength:5, maxLength: 20, pattern: /^[A-za-z0–9]/ })} />
			
			{colors.map((color, index) =>
					<div className="wrapper_color" key={index+"_wrapper"}>
						<input 
							type="radio" 
							key={index*20} 
							id={index} 
							name="color2"
							onClick={color2Clicked} /> <div className={color}> </div>
					</div>
					)}
			<button>Play!</button>
		</form>
		</section>
	)
}


export default connect(
	state => ({
		store: state
	}),
	dispatch => ({
		setPlayerColor: (player, color) => {
			dispatch({type: COLOR_CHOOSED, payload: {player: player, color: color} })
		},

		startNewGame: () => {
			dispatch({type: START_NEW_GAME, payload: {} })	
		}
	}
	))(Settings);