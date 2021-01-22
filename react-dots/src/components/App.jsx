import { hot } from 'react-hot-loader/root';
import React from 'react';
import { connect } from 'react-redux';
import {
  BrowserRouter as Router, Switch, Route, Redirect,
} from 'react-router-dom';
import PropTypes from 'prop-types';

import Header from './Header';
import Leaderboard from './Leaderboard';
import Settings from './Settings';
import Results from './Results';
import GameField from './GameField';
import Footer from './Footer';
import MainPage from './MainPage';
import Login from './Login';
import Register from './Register';

function App(props) {
  const { authorized, gameStarted } = props;

  return (
    <section className="App">
      <Router>
        <Header />

        <Switch>
          <Route exact path="/">
            { authorized ? <Redirect to="/main" /> : ''}
          </Route>

          <Route path="/register">
            { authorized ? <Redirect to="/main" /> : '' }
            <Register />
          </Route>

          <Route path="/login">
            { authorized ? <Redirect to="/main" /> : '' }
            <Login />
          </Route>

          <Route path="/main">
            <MainPage />
          </Route>

          <Route path="/new_game">
            { authorized ? <Settings /> : <Redirect to="/login" /> }
            { authorized && gameStarted ? <Redirect to="/game" /> : ''}
          </Route>

          <Route path="/leaderboards">
            { authorized ? <Leaderboard /> : <Redirect to="/login" /> }
          </Route>

          <Route path="/game">
            <GameField />
          </Route>

          <Route path="/game_result">
            { authorized ? <Results /> : <Redirect to="/login" /> }
          </Route>

          <Route path="/logout">
            <Redirect to="/login" />
          </Route>

        </Switch>
        <Footer />
      </Router>

    </section>
  );
}

App.propTypes = {
  authorized: PropTypes.bool.isRequired,
  gameStarted: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  authorized: state.user.auth,
  gameStarted: state.gameStarted,
});

export default hot(
  connect(
    mapStateToProps,
  )(App),
);
