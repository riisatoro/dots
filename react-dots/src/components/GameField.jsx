/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { TYPES } from '../redux/types';
import connectSocket from '../socket/socket';

import '../../public/css/game_field.css';

class GameField extends Component {
  componentDidMount() {
    const { roomID, receiveReply, interruptGame, closeResults } = this.props;
    closeResults();
    this.socket = connectSocket(roomID);
    this.socket.onmessage = (msg) => { receiveReply(JSON.parse(msg.data));};
    this.socket.onerror = () => { interruptGame(); };
    this.socket.onclose = () => { interruptGame(); };
  }

  componentWillUnmount() {
    const { closeResults } = this.props;
    closeResults();
    this.socket.send(JSON.stringify({ TYPE: TYPES.SOCKET_DISCONNECT, data: {} }));
    this.socket.close();
  }

  onPlayerGiveUp() {
    this.socket.send(JSON.stringify({ TYPE: TYPES.PLAYER_GIVE_UP, data: {} }));
    this.socket.close();
  }

  dotClicked(e) {
    const { fieldSize } = this.props;
    const index = e.target.id;
    const yAxis = index % fieldSize;
    const xAxis = (index - yAxis) / fieldSize;
    this.socket.send(JSON.stringify({ fieldPoint: [xAxis, yAxis], TYPE: TYPES.PLAYER_SET_DOT }));
  }

  render() {
    const { field, fieldSize, turn, gameResults, captured } = this.props;
    let userTurn = '';
    if (turn === 'NaN') {
      userTurn = ' not your ';
    } else {
      userTurn = ` ${turn} `;
    }

    const item = field.map((i, pIndex) => (
      <div className="input__row" key={pIndex.toString()}>
        {i.map((j, qIndex) => (
          <div
            className={j}
            key={(pIndex * fieldSize + qIndex).toString()}
            id={pIndex * fieldSize + qIndex}
            onClick={this.dotClicked.bind(this)}
            aria-hidden="true"
            role="button"
            aria-label=" "
            tabIndex={0}
          />
        ))}
      </div>
    ));

    const results = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(captured)) {
      results.push(`${key} captured ${value} points`);
    }

    return (
      <section className="field">
        <div>
          <p>
            Now is
            {userTurn}
            turn
          </p>
        </div>

        <div className="field__wrapper">{item}</div>

        <div className="align-center">
          <button type="button" className="btn btn-danger space-around" onClick={this.onPlayerGiveUp.bind(this)}>Give up</button>
        </div>

        <div>
          { gameResults && results.map((itemR) => <p className="align-center">{itemR}</p>)}
        </div>

      </section>
    );
  }
}

GameField.propTypes = {
  roomID: PropTypes.number.isRequired,
  field: PropTypes.array.isRequired,
  fieldSize: PropTypes.number.isRequired,
  turn: PropTypes.string,
  username: PropTypes.string.isRequired,
  playerColor: PropTypes.string.isRequired,
  captured: PropTypes.object,
  gameEnd: PropTypes.bool,
  interruptGame: PropTypes.func.isRequired,
  closeResults: PropTypes.func.isRequired,
  gameResults: PropTypes.bool.isRequired,

  receiveReply: PropTypes.func.isRequired,
};

GameField.defaultProps = {
  turn: '',
  captured: {},
  gameEnd: false,
};

const mapStateToProps = (state) => {
  const data = {
    roomID: state.socket.roomId,
    field: state.field,
    fieldSize: state.socket.fieldSize,
    username: state.user.username,
    turn: state.turn,
    playerColor: state.playerColor,
    captured: state.captured,
    gameEnd: state.gameEnd,
    gameResults: state.gameResults,
  };
  return data;
};

export default connect(
  mapStateToProps,
  (dispatch) => ({
    receiveReply: (data) => {
      dispatch({ type: data.TYPE, payload: data });
    },
    interruptGame: () => {
      dispatch({ type: TYPES.INTERRUPT_GAME_COMPONENT, payload: { } });
    },
    closeResults: () => {
      dispatch({ type: TYPES.CLOSE_RESULTS, payload: { } });
    },
  }
  ),
)(GameField);
