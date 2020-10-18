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

const getEmptyField = (size=10) => {
	let tmp_field = []
	let row = []
	for(let i=0; i<=size*size; i++) {
		if(i % size == 0 && i!=0) {
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
	let user = {auth: false, token: ""}
	let reply = {error: false, message: ""}
	let players = [{name: "anon", color: "green", index: -1}, {name: "anon", color: "red", index: -1}]
	let leaders = []
	let field_size = 10
	
	return {
		field: getEmptyField(field_size), 
		user: user,
		players: players,
		components: components,
		results: results,
		game_end: false,
		turn: 0,
		field_size: field_size,
		reply: reply,
		leaders: leaders
	}
}

export { loadState, getEmptyField };