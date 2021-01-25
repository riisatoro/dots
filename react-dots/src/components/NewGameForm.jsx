import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
  Form, Button, Col,
} from 'react-bootstrap';
import { connect } from 'react-redux';
import TYPES from '../redux/types';

function NewGameForm(props) {
  const { playerColor } = props;
  const {
    register, errors, handleSubmit,
  } = useForm();

  const changePickedColor = (e) => {
    const { setPlayerColor } = props;
    setPlayerColor(e.target.value);
  };

  const onCreateNewRoom = () => {
    const {
      createNewRoom, token, playerColor, fieldSize,
    } = props;
    if (playerColor !== '') {
      createNewRoom(token, fieldSize, playerColor);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onCreateNewRoom)}>
      <Form.Row className="mb-3">
        <Form.Group as={Col} sm={12} lg={6} controlId="color" className="m-auto">
          <Form.Label>Click to choose your color:</Form.Label>
          <Form.Control
            required
            type="color"
            name="color"
            className="games-color-block"
            value={playerColor}
            onChange={changePickedColor}
          />
          <Form.Control.Feedback type="invalid">
            Username must be 3 or more characters
          </Form.Control.Feedback>
        </Form.Group>
      </Form.Row>

      <Form.Row className="mb-3">
        <Form.Group as={Col} sm={12} lg={6} controlId="fieldSize" className="m-auto">
          <Form.Label>Choose the field size (6-15):</Form.Label>
          <Form.Control
            type="number"
            name="fieldSize"
            isInvalid={errors.fieldSize}
            ref={register({
              required: true,
              min: 6,
              max: 15,
            })}
          />
          <Form.Control.Feedback type="invalid">
            Field size must be from 6 to 15
          </Form.Control.Feedback>
        </Form.Group>
      </Form.Row>
      <Form.Row className="mb-3">
        <Button type="submit" className="btn btn-success m-auto">Create new game</Button>
      </Form.Row>
    </Form>
  );
}

NewGameForm.propTypes = {
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

NewGameForm.defaultProps = {
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
)(NewGameForm);
