import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';

import { TYPES } from '../redux/types';

import '../../public/css/settings.css';

class Settings extends Component {
  componentDidMount() {
    const { getGameRooms, token } = this.props;
    getGameRooms(token);
  }

  onCreateNewRoom() {
    const { createNewRoom, token } = this.props;
    createNewRoom(token, 10, 'R');
  }

  onPlayerJoinGame(e) {
    const { onJoinGameRoom, token } = this.props;
    onJoinGameRoom(token, e.target.id, 'G');
  }

  onColorClicked(e) {
    const { setPlayerColor } = this.props;
    setPlayerColor(e.target.id);
  }

  newFieldSize(e) {
    const { changeFieldSize } = this.props;
    const size = e.target.value;
    if (size > 5 && size < 16) {
      changeFieldSize(size);
    }
  }

  submitForm(e) {
    const { players, setPlayersName, startNewGame } = this.props;
    if (players[0].index !== players[1].index
            && players[0].index !== -1
            && players[1].index !== -1) {
      setPlayersName(e.player1, e.player2);
      startNewGame();
    }
  }

  render() {
    const { rooms, colors, colorTable } = this.props;
    console.log(rooms)
    return (
      <section className="field">
        <h2 className="">Create the room</h2>
        <div className="alert alert-primary col-5 block-margin" role="alert">Choose a color. Colors can&apos;t be the same</div>

        <form onSubmit={this.submitForm}>
          <div className="row justify-content-center width-90">
            {colors.map((color, index) => (
              <div className="col-2" key={index.toString()}>
                <input
                  className="block-margin"
                  type="radio"
                  key={index.toString()}
                  id={index}
                  name="color1"
                  onClick={this.onColorClicked.bind(this)}
                />
                <div className={color}> </div>
              </div>
            ))}
          </div>

          <div className="row justify-content-center width-90">
            <div className="form-group col-8" key="username">
              <input
                className="form-control space-around"
                type="number"
                key="field_size"
                name="size"
                placeholder="Field size"
                onChange={(number) => this.newFieldSize(number)}/>
            </div>
          </div>

          <div className="align-center">
            <button type="button" className="btn btn-success" onClick={this.onCreateNewRoom.bind(this)}>New room</button>
          </div>

        </form>

        <hr />
        <hr />

        <h2 className="">Join the room</h2>
        <div className="container">
          <div className="join-room room_grid">
            {
                rooms.map((element) => (
                  <div className="">
                    <p>
                      Player:
                      {element.user.username}
                    </p>
                    <p>
                      Field:
                      {element.game_room.size}
                      *
                      {element.game_room.size}
                    </p>
                    <p>Color:</p>
                    <div className={colorTable[element.color]}> </div>
                    <button type="button" id={element.game_room.id} className="btn btn-primary" onClick={this.onPlayerJoinGame.bind(this)}>Join</button>
                    <hr />
                  </div>
                ))
            }
          </div>

        </div>

      </section>
    );
  }
}

Settings.propTypes = {
  createNewRoom: PropTypes.func.isRequired,
  setPlayerColor: PropTypes.func.isRequired,
  changeFieldSize: PropTypes.func.isRequired,
  startNewGame: PropTypes.func.isRequired,
  setPlayersName: PropTypes.func.isRequired,
  getGameRooms: PropTypes.func.isRequired,
  token: PropTypes.func.isRequired,
  players: PropTypes.objectOf(PropTypes.object).isRequired,
  colors: PropTypes.objectOf(PropTypes.string).isRequired,
  colorTable: PropTypes.objectOf(PropTypes.object).isRequired,
  rooms: PropTypes.objectOf(PropTypes.object),
  onJoinGameRoom: PropTypes.func.isRequired,
};

Settings.defaultProps = {
  rooms: [],
};

const mapStateToProps = (state) => {
  const data = {
    token: state.user.token,
    players: state.players,
    rooms: state.rooms,
    colors: state.colors,
    colorTable: state.colorTable,
    socket: state.webSocket,
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

    startNewGame: () => {
      dispatch({ type: TYPES.START_NEW_GAME, payload: {} });
    },

    setPlayersName: (p1, p2) => {
      dispatch({ type: TYPES.UPDATE_PLAYERS_NAME, payload: { p1, p2 } });
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
)(Settings);
