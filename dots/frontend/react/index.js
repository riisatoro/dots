import App from './components/App.js';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';

import store from './redux/store.js'


ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>, 
	document.getElementById('react-app')
);