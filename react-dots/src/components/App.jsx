import { hot } from 'react-hot-loader/root';
import React from 'react';
import { connect } from 'react-redux';
import {
  BrowserRouter as Router, Switch, Route, Redirect,
} from 'react-router-dom';
import PropTypes from 'prop-types';

import Header from './Header';
import Leaderboard from './Leaderboard';
import GameContainer from './GameContainer';
import GameField from './GameField';
import MainPage from './MainPage';
import Login from './Login';
import Register from './Register';
import Footer from './Footer';

function App(props) {
  const { authorized } = props;

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
              { authorized ? <GameContainer /> : <Redirect to="/login" /> }
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
};

const mapStateToProps = (state) => ({
  authorized: state.auth.isAuthorized,
});

export default hot(
  connect(
    mapStateToProps,
  )(App),
);
