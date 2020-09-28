import { ADD_TRACK, SEND_REGISTER_REQUEST, DRAW_DOT, SHOW_AUTH_FORM, HIDE_AUTH_FORM, SEND_LOGIN_REQUEST } from './types.js';
import { loadState } from './local_state.js';


let initialState = loadState();

export function updateState(state = initialState, action) {
	switch(action.type) {
		case SHOW_AUTH_FORM: return {...state, components: {showAuth: true}};
		case HIDE_AUTH_FORM: return {...state, components: {showAuth: false}};

		case SEND_REGISTER_REQUEST: console.log(action.payload); return {...state}
		case SEND_LOGIN_REQUEST:
			if (action.payload.status == 200){
				console.log({...state, components: {showAuth: false}, user: {isAuth: true}})
				return {...state, components: {showAuth: false}, user: {isAuth: true}};
			}
			console.log(action.status)
			return {...state}

		default: return {...state}
	}

	return {...state};
}
