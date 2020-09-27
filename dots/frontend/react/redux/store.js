import React, { Component } from 'react';

import { createStore } from 'redux';
import { updateState } from "./reducers.js";

import { loadState, saveState } from './local_state.js';


//const oldState = loadState();

const store = createStore(updateState);
/*
store.dispatch(oldState);

store.subscribe(() => {
    saveState();
})
*/
export default store;
