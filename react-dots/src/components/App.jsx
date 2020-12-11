import { hot } from 'react-hot-loader/root';
import React from 'react';
import Header from './Header.jsx';
import ComponentContainer from './ComponentContainer.jsx';

function App() {
  return (
    <div className="App">
      <Header />
      <ComponentContainer />
    </div>
  );
}

export default hot(App);
