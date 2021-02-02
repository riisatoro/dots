import React from 'react';
import { connect } from 'react-redux';
import {
  Container, Nav, Button, Spinner,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import axios from 'axios';
import TYPES from '../redux/types';

import '../../public/css/default.css';

function GameTabs(props) {
  const {
    activeGameTab,
    waitingGames,
    currentGames,
    token,
    user,

    playerLeave,
    setActiveTab,
  } = props;

  const games = { ...waitingGames, ...currentGames };

  const playerLeaveRoom = (e) => {
    playerLeave(token, e.target.id);
  };

  const setActive = (e) => {
    setActiveTab(parseInt(e.target.id, 10));
  };

  return (
    <Container>
      <Nav variant="tabs">
        { Object.keys(games).map((key) => (
          <Nav.Item onClick={setActive} key={key.toString()}>
            <Nav.Link active={parseInt(key, 10) === activeGameTab} id={key}>
              {games[key].field.turn === user && <Spinner animation="grow" className="mx-2" style={{ width: '20px', height: '20px' }} variant="danger" />}
              {Object.keys(games[key].field.players).length < 1 && <Spinner animation="border" className="mx-2" style={{ width: '20px', height: '20px' }} variant="danger" />}
              Game&nbsp;
              {`${games[key].size} x ${games[key].size}`}
              <Button variant="danger" className="ml-3" id={key} onClick={playerLeaveRoom}>x</Button>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </Container>
  );
}

GameTabs.propTypes = {
  user: PropTypes.number.isRequired,
  activeGameTab: PropTypes.number,
  token: PropTypes.string.isRequired,
  playerLeave: PropTypes.func.isRequired,
  setActiveTab: PropTypes.func.isRequired,

  waitingGames: PropTypes.objectOf(PropTypes.object),
  currentGames: PropTypes.objectOf(PropTypes.object),
};

GameTabs.defaultProps = {
  waitingGames: {},
  currentGames: {},
  activeGameTab: 0,
};

const mapStateToProps = (state) => ({
  user: state.auth.id,
  activeGameTab: state.uiData.activeGameTab,
  waitingGames: state.gameData.waitingGames,
  currentGames: state.gameData.currentGames,
  token: state.auth.token,
});

export default connect(
  mapStateToProps,
  (dispatch) => ({
    playerLeave: (token, room) => {
      const request = () => {
        axios({
          method: 'post',
          headers: { Authorization: `Token ${token}` },
          data: {
            room,
          },
          url: '/api/v2/leave/',
        }).then((response) => {
          dispatch({ type: TYPES.UPDATE_ROOMS, payload: response.data });
        });
      };
      request();
    },

    setActiveTab: (tab) => {
      dispatch({ type: TYPES.SET_ACTIVE_GAME_TAB, payload: tab });
    },
  }),
)(GameTabs);
