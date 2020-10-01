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
	SET_COLOR
} from './types.js';

import { loadState, getEmptyField } from './local_state.js';
import isFullField from '../actions/isFullField.js';
import main from '../actions/calcSquare.js';


let initialState = loadState();

export function updateState(state = initialState, action) {
	switch(action.type) {
		case SHOW_AUTH_FORM: 
			return {...state, components: {showAuth: true}};

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
			return {...state, user: {isAuth: false}};

		case SHOW_SETTINGS:
			return {...state, components: {showSettings: true}};

		case HIDE_SETTINGS:
			return {...state, components: {showSettings: false}};

		case START_GAME:
			let tmp_field = getEmptyField()
			return {...state, components: {showField: true}, field: tmp_field};

		case STOP_GAME:
			return {...state, components: {showField: false}};

		case DRAW_DOT:
			let x = action.payload[1]
			let y = action.payload[0]
			let field = state.field
			
			let player_color = state.players[state.turn].color

			if(field[x][y] == "empty"){
				field[x][y] = player_color

				let field_s = main(field, player_color)
				console.log("NEW FIEL", field_s)
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

		default: 
			return {...state};
	}

	return {...state};
}
