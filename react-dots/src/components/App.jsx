import { hot } from 'react-hot-loader/root';
import React from 'react';
import { connect } from 'react-redux';
import {
  BrowserRouter as Router, Switch, Route, Redirect,
} from 'react-router-dom';
import PropTypes from 'prop-types';

import {
  Container, Row, Button, Col,
} from 'react-bootstrap';
import Header from './Header';
import Leaderboard from './Leaderboard';
import Settings from './Settings';
import Auth from './Auth';
import Results from './Results';
import GameField from './GameField';
import Footer from './Footer';
import '../../public/css/default.css';

function App(props) {
  const { authorized, gameStarted } = props;
  const wikiLink = 'https://en.wikipedia.org/wiki/Dots_(game)';

  const mainPage = (
    <Container>
      <h2 className="text-center">Welcome to the dots game!</h2>
      <Row className="">
        <ul className="list-group d-flex m-auto mt-50">
          <li className="list-group-item text-center font-weight-bold">Rules are simple</li>
          <li className="list-group-item">Place the dots on the game field</li>
          <li className="list-group-item">Capture enemy points by creating a &quot;loop&quot; from your points</li>
          <li className="list-group-item">Try to catch as much points as you can</li>
          <li className="list-group-item">Have fun</li>
          <li className="list-group-item">
            Additional info can be found on the&nbsp;
            <a href={wikiLink} target="_blank" rel="noopener noreferrer">wiki</a>
              &nbsp;page.
          </li>
        </ul>
      </Row>

      <p className="p-20" />
      <div className="text-center">
        <Button variant="success" className="w-50">Lets play a game</Button>
      </div>
    </Container>
  );

  return (
    <section className="App">
      <Router>
        <Header />
        { !authorized ? <Redirect to="/auth" /> : ''}
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
            <GameField />
          </Route>

          <Route path="/game_result">
            { authorized ? <Results /> : <Redirect to="/" /> }
          </Route>

          <Route path="/logout">
            <Redirect to="/auth" />
          </Route>

        </Switch>

        { authorized ? mainPage : ''}

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
