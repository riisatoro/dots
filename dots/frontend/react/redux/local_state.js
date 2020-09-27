import { LOCAL_STORAGE } from './types.js';


const saveState = (state) => {
    localStorage.setItem('LOCAL_STORAGE', JSON.stringify(state));
};


const loadState = () => {
	let state = JSON.parse(localStorage.getItem('LOCAL_STORAGE'));
	/*if(state)
		return state;*/
    
    return set_initial();
    
}


const set_initial = () => {

	let row = []
	let field = []
	let components = {showAuth: false}
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

export  { saveState, loadState }