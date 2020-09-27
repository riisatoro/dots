import { LOCAL_STORAGE } from './types.js';


const saveState = (state) => {
    localStorage.setItem('LOCAL_STORAGE', JSON.stringify(user));
};

const loadState = () => {
	let state = JSON.parse(localStorage.getItem('LOCAL_STORAGE'));
	if(state)
		return state
    
    return set_initial();
    
}


const set_initial = () => {
	let user = {username: "", password: "", isAuth: false}
	let players = [{name: "", color: "",}, {name: "", color: ""}]
	let field = []
	let row = []
	
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
		turn: 0
	}
}

export  { saveState, loadState }