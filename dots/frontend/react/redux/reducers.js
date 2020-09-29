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
	STOP_GAME
} from './types.js';

import { loadState } from './local_state.js';


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
			return {...state, components: {showField: false}};

		default: 
			return {...state};
	}

	return {...state};
}
