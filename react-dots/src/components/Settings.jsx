import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';

import {
  COLOR_CHOOSED,
  START_NEW_GAME,
  FIELD_SIZE_CHANGED,
  UPDATE_PLAYERS_NAME,
  UPDATE_GAME_ROOMS,
} from '../redux/types';

import '../../public/css/settings.css';

class Settings extends Component {
  componentDidMount() {
    const { getGameRooms, token } = this.props;
    getGameRooms(token);
  }

  color1Clicked(e) {
    const { setPlayerColor, setPlayersName } = this.props;
    setPlayerColor(0, e.target.id);
    setPlayersName('default1', 'default2');
  }

  color2Clicked(e) {
    const { setPlayerColor } = this.props;
    setPlayerColor(1, e.target.id);
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

    return (
      <section className="field">
        <div className="alert alert-primary col-5 block-margin" role="alert">Choose a color. Colors can&apos;t be the same</div>

        <form onSubmit={this.submitForm}>
          <p className="h2 align-center">Player 1</p>

          <div className="row justify-content-center width-90">
            <div className="form-group col-8" key="username">
              <input
                className="form-control space-around"
                type="text"
                name="player1"
                placeholder="Nickname"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="row justify-content-center width-90">
            {colors.map((color, index) => (
              <div className="col-2" key={index.toString()}>
                <input
                  className="block-margin"
                  type="radio"
                  key={index.toString()}
                  id={index}
                  name="color1"
                  onClick={this.color1Clicked}
                />
                <div className={color}> </div>
              </div>
            ))}
          </div>

          <p className="h2 align-center">Player 2</p>

          <div className="row justify-content-center width-90">
            <div className="form-group col-8" key="username">
              <input
                className="form-control space-around"
                type="text"
                name="player2"
                placeholder="Nickname"
                autoComplete="off"
              />

            </div>
          </div>

          <div className="row justify-content-center width-90">
            {colors.map((color, index) => (
              <div className="wrapper_color col-2" key={index.toString()}>
                <input
                  className="block-margin"
                  type="radio"
                  key={index.toString()}
                  id={index}
                  name="color2"
                  onClick={this.color2Clicked}
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
                onChange={(number) => this.newFieldSize(number)}
              />
            </div>
          </div>

          <div className="align-center">
            <button type="button" className="btn btn-success space-bottom">Play!</button>
          </div>

        </form>

        <hr />
        <hr />

        <h2 className="">Create or join the room</h2>
        <div className="container">

          <div className="new-room">
            <button type="button" className="btn btn-success">New room</button>
          </div>

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
                    <button type="button" className="btn btn-primary">Join</button>
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
  };
  return data;
};

export default connect(
  mapStateToProps,
  (state) => ({
    store: state,
  }),
  (dispatch) => ({
    setPlayerColor: (player, color) => {
      dispatch({ type: COLOR_CHOOSED, payload: { player, color } });
    },

    changeFieldSize: (size) => {
      dispatch({ type: FIELD_SIZE_CHANGED, payload: { size } });
    },

    startNewGame: () => {
      dispatch({ type: START_NEW_GAME, payload: {} });
    },

    setPlayersName: (p1, p2) => {
      dispatch({ type: UPDATE_PLAYERS_NAME, payload: { p1, p2 } });
    },

    getGameRooms: (token) => {
      const gameRoomRequest = () => {
        axios({
          method: 'get',
          headers: { Authorization: `Token ${token}` },
          url: '/api/v2/rooms/',
        }).then((response) => { dispatch({ type: UPDATE_GAME_ROOMS, payload: response }); });
      };
      gameRoomRequest();
    },

  }
  ),
)(Settings);
