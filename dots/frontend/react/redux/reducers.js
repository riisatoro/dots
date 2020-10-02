import { 
	ADD_TRACK, 
	SEND_REGISTER_REQUEST, 
	DRAW_DOT, SHOW_AUTH_FORM, 
	HIDE_AUTH_FORM, 
	SEND_LOGIN_REQUEST, 
	SEND_LOGOUT_REQUEST,
	SHOW_SETTINGS,
	HIDE_SETTINGS,
	START_GAME,
	STOP_GAME,
	PLAYER_CHANGED,
	SET_COLOR,
	CHECK_FIELD_FULL, 
	UPDATE_PLAYERS_NAME,
	HIDE_RESULTS,
	SET_LEADERS,
	SHOW_LEADERS,
	HIDE_LEADERS
} from './types.js';

import { loadState, getEmptyField } from './local_state.js';
import { isFullField } from '../actions/isFullField.js';
import { calcSquare } from '../actions/calcDotsSquare.js';
import getToken from '../actions/token.js';
import axios from 'axios';
import main from '../actions/calcSquare.js';




let initialState = loadState();

export function updateState(state = initialState, action) {
	switch(action.type) {
		case SHOW_LEADERS:
			return {...state, components: {showLeaders: true}}
	
		case HIDE_LEADERS:
			return {...state, components: {showLeaders: false}}

		case SET_LEADERS:
			return {...state, leaders: action.payload}
		
		case HIDE_RESULTS:
			return {...state, game_end: false};

		case SHOW_AUTH_FORM: 
			return {...state, components: {showAuth: true}, game_end: false};

		case HIDE_AUTH_FORM: 
			return {...state, components: {showAuth: false}};

		case SEND_REGISTER_REQUEST: 
			return {...state};

		case SEND_LOGIN_REQUEST:
			if (action.payload.status == 200){
				return {...state, components: {showAuth: false}, user: {isAuth: true}};
			}
			return {...state}

		case SEND_LOGOUT_REQUEST: 
			let comp = {showAuth: false, showSettings: false, showField: false}
			return {...state, user: {isAuth: false}, components: comp};

		case SHOW_SETTINGS:
			return {...state, components: {showSettings: true}};

		case HIDE_SETTINGS:
			return {...state, components: {showSettings: false}};

		case START_GAME:
			let tmp_field = getEmptyField()
			return {...state, components: {showField: true}, field: tmp_field, game_end: false};

		case STOP_GAME:
			let square = calcSquare(state.field, state.players[0].color, state.players[1].color);
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

			if(field[x][y] == "empty"){
				field[x][y] = player_color

				let field_s = main(field, player_color)
				return {...state, field:field_s}
			}
			return {...state}

		case PLAYER_CHANGED:
			return {...state, turn: (1+state.turn)%2}			

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