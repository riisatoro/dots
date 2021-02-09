import { hot } from 'react-hot-loader/root';
import React from 'react';
import { connect } from 'react-redux';
import {
  BrowserRouter as Router, Switch, Route, Redirect,
} from 'react-router-dom';
import PropTypes from 'prop-types';

import Header from './Header';
import Leaderboard from './Leaderboard';
import Game from './Game';
import MainPage from './MainPage';
import Login from './Login';
import Register from './Register';
import Footer from './Footer';
import { connectSocket } from '../socket/socket';


function App(props) {
  const { authorized, dispatch, user } = props;
  if (authorized) {
    connectSocket(dispatch, user);
  }

  return (
    <>
      <section style={{ minHeight: '100%' }}>
        <Header />
        <Router>
          <Switch>
            <Route exact path="/">
              <Redirect to="/main" />
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

            <Route path="/game">
              { authorized ? <Game /> : <Redirect to="/login" /> }
            </Route>

            <Route path="/leaderboards">
              { authorized ? <Leaderboard /> : <Redirect to="/login" /> }
            </Route>

            <Route path="/logout">
              <Redirect to="/login" />
            </Route>

          </Switch>
        </Router>
      </section>
      <Footer />
    </>
  );
}

App.propTypes = {
  authorized: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  user: PropTypes.number,
};

App.defaultProps = {
  user: null,
}

const mapStateToProps = (state) => ({
  authorized: state.auth.isAuthorized,
  user: state.auth.id,
});

export default hot(
  connect(
    mapStateToProps,
  )(App),
);
