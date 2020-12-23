/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Stage, Layer } from 'react-konva';
import PropTypes from 'prop-types';
import TYPES from '../redux/types';

import { getCanvasGrid, getCircleCoords, createLoopFigure } from '../actions/gameFieldDrawable';

function Results(props) {
  const {
    captured, field, closeResults, loops, cellSize, fieldSize
  } = props;
  closeResults();

  const canvasGrid = getCanvasGrid(fieldSize, cellSize);
  const circle = getCircleCoords(field, cellSize);
  const loop1 = createLoopFigure(loops[0], cellSize);
  const loop2 = createLoopFigure(loops[1], cellSize);

  const results = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(captured)) {
    results.push(`${key} captured ${value} points`);
  }

  return (
    <section className="results">
      <p className="header align-center h3 space-around">Results</p>

      <div>
        <Stage
          width={fieldSize * cellSize + cellSize * 2}
          height={fieldSize * cellSize + cellSize * 2}
        >
          <Layer x={cellSize} y={cellSize}>
            {canvasGrid.map((line) => line)}
            {circle.map((circ) => circ)}
            {loop1.map((l1) => l1)}
            {loop2.map((l2) => l2)}
          </Layer>
        </Stage>
      </div>

      <div>
        {results.map((item) => <p className="align-center">{item}</p>)}
      </div>
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
