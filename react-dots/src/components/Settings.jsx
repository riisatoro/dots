/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Form, Button, Container, Row, Col,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import axios from 'axios';
import TYPES from '../redux/types';

import '../../public/css/default.css';

class Settings extends Component {
  componentDidMount() {
    const { getGameRooms, token } = this.props;
    getGameRooms(token);
  }

  onCreateNewRoom() {
    const {
      createNewRoom, token, playerColor, fieldSize,
    } = this.props;
    if (playerColor !== '') {
      createNewRoom(token, fieldSize, playerColor);
    }
  }

  onPlayerJoinGame(e) {
    const {
      onJoinGameRoom, token, playerColor, rooms,
    } = this.props;
    const roomID = e.target.id;
    if (playerColor !== '') {
      rooms.forEach((element) => {
        if (element.game_room.id.toString() === e.target.id) {
          if (element.color !== playerColor) {
            onJoinGameRoom(token, roomID, playerColor);
          }
        }
      });
    }
  }

  onColorChanged(e) {
    const { setPlayerColor } = this.props;
    setPlayerColor(e.target.id);
  }

  newFieldSize(e) {
    const { changeFieldSize } = this.props;
    const size = e.target.value;
    if (size > 5 && size < 15) {
      changeFieldSize(size);
    }
  }

  changePickedColor(e) {
    const { setPlayerColor } = this.props;
    setPlayerColor(e.target.value);
  }

  render() {
    const {
      rooms, playerColor,
    } = this.props;

    return (
      <section className="field">
        <Container className="mb-5">
          <h2 className="text-center">Create new game room</h2>
          <Form onSubmit={this.onCreateNewRoom}>
            <Form.Row className="mb-3">
              <Form.Group as={Col} sm={12} lg={6} controlId="color" className="m-auto">
                <Form.Label>Click to choose your color:</Form.Label>
                <Form.Control
                  type="color"
                  className="games-color-block"
                  value={playerColor}
                  onChange={this.changePickedColor.bind(this)}
                />
                <Form.Control.Feedback type="invalid">
                  Username must be 3 or more characters
                </Form.Control.Feedback>
              </Form.Group>
            </Form.Row>

            <Form.Row className="mb-3">
              <Form.Group as={Col} sm={12} lg={6} controlId="size" className="m-auto">
                <Form.Label>Choose the field size (6-15):</Form.Label>
                <Form.Control
                  type="number"
                />
                <Form.Control.Feedback type="invalid">
                  Password should be 5 or more characters and number
                </Form.Control.Feedback>
              </Form.Group>
            </Form.Row>
            <Form.Row className="mb-3">
              <Button as={Col} xs="auto" type="submit" className="btn-success m-auto">Create new game</Button>
            </Form.Row>
          </Form>
        </Container>

        <Container><hr /></Container>

        <Container>
          <h2>Join new room</h2>
          <Row>
            { rooms.map((room, index) => (
              <div className="col-sm-4 mb-5" key={index.toString()}>
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{room.user.username}</h5>
                    <div className="row">
                      <p className="card-text col-6">Player color:</p>
                      <div className="col-6">
                        <div style={{ backgroundColor: room.color }} className="games-color-block mb-2" />
                      </div>
                      <p className="card-text col-6">Click to choose your color:</p>
                      <div className="col-6">
                        <Form.Control
                          type="color"
                          className="games-color-block"
                          value={playerColor}
                          onChange={this.changePickedColor.bind(this)}
                        />
                      </div>
                    </div>
                    <p className="card-text">{`Field size: ${room.game_room.size} x ${room.game_room.size}`}</p>
                    <Button
                      type="button"
                      id={room.game_room.id}
                      className="btn btn-primary"
                      onClick={this.onPlayerJoinGame.bind(this)}
                    >
                      Join
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </Row>
        </Container>
      </section>
    );
  }
}

Settings.propTypes = {
  fieldSize: PropTypes.number,
  playerColor: PropTypes.string.isRequired,
  createNewRoom: PropTypes.func.isRequired,
  setPlayerColor: PropTypes.func.isRequired,
  changeFieldSize: PropTypes.func.isRequired,
  getGameRooms: PropTypes.func.isRequired,
  token: PropTypes.string.isRequired,
  rooms: PropTypes.array,
  onJoinGameRoom: PropTypes.func.isRequired,
};

Settings.defaultProps = {
  fieldSize: 10,
  rooms: [],
};

const mapStateToProps = (state) => {
  const data = {
    fieldSize: state.field_size,
    playerColor: state.playerColor,
    token: state.user.token,
    username: state.user.username,
    players: state.players,
    rooms: state.rooms,
    gameInterrupted: state.gameInterrupted,
  };
  return data;
};

export default connect(
  mapStateToProps,
  (dispatch) => ({
    setPlayerColor: (color) => {
      dispatch({ type: TYPES.COLOR_CHOOSED, payload: { color } });
    },

    changeFieldSize: (size) => {
      dispatch({ type: TYPES.FIELD_SIZE_CHANGED, payload: { size } });
    },

    getGameRooms: (token) => {
      const gameRoomRequest = () => {
        axios({
          method: 'get',
          headers: { Authorization: `Token ${token}` },
          url: '/api/v2/rooms/',
        }).then((response) => { dispatch({ type: TYPES.UPDATE_GAME_ROOMS, payload: response }); });
      };
      gameRoomRequest();
    },

    createNewRoom: (token, fieldSize, gameColor) => {
      const data = { color: gameColor, size: fieldSize };
      const newRoomRequest = () => {
        axios({
          method: 'post',
          headers: { Authorization: `Token ${token}` },
          url: '/api/v2/rooms/',
          data,
        }).then((response) => {
          dispatch({ type: TYPES.NEW_ROOM_CREATED, payload: response });
        });
      };
      newRoomRequest();
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
          dispatch({ type: TYPES.PLAYER_JOIN_ROOM, payload: response });
        });
      };
      joinGameRoom();
    },
  }),
)(Settings);
