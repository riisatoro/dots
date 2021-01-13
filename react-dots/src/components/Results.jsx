/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Stage, Layer } from 'react-konva';
import PropTypes from 'prop-types';
import TYPES from '../redux/types';

import { getCanvasGrid, getCircleCoords, createLoopFigure, createEmptyCircle } from '../actions/gameFieldDrawable';

function Results(props) {
  const {
    captured, field, closeResults, loops, cellSize, fieldSize, playerColors
  } = props;
  closeResults();
  /*
  const canvasGrid = getCanvasGrid(fieldSize, cellSize);
  const circle = getCircleCoords(field, cellSize, playerColors);
  const emptyCircle = createEmptyCircle(field, cellSize);
  const loop = createLoopFigure(field, loops, cellSize, playerColors);
  
  const results = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(captured)) {
    results.push(`${key} captured ${value} points`);
  }
  */

  return (
    <section className="results">
      <p className="header align-center h3 space-around">Results</p>
    </section>
  );
}

Results.propTypes = {
  captured: PropTypes.object.isRequired,
  field: PropTypes.array.isRequired,
  fieldSize: PropTypes.number.isRequired,
  closeResults: PropTypes.func.isRequired,
  loops: PropTypes.array.isRequired,
  cellSize: PropTypes.number.isRequired,
};

const mapStateToProps = (state) => {
  const data = {
    captured: state.captured,
    field: state.field,
    loops: state.loops,
    cellSize: state.cellSize,
    fieldSize: state.socket.fieldSize,
    playerColors: state.playerColors,
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

/*
  <div>
        {results.map((item) => <p className="align-center">{item}</p>)}
      </div>
      
      <div className="gameCanvas">
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
*/
