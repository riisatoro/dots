/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import PropTypes from 'prop-types';
import { Stage, Layer } from 'react-konva';

import connectSocket from '../socket/socket';
import TYPES from '../redux/types';
import { getCanvasGrid, getCircleCoords, createLoopFigure, createEmptyCircle } from '../actions/gameFieldDrawable';
import '../../public/css/game_field.css';

class GameField extends Component {
  componentDidMount() {
    const {
      roomID,
      receiveReply,
    } = this.props;
    this.socket = connectSocket(roomID);
    this.socket.onmessage = (msg) => { receiveReply(JSON.parse(msg.data));};
    this.socket.onerror = () => { };
    this.socket.onclose = () => { };
  }

  componentWillUnmount() {
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

  gridClicked(e) {
    const { cellSize } = this.props;
    const xAxis = e.evt.layerX - cellSize / 2;
    const yAxis = e.evt.layerY - cellSize / 2;
    const xPoint = Math.floor(xAxis / cellSize);
    const yPoint = Math.floor(yAxis / cellSize);
    this.socket.send(JSON.stringify({ fieldPoint: [yPoint, xPoint], TYPE: TYPES.PLAYER_SET_DOT }));
    console.log(yPoint, xPoint);
  }

  render() {
    const {
      field,
      fieldSize,
      turn,
      gameResults,
      loops,
      cellSize,
    } = this.props;

    const canvasGrid = getCanvasGrid(fieldSize, cellSize);
    const circle = getCircleCoords(field, cellSize);
    const loop1 = createLoopFigure(loops[0], cellSize);
    const loop2 = createLoopFigure(loops[1], cellSize);
    const emptyCircle = createEmptyCircle(field, cellSize);

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

    return (
      <section className="field">
        { gameResults && <Redirect to="/game_result" /> }
        <div>
          <p>
            Now is
            {userTurn}
            turn
          </p>
        </div>

        <div className="field__wrapper">{item}</div>

        <div className="align-center">
          <a href="/game_result">
            <button type="button" className="btn btn-danger space-around" onClick={this.onPlayerGiveUp.bind(this)}>Give up</button>
          </a>
        </div>

        <hr />
        <div className="gameCanvas">
          <Stage
            width={fieldSize * cellSize + cellSize * 2}
            height={fieldSize * cellSize + cellSize * 2}
            // eslint-disable-next-line react/jsx-no-bind
            onClick={this.gridClicked.bind(this)}
          >
            <Layer x={cellSize} y={cellSize}>
              {loop1.map((l1) => l1)}
              {loop2.map((l2) => l2)}
              {canvasGrid.map((line) => line)}
              {circle.map((circ) => circ)}
              {emptyCircle.map((circl) => circl)}
            </Layer>
          </Stage>
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
  loops: PropTypes.array.isRequired,
  gameResults: PropTypes.bool.isRequired,
  cellSize: PropTypes.number.isRequired,

  receiveReply: PropTypes.func.isRequired,
};

GameField.defaultProps = {
  turn: '',
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
    loops: state.loops,
    cellSize: state.cellSize,
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
