import React from 'react';
import { connect } from 'react-redux';
import {
  Form, Button, Row, Col,
} from 'react-bootstrap';
import axios from 'axios';
import PropTypes from 'prop-types';
import TYPES from '../redux/types';
import { socket } from '../socket/socket';
import '../../public/css/default.css';
import isContrast from '../actions/findContrast';

function GameRoomsToJoin(props) {
  const {
    availableGames, playerColor, token, onJoinGameRoom,
  } = props;
  const cards = [];

  const changePickedColor = (e) => {
    props.setPlayerColor(e.target.value);
  };

  const joinGame = (e) => {
    let colorIsContrast = true;
    const colors = availableGames[e.target.id].players;
    const limitReached = Object.keys(props.games).length >= props.roomLimit;

    Object.keys(colors).forEach((key) => {
      colorIsContrast = colorIsContrast && isContrast(playerColor, colors[key].color, 255);
    });

    if (!colorIsContrast) {
      props.openModal();
    } else if (limitReached) {
      props.openLimitModal();
    } else {
      onJoinGameRoom(token, e.target.id, playerColor);
      socket.send(JSON.stringify(
        {
          type: TYPES.PLAYER_JOIN_GAME,
          currentGame: e.target.id,
        },
      ));
    }
  };
  Object.keys(availableGames).forEach((key) => {
    cards.push(
      <Col xs={12} md={6} lg={4} key={key.toString()}>
        <div className="card m-2 p-2">
          {
            Object.keys(availableGames[key].players).map((player) => (
              <React.Fragment key={player.toString()}>
                <h5 className="card-title">
                  Player:&nbsp;
                  {availableGames[key].players[player].username}
                  <div className="games-color-block col-6" style={{ backgroundColor: availableGames[key].players[player].color }} />
                </h5>
                <p>{`Field size ${availableGames[key].size} x ${availableGames[key].size}`}</p>
              </React.Fragment>
            ))
          }

          <div className="card-body">
            <Row>
              <p className="card-text col-6">Change color:</p>
              <div className="col-6">
                <Form.Control
                  type="color"
                  className="games-color-block"
                  value={playerColor}
                  onChange={changePickedColor}
                />
              </div>
            </Row>
            <Button onClick={joinGame} id={key}>Join</Button>
          </div>
        </div>

      </Col>,
    );
  });

  return (
    <>
      <hr />
      <h3 className="text-center mb-3">Join already created games</h3>
      <Row>
        { cards.map((item) => item) }
      </Row>
    </>
  );
}

GameRoomsToJoin.propTypes = {
  games: PropTypes.objectOf(PropTypes.object),
  roomLimit: PropTypes.number.isRequired,
  token: PropTypes.string.isRequired,
  playerColor: PropTypes.string.isRequired,

  availableGames: PropTypes.objectOf(PropTypes.object),

  openModal: PropTypes.func.isRequired,
  openLimitModal: PropTypes.func.isRequired,
  setPlayerColor: PropTypes.func.isRequired,
  onJoinGameRoom: PropTypes.func.isRequired,
};

GameRoomsToJoin.defaultProps = {
  availableGames: {},
  games: {},
};

const mapStateToProps = (state) => ({
  token: state.auth.token,
  roomLimit: state.appData.roomLimit,
  availableGames: state.gameData.availableGames,
  playerColor: state.gameData.temporary.playerColor,
  games: {
    ...state.gameData.currentGames,
    ...state.gameData.waitingGames,
  },
});

export default connect(
  mapStateToProps,
  (dispatch) => ({
    setPlayerColor: (color) => {
      dispatch({ type: TYPES.UPDATE_TMP_COLOR, payload: { color } });
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
          dispatch({ type: TYPES.UPDATE_ROOMS, payload: response.data });
        });
      };
      joinGameRoom();
    },
    openModal: () => {
      dispatch({ type: TYPES.OPEN_MODAL_COLOR });
    },
    openLimitModal: () => {
      dispatch({ type: TYPES.OPEN_MODAL_LIMIT });
    },
  }),
)(GameRoomsToJoin);
