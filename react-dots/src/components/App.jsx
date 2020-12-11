import { hot } from 'react-hot-loader/root';
import React from 'react';
import Header from './Header';
import ComponentContainer from './ComponentContainer';

function App() {
  return (
    <section className="App">
      <Header />
      <ComponentContainer />
    </section>
  );
}

export default hot(App);
