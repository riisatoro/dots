import { createStore } from 'redux';

import { LOCAL_STORAGE } from './types.js';
import { updateState } from "./reducers.js";


const store = createStore(updateState);

store.subscribe(()=> {
	localStorage["reduxDots"] = JSON.stringify(store.getState());
})

export default store;
