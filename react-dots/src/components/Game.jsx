import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Form, Button, Container, Row, Modal, Col,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import axios from 'axios';
import TYPES from '../redux/types';
import isContrast from '../actions/findContrast';

import GameCreateForm from './GameCreateForm';
import GameCanvas from './GameCanvas';
import GameRoomsToJoin from './GameRoomsToJoin';
import GameTabs from './GameTabs';

import '../../public/css/default.css';

class Game extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
  }

  componentDidMount() {
    const { getPlayerGameRooms, token } = this.props;
    getPlayerGameRooms(token);
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
          <GameCreateForm />
        </Container>

        <Container>
          <GameTabs />
          <GameCanvas />
        </Container>

        <Container>
          <GameRoomsToJoin />
        </Container>

      </section>
    );
  }
}

Game.propTypes = {
  modal: PropTypes.bool,
  token: PropTypes.string.isRequired,

  setModal: PropTypes.func.isRequired,
  getPlayerGameRooms: PropTypes.func.isRequired,
};

Game.defaultProps = {
  modal: false,
};

const mapStateToProps = (state) => ({
  modal: false,
  token: state.auth.token,
});

export default connect(
  mapStateToProps,
  (dispatch) => ({
    getPlayerGameRooms: (token) => {
      const gameRoomRequest = () => {
        axios({
          method: 'get',
          headers: { Authorization: `Token ${token}` },
          url: '/api/v2/rooms/',
        }).then((response) => {
          dispatch({
            type: TYPES.UPDATE_ROOMS,
            payload: response.data,
          });
        });
      };
      gameRoomRequest();
    },

    setModal: (value) => {
      dispatch({ type: TYPES.SET_MODAL, payload: value });
    },
  }),
)(Game);
