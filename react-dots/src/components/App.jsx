import { hot } from 'react-hot-loader/root';
import React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';

import Header from './Header';
import Leaderboard from './Leaderboard';
import Settings from './Settings';
import Auth from './Auth';
import Results from './Results';
import GameField from './GameField';
import '../../public/css/default.css';
import { TYPES } from '../redux/types';

function App(props) {
  const { authorized, gameStarted } = props;

  return (
    <section className="App">
      <Header />

      <Router>
        <Switch>

          <Route path="/auth">
            { authorized ? <Redirect to="/" /> : <Auth /> }
          </Route>

          <Route path="/new_game">
            { authorized ? <Settings /> : <Redirect to="/" /> }
            { authorized && gameStarted ? <Redirect to="/game" /> : ''}
          </Route>

          <Route path="/leaderboards">
            { authorized ? <Leaderboard /> : <Redirect to="/" /> }
          </Route>

          <Route path="/game">
            { authorized && gameStarted ? <GameField /> : <Redirect to="/" /> }
          </Route>

          <Route path="/game_result">
            { authorized ? <Results /> : <Redirect to="/" /> }
          </Route>

          <Route path="/logout">
            <Redirect to="/auth" />
          </Route>

        </Switch>
      </Router>
    </section>
  );
}

App.propTypes = {
  authorized: PropTypes.bool.isRequired,
  gameStarted: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => {
  const data = {
    authorized: state.user.auth,
    gameStarted: state.gameStarted,
  };
  return data;
};

export default hot(
  connect(
    mapStateToProps,
    null,
  )(App),
);
