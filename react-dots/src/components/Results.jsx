/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Stage, Layer } from 'react-konva';
import PropTypes from 'prop-types';
import TYPES from '../redux/types';

import {
  getCanvasGrid, getCircleCoords, createLoopFigure, createEmptyCircle,
} from '../actions/gameFieldDrawable';

function Results(props) {
  const {
    field,
    fieldSize,
    loops,
    cellSize,
    playerColors,
    userID,
    score,
    closeResults,
  } = props;
  closeResults();

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
  const userColorKey = playerColors[userID];

  const userColor = `Your points are ${humanTextColor[userColorKey]}`;
  let textScore = '';
  Object.keys(score).forEach((key) => {
    textScore += `${humanTextColor[playerColors[key]]} captured ${score[key]} points `;
  });

  return (
    <section className="results">
      <p className="header align-center h3 space-around">Results</p>
      <div className="game-info align-center">
        <p>{userColor}</p>
      </div>
      <hr />
      <div className="gameCanvas" style={{ width: fieldSize * cellSize + cellSize * 2 }}>
        <Stage
          width={fieldSize * cellSize + cellSize * 2}
          height={fieldSize * cellSize + cellSize * 2}
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
    </section>
  );
}

Results.propTypes = {
  userID: PropTypes.number.isRequired,
  field: PropTypes.array.isRequired,
  fieldSize: PropTypes.number.isRequired,
  loops: PropTypes.array,
  cellSize: PropTypes.number.isRequired,
  playerColors: PropTypes.object.isRequired,
  score: PropTypes.object.isRequired,
  closeResults: PropTypes.func.isRequired,
};

Results.defaultProps = {
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
    closeResults: () => {
      dispatch({ type: TYPES.CLOSE_RESULTS, payload: {} });
    },
  }),
)(Results);
