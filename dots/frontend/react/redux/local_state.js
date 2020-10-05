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

const getEmptyField = (size=6) => {
	let tmp_field = []
	let row = []
	for(let i=0; i<=36; i++) {
		if(i % 6 == 0 && i!=0) {
			tmp_field.push(row);
		row = [];
		}
		row.push("empty");
	}
	return tmp_field
}


const set_initial = () => {
	let results = {winner: "", looser: "", win_score: 0, loose_score: 0}
	let components = {auth: false, showSettings: false, showField: false}
	let user = {username: "", password: "", isAuth: false}
	let players = [{name: "anon", color: "green",}, {name: "anon", color: "red"}]
	
	return {
		field: getEmptyField(), 
		user: user,
		players: players,
		components: components,
		results: results,
		game_end: false,
		turn: 0,
		field_size: 10
	}
}

export { loadState, getEmptyField };