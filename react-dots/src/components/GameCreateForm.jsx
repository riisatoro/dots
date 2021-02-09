import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
  Form, Button, Col, Container,
} from 'react-bootstrap';
import { connect } from 'react-redux';
import isContrast from '../actions/findContrast';
import TYPES from '../redux/types';

function GameCreateForm(props) {
  const {
    waitingGames,
    currentGames,
    playerColor,
    roomLimit,
  } = props;
  const { errors, register, handleSubmit } = useForm();
  const games = { ...waitingGames, ...currentGames };
  const disabledColors = ['#FFFFFF', '#000000'];

  const changePickedColor = (e) => {
    props.setPlayerColor(e.target.value);
  };

  const onCreateNewRoom = handleSubmit(({ fieldSize }) => {
    const { setModal, token } = props;

    let contrast = true;
    disabledColors.forEach((color) => {
      contrast = contrast && isContrast(playerColor, color, 200);
    });

    if (!contrast) setModal();
    else if (Object.keys(games).length <= roomLimit) {
      props.createNewRoom(token, parseInt(fieldSize, 10), playerColor);
    }
  });
  const limitReached = Object.keys(games).length >= roomLimit ? 'd-none' : '';

  return (
    <Container className={limitReached}>
      <h2 className="text-center">Create new game room</h2>
      <Form onSubmit={onCreateNewRoom}>
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
    </Container>
  );
}

GameCreateForm.propTypes = {
  roomLimit: PropTypes.number.isRequired,
  token: PropTypes.string.isRequired,
  playerColor: PropTypes.string.isRequired,
  waitingGames: PropTypes.objectOf(PropTypes.object),
  currentGames: PropTypes.objectOf(PropTypes.object),

  setModal: PropTypes.func.isRequired,
  createNewRoom: PropTypes.func.isRequired,
  setPlayerColor: PropTypes.func.isRequired,
};

GameCreateForm.defaultProps = {
  waitingGames: {},
  currentGames: {},
};

const mapStateToProps = (state) => {
  const data = {
    waitingGames: state.gameData.waitingGames,
    currentGames: state.gameData.currentGames,

    roomLimit: state.appData.roomLimit,
    token: state.auth.token,
    playerColor: state.gameData.temporary.playerColor,
  };
  return data;
};

export default connect(
  mapStateToProps,
  (dispatch) => ({
    setPlayerColor: (color) => {
      dispatch({ type: TYPES.UPDATE_TMP_COLOR, payload: { color } });
    },

    setModal: () => {
      dispatch({ type: TYPES.OPEN_MODAL_COLOR });
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
