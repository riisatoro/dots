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

	function colorClicked(e) {
		console.log(e.target.id)
	}

	function submitForm(e) {
		console.log("submit")
	}

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
						<div id={index} className={color} onClick={colorClicked}></div>
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
					<div id={index} className={color} onClick={colorClicked}></div>
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