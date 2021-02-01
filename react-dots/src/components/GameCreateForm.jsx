import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
  Form, Button, Col, Container, Row,
} from 'react-bootstrap';
import { connect } from 'react-redux';
import isContrast from '../actions/findContrast';
import TYPES from '../redux/types';

function GameCreateForm(props) {
  const { playerColor, playerRooms, roomLimit, user } = props;
  const {
    register, errors, handleSubmit,
  } = useForm();

  const changePickedColor = (e) => {
    props.setPlayerColor(e.target.value);
  };

  const onCreateNewRoom = handleSubmit(({ fieldSize }) => {
    const { setModal, token } = props;
    const contrast = (
      isContrast(playerColor, '#FFFFFF', 1)
      && isContrast(playerColor, '#000000', 2)
    );
    setModal(contrast);
    if (contrast && Object.keys(playerRooms).length <= roomLimit) {
      props.createNewRoom(token, parseInt(fieldSize, 10), playerColor);
    }
  });
  const limitReached = Object.keys(playerRooms).length >= roomLimit ? 'd-none' : '';

  return (
    <>
      <Form onSubmit={onCreateNewRoom} className={limitReached}>
        <Form.Row className="mb-3">
          <Form.Group as={Col} sm={12} lg={6} controlId="color" className="m-auto">
            <Form.Label>Click to choose your color:</Form.Label>
            <Form.Control
              required
              type="color"
              name="color"
              className={`games-color-block ${limitReached}`}
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
              className={limitReached}
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
          <Button type="submit" className={`btn btn-success m-auto ${limitReached}`}>Create new game</Button>
        </Form.Row>
      </Form>
      {limitReached === 'd-none' && <p className="text-danger text-center">You reached room limit! Please, finish your games first</p>}
    </>
  );
}

GameCreateForm.propTypes = {
  user: PropTypes.number.isRequired,
  roomLimit: PropTypes.number.isRequired,
  token: PropTypes.string.isRequired,
  playerColor: PropTypes.string.isRequired,

  playerRooms: PropTypes.objectOf(PropTypes.object),

  setModal: PropTypes.func.isRequired,
  createNewRoom: PropTypes.func.isRequired,
  setPlayerColor: PropTypes.func.isRequired,
};

GameCreateForm.defaultProps = {
  playerRooms: {},
};

const mapStateToProps = (state) => {
  const data = {
    user: state.auth.id,
    roomLimit: state.appData.roomLimit,
    token: state.auth.token,
    playerColor: state.gameData.temporary.playerColor,

    playerRooms: state.gameData.userGames,
  };
  return data;
};

export default connect(
  mapStateToProps,
  (dispatch) => ({
    setPlayerColor: (color) => {
      dispatch({ type: TYPES.UPDATE_TMP_COLOR, payload: { color } });
    },

    setModal: (value) => {
      /* dispatch({ type: TYPES.SET_MODAL, payload: value }); */
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
          dispatch({ type: TYPES.UPDATE_ROOMS, payload: response.data });
        });
      };
      newRoomRequest();
    },
  }),
)(GameCreateForm);
