import React, { Component } from 'react';

import { createStore } from 'redux';

import { LOCAL_STORAGE } from './types.js';
import { updateState } from "./reducers.js";
import { saveState, loadState } from './local_state.js';

let oldState = loadState();
const store = createStore(updateState, oldState);

export default store;
