import { LOCAL_STORAGE } from './types.js';


const loadState = () => {
	let state = localStorage['reduxDots'];
	try{
		state = JSON.parse(state)
	} catch(error) {
		return set_initial();
	}
	return state
}

const getEmptyField = () => {
	let tmp_field = []
	let row = []
	for(let i=0; i<=25; i++) {
		if(i % 5 == 0 && i!=0) {
			tmp_field.push(row);
		row = [];
		}
		row.push("empty");
	}
	return tmp_field
}


const set_initial = () => {
	let results = {winner: "", looser: "", win_score: 0, loose_score: 0, user: 1}
	let components = {showAuth: false, showSettings: false, showField: false}
	let user = {username: "", password: "", isAuth: false}
	let players = [{name: "", color: "red",}, {name: "", color: "green"}]
	
	return {
		field: getEmptyField(), 
		user: user,
		players: players,
		components: components,
		results: results,
		game_end: false,
		turn: 0
	}
}

export { loadState, getEmptyField };