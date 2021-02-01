import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Form, Button, Container, Row, Modal, Col,
} from 'react-bootstrap';
import axios from 'axios';
import PropTypes from 'prop-types';
import TYPES from '../redux/types';
import '../../public/css/default.css';

function GameRoomsToJoin(props) {
  const { availableGames, playerColor, token, onJoinGameRoom } = props;
  const cards = [];

  const changePickedColor = (e) => {
    props.setPlayerColor(e.target.value);
  };

  const joinGame = (e) => {
    onJoinGameRoom(token, e.target.id, playerColor);
  };

  Object.keys(availableGames).forEach((key) => {
    cards.push(
      <Col xs={12} md={6} lg={4} key={key.toString()}>
        <div className="card m-2 p-2">
          <h5 className="card-title">
            Player:&nbsp;
            {availableGames[key].user.username}
          </h5>

          <div className="card-body">
            <Row>
              <p className="col-6">Color:</p>
              <div className="games-color-block col-6" style={{ backgroundColor: availableGames[key].color }} />
            </Row>
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
            <Button onClick={joinGame} id={availableGames[key].game_room.id}>Join</Button>
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

  availableGames: PropTypes.arrayOf(PropTypes.object),

  setPlayerColor: PropTypes.func.isRequired,
  onJoinGameRoom: PropTypes.func.isRequired,
};

GameRoomsToJoin.defaultProps = {
  availableGames: [],
};

const mapStateToProps = (state) => ({
  availableGames: state.domainData.availableGames,
  playerColor: state.gameData.temporary.playerColor,
  token: state.auth.token,
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
          dispatch({ type: TYPES.UPDATE_ROOMS, payload: response });
        });
      };
      joinGameRoom();
    },

  }),
)(GameRoomsToJoin);
