import React, { Component } from 'react';
import ReacDOM from 'react-dom';
import { useForm } from "react-hook-form";

import { connect } from 'react-redux';
import { HIDE_SETTINGS, START_GAME, SET_COLOR, UPDATE_PLAYERS_NAME } from '../redux/types.js';

import "../../static/css/settings.css";


function Settings(props) {
	const {register, handleSubmit, errors} = useForm();

	let colors1 = ["orange_color", "red_color", "blue_color"]
	let colors2 = ["green_color", "yellow_color", "black_color"]

	function color1Clicked(e) {
		props.store.players[0].index = e.target.id
	}

	function color2Clicked(e) {
		props.store.players[1].index = e.target.id
	}

	function submitForm(e) {
		console.log("submit")
	}

	colors1[props.store.players[0].index] = colors1[props.store.players[0].index]+" choosed"
	colors2[props.store.players[1].index] = colors2[props.store.players[1].index]+" choosed"

	return (
		<section className="field">
		<form onSubmit={handleSubmit(submitForm)}>
			<p>Player 1</p>
				<input 
					type="text"
					name="player1"
					placeholder="Nickname"
					ref={register({required: true, minLength:5, maxLength: 20, pattern: /^[A-za-z0–9]/ })} />
				
				<div className="wrapper_color">
					{colors1.map((color, index) =>
						<div key={index*20} id={index} className={color} onClick={color1Clicked}></div>
					)}
				</div>

			<p>Player 2</p>
			<input 
				type="text"
				name="player2"
				placeholder="Nickname"
				ref={register({required: true, minLength:5, maxLength: 20, pattern: /^[A-za-z0–9]/ })} />
			
			<div className="wrapper_color">
				{colors2.map((color, index) => 
					<div key={index*10} id={index} className={color} onClick={color2Clicked}></div>
				)}
			</div>
			<button>Play!</button>
		</form>
		</section>
	)
}


export default connect(
	state => ({
		store: state
	})
)(Settings);