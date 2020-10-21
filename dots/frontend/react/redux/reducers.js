import { 
	ADD_TRACK, 
	SEND_REGISTER_REQUEST, 
	DRAW_DOT, SHOW_AUTH_FORM, 
	HIDE_AUTH_FORM, 
	SEND_LOGIN_REQUEST, 
	SEND_LOGOUT_REQUEST,
	SHOW_SETTINGS,
	HIDE_SETTINGS,
	START_NEW_GAME,
	STOP_GAME,
	PLAYER_CHANGED,
	SET_COLOR,
	CHECK_FIELD_FULL, 
	UPDATE_PLAYERS_NAME,
	HIDE_RESULTS,
	RECIEVE_LEADERS,
	SHOW_LEADERS,
	HIDE_LEADERS,
	RECEIVE_LEADERS,
	RECEIVE_AUTH_REPLY,
	COLOR_CHOOSED,
	FIELD_SIZE_CHANGED,
	CALC_CAPTURED
} from './types.js';

import { loadState, getEmptyField } from './local_state.js';
import { isFullField } from '../actions/isFullField.js';
import { calcSquare } from '../actions/calcDotsSquare.js';
import getToken from '../actions/getToken.js';
import axios from 'axios';
import main from '../actions/calcSquare.js';
import { getSurrounded } from "../tests/getSurroundedField.js";


const color_title = ["O", "R", "B", "Y", "G"]

let initialState = loadState();

export function updateState(state = initialState, action) {
	switch(action.type) {
		case RECEIVE_AUTH_REPLY:
			if (action.payload.status == 200){
				let data = action.payload.data
				if (data.error){
					return {...state, reply: {error: data.error, message: data.message}}
				} else {
					return {...state, reply: {error: false, message: ""}, user: {auth: true, token: data.token}, components: {}}
				}

			} else {
				return {...state, reply: {error: true, message: "Server connection error. Try later."}}
			}

		case RECEIVE_LEADERS:
			try{
				return {...state, leaders: action.payload.data}
			} catch(error) {}
			return {...state, leaders: []}

		case COLOR_CHOOSED:
			let players_set = state.players
			players_set[action.payload.player].index = action.payload.color
			players_set[action.payload.player].color = color_title[action.payload.color]
			return {...state, players: players_set}

		case CALC_CAPTURED:
			let captured =  calcSquare(state.field, state.players[0].color, state.players[1].color);
			
			let resultCaptured = state.players
			resultCaptured[0].captured = captured[0]
			resultCaptured[1].captured = captured[1]
			
			return {...state, players: resultCaptured}

		case SHOW_LEADERS:
			return {...state, components: {showLeaders: true}}
	
		case HIDE_LEADERS:
			return {...state, components: {showLeaders: false}}
		
		case HIDE_RESULTS:
			return {...state, game_end: false};

		case SHOW_AUTH_FORM: 
			return {...state, components: {auth: true}, game_end: false};

		case HIDE_AUTH_FORM: 
			return {...state, components: {auth: false}};

		case FIELD_SIZE_CHANGED:
			let newSize = action.payload.size
			let newTmpField = getEmptyField(newSize)
			return {...state, field: newTmpField, field_size: newSize}

		case SEND_REGISTER_REQUEST: 
			return {...state};

		case SEND_LOGIN_REQUEST:
			if (action.payload.status == 200){
				return {...state, components: {auth: false}, user: {auth: true}};
			}
			return {...state}

		case SEND_LOGOUT_REQUEST: 
			return {...state, user: {auth: false, token: ""}, components: {}};

		case SHOW_SETTINGS:
// TEST CASE 1 
			let testState = getSurrounded()
			return {...testState}

			//return {...state, components: {showSettings: true}};

		case HIDE_SETTINGS:
			return {...state, components: {showSettings: false}};

		case START_NEW_GAME:
			let tmp_field = getEmptyField(state.field_size)
			
			return {...state, components: {showSettings: false, showField: true}, field: tmp_field};

		case STOP_GAME:
			let winner = ""
			let looser = ""
			let win_score = 0
			let loose_score = 0

			if(square[0] > square[1]) {
				winner = state.players[0].name
				looser = state.players[1].name
				win_score = square[0]
				loose_score = square[1]
			} else {
				winner = state.players[1].name
				looser = state.players[0].name
				win_score = square[1]
				loose_score = square[0]
			}

			let results = {winner: winner, looser: looser, win_score: win_score, loose_score: loose_score}
			send_results(results)
			return {...state, components: {showField: false}, results: results, game_end: true};

		case DRAW_DOT:
			let x = action.payload[1]
			let y = action.payload[0]
			let field = state.field
			
			let player_color = state.players[state.turn].color
			let enemy_color = state.players[((state.turn+1) % 2)].color

			if(field[x][y] == "E"){
				field[x][y] = player_color

				let field_s = main(field, player_color, enemy_color)
				return {...state, field:field_s, turn: (1+state.turn)%2}
			}
			return {...state}		

		case SET_COLOR:
			let players = state.players
			let this_player = action.payload.player - 1 
			let this_color = action.payload.color
			
			players[this_player].color = this_color
			return {...state, players: players}

		case CHECK_FIELD_FULL:
			let isFull = isFullField(state.field)
			if(isFull) {
				let new_state = updateState(state, {type: STOP_GAME})
				return {...new_state}
			}
			return {...state}

		case UPDATE_PLAYERS_NAME:
			let new_players = state.players
			new_players[action.payload.index].name = action.payload.name
			
			return {...state, players: new_players}

		default: 
			return {...state};
	}

	return {...state};
}

function send_results(results) {
	let token = getToken()
	axios({
  		method: 'post',
  		url: '/api/match/',
  		headers: {"X-CSRFToken": getToken(), 'Content-Type': 'application/json'},
  		data: results
  	}).then(function (response) {
  	});
}