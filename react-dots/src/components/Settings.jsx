/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Form, Button, Container, Col, Row,
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

  render() {
    const {
      rooms, colors, colorTable, fieldSize, playerColor,
    } = this.props;

    return (
      <section className="field">
        <h2 className="">Create the room</h2>
        <div className="alert alert-primary col-5 block-margin" role="alert">Choose a color. Colors can&apos;t be the same</div>

        <form>
          <div className="row justify-content-center width-90">
            {colors.map((color, index) => (
              <div className="col-2" key={index.toString()}>
                <input
                  className="block-margin"
                  type="radio"
                  key={index.toString()}
                  id={index}
                  checked={playerColor === color[0].toUpperCase()}
                  onChange={this.onColorChanged.bind(this)}
                  name="color1"
                />
                <div className={color}> </div>
              </div>
            ))}
          </div>

          <div className="row justify-content-center width-90">
            <div className="form-group col-8" key="username">
              <input
                className="form-control space-around"
                type="number"
                key="field_size"
                name="size"
                placeholder="Field size"
                value={fieldSize}
                onChange={(number) => this.newFieldSize(number)}
              />
            </div>
          </div>

          <div className="align-center">
            <button type="button" className="btn btn-success" onClick={this.onCreateNewRoom.bind(this)}>New room</button>
          </div>

        </form>

        <hr />
        <hr />

        <h2 className="">Join the room</h2>
        <p>Pick up a color</p>
        <div className="row justify-content-center width-90">
          {colors.map((color, index) => (
            <div className="col-2" key={index.toString()}>
              <input
                className="block-margin"
                type="radio"
                key={index.toString()}
                id={index}
                checked={playerColor === color[0].toUpperCase()}
                onChange={this.onColorChanged.bind(this)}
                name="color1"
              />
              <div className={color}> </div>
            </div>
          ))}
        </div>
        <hr />
        <div className="container">
          <div className="join-room room_grid">
            {
                rooms.map((element, index) => (
                  <div key={`${index.toString()}`} className="">
                    <p>
                      Player:
                      {element.user.username}
                    </p>
                    <p>
                      Field:
                      {element.game_room.size}
                      *
                      {element.game_room.size}
                    </p>
                    <p>Color:</p>
                    <div className={colorTable[element.color]}> </div>
                    <button
                      type="button"
                      id={element.game_room.id}
                      className="btn btn-primary"
                      onClick={this.onPlayerJoinGame.bind(this)}
                    >
                      Join
                    </button>
                  </div>
                ))
            }
          </div>
        </div>
        <hr />

        <Container>
          <Row>
            { rooms.map((room, index) => (
              <div className="col-sm-4 mt-4" key={index.toString()}>
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{room.user.username}</h5>
                    <div className="d-flex">
                      <p className="card-text">Color: </p>
                      <div style={{ backgroundColor: room.color }} className="games-color-block m-auto" />
                      <Form>
                        <Form.Group as={Col} controlId="color">
                          <Form.Control
                            type="color"
                            className="games-color-block m-auto"
                          />
                        </Form.Group>
                      </Form>
                    </div>
                    <p className="card-text">{`Field size: ${room.game_room.size} x ${room.game_room.size}`}</p>
                    <button
                      type="button"
                      id={room.game_room.id}
                      className="btn btn-primary"
                      onClick={this.onPlayerJoinGame.bind(this)}
                    >
                      Join
                    </button>
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
  colors: PropTypes.array.isRequired,
  colorTable: PropTypes.object.isRequired,
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
    colors: state.colors,
    colorTable: state.colorTable,
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
