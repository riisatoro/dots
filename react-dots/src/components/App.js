import { hot } from 'react-hot-loader/root';
import React from 'react';
import Header from './Header';
import ComponentContainer from './ComponentContainer';

function App() {
  return (
    <div className="App">
      <Header />
      <ComponentContainer />
    </div>
  );
}

export default hot(App);
