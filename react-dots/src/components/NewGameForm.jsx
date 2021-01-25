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
    props.setPlayerColor(e.target.value);
  };

  const onCreateNewRoom = handleSubmit(({ fieldSize }) => {
    const { token } = props;
    props.createNewRoom(token, fieldSize, playerColor);
  });

  return (
    <Form onSubmit={onCreateNewRoom}>
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
  playerColor: PropTypes.string.isRequired,
  createNewRoom: PropTypes.func.isRequired,
  setPlayerColor: PropTypes.func.isRequired,
  token: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
  const data = {
    playerColor: state.playerColor,
    token: state.user.token,
  };
  return data;
};

export default connect(
  mapStateToProps,
  (dispatch) => ({
    setPlayerColor: (color) => {
      dispatch({ type: TYPES.COLOR_CHOOSED, payload: { color } });
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
  }),
)(NewGameForm);
