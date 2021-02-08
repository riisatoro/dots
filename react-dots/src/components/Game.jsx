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
    const { getPlayerGameRooms, token } = props;
    getPlayerGameRooms(token);
  }

  closeModal() {
    const { setModal } = this.props;
    setModal(true);
  }

  render() {
    const { modalColorContrast, modalLimitRooms } = this.props;
    const warnTitle = [
      <h4>Colors is not contrast!</h4>,
      <p>
        Room limit reached!
      </p>,
    ];
    const warnText = [
      <p>
        Your color is not contrast with colors of other players.&nbsp;
        Or, maybe, is&apos;t too dark or too white.&nbsp;
        Please, choose another color!
      </p>,
      <p>You already playing in 6 games!&nbsp;Finish them and try again!</p>,
    ];
    const modalWarning = (
      <Modal
        show={modalColorContrast || modalLimitRooms}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton onClick={this.closeModal}>
          <Modal.Title id="contained-modal-title-vcenter">
            {
              modalColorContrast ? 'Color warning' : 'Room limit warning'
            }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { modalColorContrast ? warnTitle[0] : warnTitle[1] }
          { modalColorContrast ? warnText[0] : warnText[1] }
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    );

    return (
      <section className="field">
        { modalWarning }
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
  modalLimitRooms: PropTypes.bool,

  setModal: PropTypes.func.isRequired,
  getPlayerGameRooms: PropTypes.func.isRequired,
};

Game.defaultProps = {
  modalLimitRooms: false,
  modalColorContrast: false,
};

const mapStateToProps = (state) => ({
  token: state.auth.token,
  games: state.gameData.currentGames,
  modalColorContrast: state.uiData.modalColorContrast,
  modalLimitRooms: state.uiData.modalLimitRooms,
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
