import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Form, Button, Row, Col,
} from 'react-bootstrap';
import axios from 'axios';
import PropTypes from 'prop-types';
import TYPES from '../redux/types';
import { socket } from '../socket/socket';
import '../../public/css/default.css';
import isContrast from '../actions/findContrast';

function GameRoomsToJoin(props) {
  const {
    availableGames, playerColor, token, onJoinGameRoom,
  } = props;
  const cards = [];

  const changePickedColor = (e) => {
    props.setPlayerColor(e.target.value);
  };

  const joinGame = (e) => {
    let colorIsContrast = true;
    const colors = availableGames[e.target.id].players;

    Object.keys(colors).forEach((key) => {
      colorIsContrast = colorIsContrast && isContrast(playerColor, colors[key].color, 2);
    });

    if (colorIsContrast) {
      onJoinGameRoom(token, e.target.id, playerColor);
      socket.send(JSON.stringify(
        {
          type: TYPES.PLAYER_JOIN_GAME,
          currentGame: e.target.id,
        },
      ));
    } else {
      props.openModal();
    }
  };

  Object.keys(availableGames).forEach((key) => {
    cards.push(
      <Col xs={12} md={6} lg={4} key={key.toString()}>
        <div className="card m-2 p-2">
          {
            Object.keys(availableGames[key].players).map((player) => (
              <h5 className="card-title" key={player.toString()}>
                Player:&nbsp;
                {availableGames[key].players[player].username}
                <div className="games-color-block col-6" style={{ backgroundColor: availableGames[key].players[player].color }} />
              </h5>
            ))
          }

          <div className="card-body">
            <Row>
              <p className="card-text col-6">Change color:</p>
              <div className="col-6">
                <Form.Control
                  type="color"
                  className="games-color-block"
                  value={playerColor}
                  onChange={changePickedColor}
                />
              </div>
            </Row>
            <Button onClick={joinGame} id={key}>Join</Button>
          </div>
        </div>

      </Col>,
    );
  });

  return (
    <>
      <hr />
      <h3 className="text-center mb-3">Join already created games</h3>
      <Row>
        { cards.map((item) => item) }
      </Row>
    </>
  );
}

GameRoomsToJoin.propTypes = {
  token: PropTypes.string.isRequired,
  playerColor: PropTypes.string.isRequired,

  availableGames: PropTypes.objectOf(PropTypes.object),

  openModal: PropTypes.func.isRequired,
  setPlayerColor: PropTypes.func.isRequired,
  onJoinGameRoom: PropTypes.func.isRequired,
};

GameRoomsToJoin.defaultProps = {
  availableGames: [],
};

const mapStateToProps = (state) => ({
  token: state.auth.token,
  availableGames: state.gameData.availableGames,
  playerColor: state.gameData.temporary.playerColor,
});

export default connect(
  mapStateToProps,
  (dispatch) => ({
    setPlayerColor: (color) => {
      dispatch({ type: TYPES.UPDATE_TMP_COLOR, payload: { color } });
    },

    onJoinGameRoom: (token, roomId, playerColor) => {
      const joinGameRoom = () => {
        const data = { room_id: roomId, color: playerColor };
        axios({
          method: 'post',
          headers: { Authorization: `Token ${token}` },
          url: '/api/v2/join/',
          data,
        }).then((response) => {
          dispatch({ type: TYPES.UPDATE_ROOMS, payload: response.data });
        });
      };
      joinGameRoom();
    },
    openModal: () => {
      dispatch({ type: TYPES.OPEN_MODAL_COLOR });
    },
  }),
)(GameRoomsToJoin);
