/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Stage, Layer } from 'react-konva';

import connectSocket from '../socket/socket';
import TYPES from '../redux/types';
import {
  getCanvasGrid, getCircleCoords, createLoopFigure, createEmptyCircle,
} from '../actions/gameFieldDrawable';
import '../../public/css/game_field.css';

class GameField extends Component {
  componentDidMount() {
    const {
      roomID,
      receiveReply,
    } = this.props;
    this.socket = connectSocket(roomID);
    this.socket.onmessage = (msg) => { receiveReply(JSON.parse(msg.data)); };
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

  gridClicked(e) {
    const { cellSize } = this.props;
    const xAxis = e.evt.layerX - cellSize / 2;
    const yAxis = e.evt.layerY - cellSize / 2;
    const xPoint = Math.floor(xAxis / cellSize) + 1;
    const yPoint = Math.floor(yAxis / cellSize) + 1;
    this.socket.send(JSON.stringify({ fieldPoint: [xPoint, yPoint], TYPE: TYPES.PLAYER_SET_DOT }));
  }

  render() {
    const {
      field,
      fieldSize,
      turn,
      gameResults,
      loops,
      cellSize,
      playerColors,
      userID,
      score,
    } = this.props;

    const canvasGrid = getCanvasGrid(fieldSize, cellSize);
    const circle = getCircleCoords(field, cellSize, playerColors);
    const emptyCircle = createEmptyCircle(field, cellSize);
    const loop = createLoopFigure(field, loops, cellSize, playerColors);

    const humanTextColor = {
      R: 'Red',
      O: 'Orange',
      G: 'Green',
      B: 'Blue',
      Y: 'Yellow',
    };
    const colorKey = playerColors[turn];
    const userColorKey = playerColors[userID];

    const userColor = `Your points are ${humanTextColor[userColorKey]}`;
    let textTurn = 'Now is your turn';
    if (colorKey !== userColorKey) {
      textTurn = ' ';
    }

    let textScore = '';
    Object.keys(score).forEach((key) => {
      textScore += `${humanTextColor[playerColors[key]]} captured ${score[key]} points `;
    });

    return (
      <section className="field">
        <div className="game-info align-center">
          <p>{userColor}</p>
          <p className="const-width">{textTurn}</p>
        </div>
        <hr />
        <div className="gameCanvas" style={{ width: fieldSize * cellSize + cellSize * 2 }}>
          <Stage
            width={fieldSize * cellSize + cellSize * 2}
            height={fieldSize * cellSize + cellSize * 2}
            onClick={this.gridClicked.bind(this)}
          >
            <Layer x={cellSize} y={cellSize}>
              {canvasGrid.map((line) => line)}
              {emptyCircle.map((circl) => circl)}
              {loop.map((l1) => l1)}
              {circle.map((circ) => circ)}
            </Layer>
          </Stage>
        </div>

        <div className="align-center game-score">
          <p>{textScore}</p>
        </div>

        <div className="align-center">
          <a href="/game_result">
            <button type="button" className="btn btn-danger space-around" onClick={this.onPlayerGiveUp.bind(this)}>Give up</button>
          </a>
        </div>
      </section>
    );
  }
}

GameField.propTypes = {
  userID: PropTypes.number.isRequired,
  roomID: PropTypes.number.isRequired,
  field: PropTypes.array.isRequired,
  fieldSize: PropTypes.number.isRequired,
  turn: PropTypes.number,
  loops: PropTypes.array,
  gameResults: PropTypes.bool.isRequired,
  cellSize: PropTypes.number.isRequired,
  playerColors: PropTypes.object.isRequired,
  receiveReply: PropTypes.func.isRequired,
  score: PropTypes.object.isRequired,
};

GameField.defaultProps = {
  turn: -1,
  loops: [],
};

const mapStateToProps = (state) => {
  const data = {
    userID: state.user.userID,
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
    playerColors: state.playerColors,
    score: state.score,
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
