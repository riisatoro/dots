import { ADD_TRACK, DRAW_DOT, SHOW_AUTH_FORM, HIDE_AUTH_FORM } from './types.js';
import { loadState } from './local_state.js';


let initialState = loadState();

export function updateState(state = initialState, action) {
	switch(action.type) {
		case SHOW_AUTH_FORM: return {...state, components: {showAuth: true}};
		case HIDE_AUTH_FORM: return {...state, components: {showAuth: false}};

		default: return {...state}
	}

	return {...state};
}
