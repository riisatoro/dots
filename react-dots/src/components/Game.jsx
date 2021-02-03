import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Container,
} from 'react-bootstrap';
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
    return (
      <section className="field">
        {/* { modalWindow } */}
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
  token: PropTypes.string.isRequired,
  getPlayerGameRooms: PropTypes.func.isRequired,
};

Game.defaultProps = {};

const mapStateToProps = (state) => ({
  token: state.auth.token,
  games: state.gameData.currentGames,
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
  }),
)(Game);
