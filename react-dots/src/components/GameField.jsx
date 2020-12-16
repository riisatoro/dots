/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { TYPES } from '../redux/types';
import connectSocket from '../socket/socket';

import '../../public/css/game_field.css';

// socket.onmessage = (msg) => {receiveReply(JSON.parse(msg.data));};
// socket.onerror = () => { interruptGame(); };
// socket.onclose = () => { interruptGame(); };

class GameField extends Component {
  componentDidMount() {
    const { roomID } = this.props;
    this.socket = connectSocket(roomID);
  }

  componentWillUnmount() {
    //socket.send(JSON.stringify({ TYPE: TYPES.SOCKET_DISCONNECT, data: {} }));
    //socket.close();
  }

  dotClicked(e) {
    const { fieldSize } = this.props;
    const index = e.target.id;
    const yAxis = index % fieldSize;
    const xAxis = (index - yAxis) / fieldSize;
    this.socket.send(JSON.stringify({ fieldPoint: [xAxis, yAxis], TYPE: TYPES.PLAYER_SET_DOT }));
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
            onClick={this.dotClicked.bind(this)}
            aria-hidden="true"
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
  roomID: PropTypes.number.isRequired,
  field: PropTypes.array.isRequired,
  fieldSize: PropTypes.number.isRequired,

  receiveReply: PropTypes.func.isRequired,
  interruptGame: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const data = {
    roomID: state.socket.roomId,
    field: state.field,
    fieldSize: state.socket.fieldSize,
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
  }
  ),
)(GameField);
