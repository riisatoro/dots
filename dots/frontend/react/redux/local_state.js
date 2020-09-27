import { LOCAL_STORAGE } from './types.js';

const saveState = (state) => {
    try {

        const serialisedState = JSON.stringify(state);

        window.localStorage.setItem(LOCAL_STORAGE, serialisedState);
    } catch (err) {

    }
};

const loadState = () => {
    try {
        const serialisedState = window.localStorage.getItem(LOCAL_STORAGE);
        
        if (!serialisedState) return set_initial();
        
        return JSON.parse(serialisedState);
    } catch (err) {
        return set_initial();
    }
};


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


export default { saveState, loadState }