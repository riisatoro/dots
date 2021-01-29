import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Form, Button, Container, Row, Modal, Col,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import axios from 'axios';
import TYPES from '../redux/types';
import isContrast from '../actions/findContrast';
import connectSocket from '../socket/gameListSocket';

import NewGameForm from './NewGameForm';
import Game from './Game';
import RoomsToJoin from './RoomsToJoin';

import '../../public/css/default.css';

class GameContainer extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    this.onPlayerJoinGame = this.onPlayerJoinGame.bind(this);
    this.changePickedColor = this.changePickedColor.bind(this);
  }

  componentDidMount() {
    const { getPlayerGameRooms, token } = this.props;
    getPlayerGameRooms(token);
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

  render() {
    const {
      modal,
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

        <Container>
          <Game />
        </Container>

        <Container>
          <RoomsToJoin />
        </Container>

      </section>
    );
  }
}

GameContainer.propTypes = {
  user: PropTypes.number.isRequired,
  modal: PropTypes.bool,
  token: PropTypes.string.isRequired,
  playerColor: PropTypes.string.isRequired,
  rooms: PropTypes.arrayOf(PropTypes.object),
  roomLimit: PropTypes.number.isRequired,
  playerRooms: PropTypes.objectOf(PropTypes.object),
  setPlayerColor: PropTypes.func.isRequired,
  changeFieldSize: PropTypes.func.isRequired,
  getPlayerGameRooms: PropTypes.func.isRequired,
  onJoinGameRoom: PropTypes.func.isRequired,
  setModal: PropTypes.func.isRequired,
  updateGameRooms: PropTypes.func.isRequired,
};

GameContainer.defaultProps = {
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

    setPlayerColor: (color) => {
      dispatch({ type: TYPES.COLOR_CHOOSED, payload: { color } });
    },

    changeFieldSize: (size) => {
      dispatch({ type: TYPES.FIELD_SIZE_CHANGED, payload: { size } });
    },

    getPlayerGameRooms: (token) => {
      const gameRoomRequest = () => {
        axios({
          method: 'get',
          headers: { Authorization: `Token ${token}` },
          url: '/api/v2/rooms/',
        }).then((response) => {
          dispatch({ type: TYPES.UPDATE_PLAYER_ROOMS, payload: { data: response.data.user_rooms } });
          dispatch({ type: TYPES.UPDATE_FREE_ROOMS, payload: { data: response.data.free_rooms } })
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
)(GameContainer);
