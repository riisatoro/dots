import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Modal, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import axios from 'axios';
import TYPES from '../redux/types';

import GameCreateForm from './GameCreateForm';
import GameCanvas from './GameCanvas';
import GameRoomsToJoin from './GameRoomsToJoin';
import GameTabs from './GameTabs';

import '../../public/css/default.css';

class Game extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    const { getPlayerGameRooms, token } = this.props;
    getPlayerGameRooms(token);
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
    const { modalColorContrast } = this.props;
    const modalWindow = (
      <Modal
        show={modalColorContrast}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton onClick={this.closeModal}>
          <Modal.Title id="contained-modal-title-vcenter">
            Color warning
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Color is not contrast!</h4>
          <p>
            Your color is not contrast with colors of other players.&nbsp;
            Or, maybe, is&apos;t too dark or too white.&nbsp;
            Please, choose another color!
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    );

    return (
      <section className="field">
        { modalWindow }
        <Container className="mb-5">
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
  token: PropTypes.string.isRequired,
  modalColorContrast: PropTypes.bool,

  setModal: PropTypes.func.isRequired,
  getPlayerGameRooms: PropTypes.func.isRequired,
};

Game.defaultProps = {
  modalColorContrast: false,
};

const mapStateToProps = (state) => ({
  token: state.auth.token,
  games: state.gameData.currentGames,
  modalColorContrast: state.uiData.modalColorContrast,
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

    setModal: () => {
      dispatch({ type: TYPES.CLOSE_MODAL });
    },
  }),
)(Game);
