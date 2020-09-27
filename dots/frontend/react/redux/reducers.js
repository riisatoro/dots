import { ADD_TRACK, DRAW_DOT } from './types.js';


export function updateState(state, action) {
	/*if(action.type === DRAW_DOT) {
		let x = action.payload.x_axe;
		let y = action.payload.y_axe;
		let new_field = state.field;

		new_field[x][y] = "fill_green";

		return Object.assign({}, state, {field: new_field})
	}*/
	return {...state};
}
