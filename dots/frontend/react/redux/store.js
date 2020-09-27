import { createStore } from 'redux';

import { LOCAL_STORAGE } from './types.js';
import { updateState } from "./reducers.js";
import { saveState } from './local_state.js';


const store = createStore(updateState);

store.subscribe(()=> {

})

export default store;
