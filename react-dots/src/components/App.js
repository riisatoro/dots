import { hot } from 'react-hot-loader/root';
import { Provider } from 'react-redux';
import React, { Component } from 'react';

import Header from './Header.js';
import ComponentContainer from './ComponentContainer.js';

function App() {
  return (
    <div className="App">
      	<Header />
      	<ComponentContainer />
    </div>
  );
}

export default hot(App);