import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Form, Button, Container, Row, Modal, Col,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import axios from 'axios';
import TYPES from '../redux/types';
import NewGameForm from './NewGameForm';
import isContrast from '../actions/findContrast';
import connectSocket from '../socket/gameListSocket';

import '../../public/css/default.css';

class Settings extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    this.onPlayerJoinGame = this.onPlayerJoinGame.bind(this);
    this.changePickedColor = this.changePickedColor.bind(this);
    this.playerLeaveRoom = this.playerLeaveRoom.bind(this);
  }

  componentDidMount() {
    const { getGameRooms, token, updateGameRooms } = this.props;
    getGameRooms(token);
    this.socket = connectSocket();
    this.socket.onmessage = (msg) => { updateGameRooms(JSON.parse(msg.data)); };
    this.socket.onerror = () => { };
    this.socket.onclose = () => { };
  }

  componentWillUnmount() {
    this.socket.close();
  }

  onPlayerJoinGame(e) {
    const {
      onJoinGameRoom, token, playerColor, rooms, setModal,
    } = this.props;
    const index = e.target.id;
    const contrast = (
      isContrast(playerColor, rooms[index].color, 1.8));
    setModal(contrast);
    if (contrast) {
      onJoinGameRoom(token, rooms[index].game_room.id, playerColor);
    }
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

  closeModal() {
    const { setModal } = this.props;
    setModal(true);
  }

  playerLeaveRoom(e) {
    const { token, playerLeaveRoom } = this.props;
    playerLeaveRoom(token, e.target.id);
  }

  render() {
    const {
      rooms, modal, playerColor, playerRooms, user,
    } = this.props;

    const modalWindow = (
      <>
        <Modal show={modal}>
          <Modal.Header closeButton>
            <Modal.Title>Colors are too common!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            This color is too simmilar to the choosen one, or to blar or white colors!
            Please, choose another, more contrast color.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeModal}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );

    return (
      <section className="field">

        {modalWindow}

        <Container className="mb-5">
          <h2 className="text-center">Create new game room</h2>
          <NewGameForm />
        </Container>

        <Container className="mt-5">
          <Row>
            {
            Object.keys(playerRooms).map((key) => (
              <Col key={key.toString()} md={4} xs={12}>
                <p>Players:</p>
                {
                  Object.keys(playerRooms[key].players).map((userId) => (
                    <div style={{ backgroundColor: playerRooms[key].players[userId].color }} className="games-color-block mb-2" />
                  ))
                }
                <Row>
                  <Button variant="secondary" className="m-auto">Open</Button>
                  <Button variant="danger" className="m-auto" id={key} onClick={this.playerLeaveRoom}>Leave room</Button>
                </Row>
              </Col>
            ))
          }
          </Row>
        </Container>

        <Container><hr /></Container>
        <Container>
          <h2>Join new room</h2>
          {rooms.length === 0 && <p>There is no free rooms. Try to create one!</p>}
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
                          onChange={this.changePickedColor}
                        />
                      </div>
                    </div>
                    <p className="card-text">{`Field size: ${room.game_room.size} x ${room.game_room.size}`}</p>
                    <Button
                      type="button"
                      id={index}
                      className="btn btn-primary"
                      onClick={this.onPlayerJoinGame}
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
  user: PropTypes.number.isRequired,
  modal: PropTypes.bool,
  token: PropTypes.string.isRequired,
  playerColor: PropTypes.string.isRequired,
  rooms: PropTypes.arrayOf(PropTypes.object),
  roomLimit: PropTypes.number.isRequired,
  playerRooms: PropTypes.objectOf(PropTypes.object),
  setPlayerColor: PropTypes.func.isRequired,
  changeFieldSize: PropTypes.func.isRequired,
  getGameRooms: PropTypes.func.isRequired,
  onJoinGameRoom: PropTypes.func.isRequired,
  setModal: PropTypes.func.isRequired,
  updateGameRooms: PropTypes.func.isRequired,
  playerLeaveRoom: PropTypes.func.isRequired,
};

Settings.defaultProps = {
  rooms: [],
  modal: false,
};

const mapStateToProps = (state) => ({
  user: state.auth.id,
  modal: false,
  token: state.auth.token,
  playerColor: state.gameData.temporary.playerColor,
  rooms: state.domainData.availableGames,
  roomLimit: state.appData.roomLimit,
  playerRooms: state.gameData.userGames,
});

export default connect(
  mapStateToProps,
  (dispatch) => ({
    playerLeaveRoom: (token, room) => {
      const playerLeave = () => {
        axios({
          method: 'post',
          headers: { Authorization: `Token ${token}` },
          data: {
            "room": room
          },
          url: '/api/v2/leave/',
        }).then((response) => {
          dispatch({ type: TYPES.UPDATE_PLAYER_ROOMS, payload: response.data });
        }).catch((error) => {
          console.log(error);
          // dispatch({ type: TYPES.UPDATE_PLAYER_ROOMS_ERROR, payload: null });
        });
      };
      playerLeave();
    },

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
        }).then((response) => {
          // dispatch({ type: TYPES.UPDATE_GAME_ROOMS, payload: { rooms: response.data.free_room } });
        });
      };
      gameRoomRequest();
    },

    updateGameRooms: (data) => {
      // dispatch({ type: TYPES.UPDATE_GAME_ROOMS, payload: { rooms: data.message } });
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

    setModal: (value) => {
      // dispatch({ type: TYPES.SET_MODAL, payload: value });
    },
  }),
)(Settings);
