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


const set_initial = () => {

	let row = []
	let field = []
	let components = {showAuth: false, showSettings: false, showField: false}
	let user = {username: "", password: "", isAuth: false}
	let players = [{name: "", color: "",}, {name: "", color: ""}]
	
	for(let i=0; i<=100; i++) {
		if(i % 10 == 0 && i!=0) {
			field.push(row);
		row = [];
		}
		row.push("empty");
	}
	return {
		field: field, 
		user: user,
		players: players,
		components: components,
		turn: 0
	}
}

export { loadState };