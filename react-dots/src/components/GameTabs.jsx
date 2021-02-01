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
    gameRooms,
    token,

    playerLeave,
    setActiveTab,
  } = props;

  const playerLeaveRoom = (e) => {
    playerLeave(token, e.target.id);
  };

  const setActive = (e) => {
    setActiveTab(parseInt(e.target.id, 10));
  };

  return (
    <Container>
      <Nav variant="tabs">
        { Object.keys(gameRooms).map((key) => (
          <Nav.Item onClick={setActive} key={key.toString()}>
            <Nav.Link active={parseInt(key, 10) === activeGameTab} id={key}>
              <Spinner animation="border" className="mx-2" style={{ width: '20px', height: '20px' }} variant="danger"/>
              Game&nbsp;
              {`${gameRooms[key].size} x ${gameRooms[key].size}`}
              <Button variant="danger" className="ml-3" id={key} onClick={playerLeaveRoom}>x</Button>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </Container>
  );
}

GameTabs.propTypes = {
  activeGameTab: PropTypes.number,
  token: PropTypes.string.isRequired,
  gameRooms: PropTypes.objectOf(PropTypes.object),
  playerLeave: PropTypes.func.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

GameTabs.defaultProps = {
  gameRooms: {},
  activeGameTab: 0,
};

const mapStateToProps = (state) => ({
  activeGameTab: state.uiData.activeGameTab,
  gameRooms: state.gameData.userGames,
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
          dispatch({ type: TYPES.UPDATE_PLAYER_ROOMS, payload: response.data });
        }).catch(() => {
          dispatch({ type: TYPES.UPDATE_PLAYER_ROOMS_ERROR, payload: null });
        });
      };
      request();
    },

    setActiveTab: (tab) => {
      dispatch({ type: TYPES.SET_ACTIVE_GAME_TAB, payload: tab });
    },
  }),
)(GameTabs);
