import React from 'react';
import { useForm } from "react-hook-form";

import { connect } from 'react-redux';
import { 
	COLOR_CHOOSED, 
	START_NEW_GAME, 
	FIELD_SIZE_CHANGED,
	UPDATE_PLAYERS_NAME, 
} from '../redux/types.js';

import "../../public/css/settings.css";


function Settings(props) {
	const {register, handleSubmit, errors} = useForm();

	let colors = ["orange_color", "red_color", "blue_color", "yellow_color", "green_color"]

	function color1Clicked(e) {
		props.setPlayerColor(0, e.target.id)
		
		/* pass */
		props.setPlayersName("default1", "default2")
	}

	function color2Clicked(e) {
		props.setPlayerColor(1, e.target.id)
	}

	function newFieldSize(e) {
		let size = e.target.value
		if(size>5 && size<16){
			props.changeFieldSize(size)
		}
	}

	function submitForm(e) {
		if (props.store.players[0].index !== props.store.players[1].index 
			&& props.store.players[0].index !== -1
			&& props.store.players[1].index !== -1)
		{
			props.setPlayersName(e.player1, e.player2)
			props.startNewGame()
		}
		
	}


	return (
		<section className="field">
		<div className="alert alert-primary col-5 block-margin" role="alert">Choose a color. Colors can't be the same</div>

		<form onSubmit={handleSubmit(submitForm)}>
			<p className="h2 align-center">Player 1</p>

			<div className="row justify-content-center width-90">
			<div className="form-group col-8" key="username">
				<input 
					className="form-control space-around" 
					type="text"
					name="player1"
					placeholder="Nickname"
					autoComplete="off"
					ref={register({required: true, minLength:5, maxLength: 20, pattern: /^[A-Za-zА-Яа-я0–9]/ })} />
					{errors.player1 && <div className="alert alert-danger">Nickname reqiured (only characters and numbers)</div>}
			</div>
			</div>


				
				<div className="row justify-content-center width-90">
					{colors.map((color, index) =>
					<div className="col-2" key={index+"_wrapper"}>
						<input 
							className="block-margin"
							type="radio" 
							key={index*10} 
							id={index} 
							name="color1"
							onClick={color1Clicked} /> <div className={color}> </div>
					</div>
					)}
				</div>
				

			<p className="h2 align-center">Player 2</p>

			<div className="row justify-content-center width-90">
			<div className="form-group col-8" key="username">
			<input 
				className="form-control space-around" 
				type="text"
				name="player2"
				placeholder="Nickname"
				autoComplete="off"
				ref={register({required: true, minLength:5, maxLength: 20, pattern: /^[A-Za-zА-Яа-я0–9]/ })} />
			{errors.player2 && <div className="alert alert-danger">Nickname required (only characters and numbers)</div>}
			</div>
			</div>

			<div className="row justify-content-center width-90">
			{colors.map((color, index) =>
					<div className="wrapper_color col-2" key={index+"_wrapper"}>
						<input 
							className="block-margin"
							type="radio" 
							key={index*20} 
							id={index} 
							name="color2"
							onClick={color2Clicked} /> <div className={color}> </div>
					</div>
					)}
			</div>

		<div className="row justify-content-center width-90">
		<div className="form-group col-8" key="username">
			<input 
				className="form-control space-around" 
				type="number"
				key="field_size"
				name="size"
				placeholder="Field size"
				onChange = {number => newFieldSize(number)}
				ref={register({required: true, min:6, max: 15 })}/>
		</div>
		</div>
		<div className="row justify-content-center">
			{errors.size && <div className="alert alert-danger col-8">Field size required (6-15)</div>}
		</div>
			<div className="align-center">
					<button className="btn btn-success space-bottom">Play!</button>
				</div>

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

		changeFieldSize: (size) => {
			dispatch({type: FIELD_SIZE_CHANGED, payload: {size: size} })	
		},

		startNewGame: () => {
			dispatch({type: START_NEW_GAME, payload: {} })	
		},

		setPlayersName: (p1, p2) => {
			dispatch({type: UPDATE_PLAYERS_NAME, payload: {p1: p1, p2: p2}})
		}
	}
	))(Settings);