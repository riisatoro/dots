/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { TYPES } from '../redux/types';

import '../../public/css/game_field.css';

class GameField extends Component {
  constructor(props) {
    super(props);
    const { roomId, receiveReply, interruptGame } = this.props;
    this.socket = new WebSocket(`ws://127.0.0.1:8000/ws/room/${roomId}/`);
    this.socket.onmessage = (msg) => {
      receiveReply(JSON.parse(msg.data));
    };
    this.socket.onclose = () => { interruptGame(); };
  }

  componentWillUnmount() {
    this.socket.send(JSON.stringify({ TYPE: TYPES.SOCKET_DISCONNECT, data: {} }));
    this.socket.close();
  }

  handleKeyPress() {
    this.click = true;
  }

  dotClicked(e) {
    const { fieldSize, token, onDotClicked } = this.props;
    const index = e.target.id;
    const yAxe = index % fieldSize;
    const xAxe = (index - yAxe) / fieldSize;

    onDotClicked([xAxe, yAxe], token, this.socket);
  }

  render() {
    const { field, fieldSize } = this.props;
    const item = field.map((i, pIndex) => (
      <div className="input__row" key={pIndex.toString()}>
        {i.map((j, qIndex) => (
          <div
            className={j}
            key={(pIndex * fieldSize + qIndex).toString()}
            id={pIndex * fieldSize + qIndex}
            onKeyPress={this.handleKeyPress}
            onClick={this.dotClicked.bind(this)}
            role="button"
            aria-label=" "
            tabIndex={0}
          />
        ))}
      </div>
    ));

    return (
      <section className="field">
        <div className="field__wrapper">{item}</div>

        <div className="align-center">
          <button type="button" className="btn btn-danger space-around">End game</button>
        </div>

      </section>
    );
  }
}

GameField.propTypes = {
  roomId: PropTypes.number.isRequired,
  field: PropTypes.array.isRequired,
  fieldSize: PropTypes.number.isRequired,
  token: PropTypes.string.isRequired,
  gameInterrupted: PropTypes.bool,

  onDotClicked: PropTypes.func.isRequired,
  receiveReply: PropTypes.func.isRequired,
  interruptGame: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const data = {
    token: state.user.token,
    roomId: state.socket.roomId,
    field: state.field,
    fieldSize: state.socket.fieldSize,
    gameInterrupted: state.gameInterrupted,
  };
  return data;
};

GameField.defaultProps = {
  gameInterrupted: false,
};

export default connect(
  mapStateToProps,
  (dispatch) => ({
    onDotClicked: (position, token, socket) => {
      socket.send(JSON.stringify(
        { fieldPoint: position, TYPE: TYPES.PLAYER_SET_DOT },
      ));
    },
    receiveReply: (data) => {
      dispatch({ type: data.TYPE, payload: data });
    },
    clearGameField: () => {
      dispatch({ type: TYPES.CLEAR_GAME_FIELD, payload: { } });
    },
    interruptGame: () => {
      dispatch({ type: TYPES.INTERRUPT_GAME_COMPONENT, payload: { } });
    },
  }
  ),
)(GameField);
