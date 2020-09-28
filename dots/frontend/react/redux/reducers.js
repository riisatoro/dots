import { ADD_TRACK, SEND_REGISTER_REQUEST, DRAW_DOT, SHOW_AUTH_FORM, HIDE_AUTH_FORM, SEND_LOGIN_REQUEST } from './types.js';
import { loadState } from './local_state.js';

import axios from 'axios';


let initialState = loadState();

export function updateState(state = initialState, action) {
	switch(action.type) {
		case SHOW_AUTH_FORM: return {...state, components: {showAuth: true}};
		case HIDE_AUTH_FORM: return {...state, components: {showAuth: false}};

		case SEND_REGISTER_REQUEST: console.log(action.payload); return {...state}
		case SEND_LOGIN_REQUEST: 
			const token = Buffer.from(`${action.payload.username}:${action.payload.password}`, 'utf8').toString('base64')
			axios.post(
				'/api/auth/login/', 
				headers: {"Authorization": `Basic ${token}`}
			);
			return {...state} /* {username, password} */

		default: return {...state}
	}

	return {...state};
}
