import React, { Component } from 'react';
import { createStore } from 'redux';

import { ADD_TRACK } from './types.js';


const initialState = []
let row = []

for(let i=0; i<=100; i++) {
	if(i % 10 == 0 && i!=0) {
		initialState.push(
			<div className="input__block" key={i}>
				<input className="input__field" type="hidden" value="0"></input>
			</div>);
		row = [];
	}
	row.push(i);
}

function playlist(store = initialState, action) {
	if(action.type === ADD_TRACK){
		return [
		...store,
		action.payload
		]
	}
	return store;
}


const store = createStore(playlist);

store.subscribe(() => {

})

export default store;

// store.dispatch({type: ADD_TRACK, payload: "Extatum et Oratum"});
// store.dispatch({type: ADD_TRACK, payload: "Vampires don't die"});