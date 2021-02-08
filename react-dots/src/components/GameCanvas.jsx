import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Stage, Layer } from 'react-konva';
import { Container } from 'react-bootstrap';
import PropTypes from 'prop-types';

import TYPES from '../redux/types';
import {
  getCanvasGrid, getCircleCoords, createLoopFigure, createEmptyCircle,
} from '../actions/gameFieldDrawable';
import { socket } from '../socket/socket';

import '../../public/css/default.css';

class GameCanvas extends Component {
  constructor(props) {
    super(props);
    this.gridClicked = this.gridClicked.bind(this);
  }

  gridClicked(e) {
    const {
      cellSize,
      currentGame,
      games,
    } = this.props;
    const xPoint = e.target.attrs.x / cellSize + 1;
    const yPoint = e.target.attrs.y / cellSize + 1;

    if (!Number.isNaN(xPoint) && !Number.isNaN(yPoint)) {
      const point = games[currentGame].field.field[yPoint][xPoint];
      if (point.captured_by.length === 0 && !point.border && point.owner === null) {
        socket.send(
          JSON.stringify({
            type: TYPES.PLAYER_SET_DOT,
            point: [xPoint, yPoint],
            currentGame,
          }),
        );
      }
    }
  }

  render() {
    const {
      games,
      cellSize,
      currentGame,
    } = this.props;

    let field = [[]];
    let fieldSize = 0;
    let colors = {};

    let canvasGrid = [];
    let circle = [];
    let emptyCircle = [];
    let loop = [];

    const game = games[currentGame];
    if (currentGame !== null && game !== undefined) {
      field = game.field.field;
      fieldSize = game.size;
      colors = game.players;
      canvasGrid = getCanvasGrid(fieldSize, cellSize);
      circle = getCircleCoords(field, cellSize, colors);
      emptyCircle = createEmptyCircle(field, cellSize);
      loop = createLoopFigure(field, game.field.loops, cellSize, colors);
    }

    return (
      <>
        <Container>
          <div className="m-auto" style={{ width: fieldSize * cellSize + cellSize }}>
            <Stage
              width={fieldSize * cellSize + cellSize}
              height={fieldSize * cellSize + cellSize}
              onClick={this.gridClicked}
              onTap={this.gridClicked}
            >
              <Layer x={cellSize} y={cellSize}>
                {canvasGrid.map((line, index) => (
                  <React.Fragment key={index.toString()}>
                    {line}
                  </React.Fragment>
                ))}

                {emptyCircle.map((circl, index) => (
                  <React.Fragment key={index.toString()}>
                    {circl}
                  </React.Fragment>
                ))}

                {loop.map((l1, index) => (
                  <React.Fragment key={index.toString()}>
                    {l1}
                  </React.Fragment>
                ))}

                {circle.map((circ, index) => (
                  <React.Fragment key={index.toString()}>
                    {circ}
                  </React.Fragment>
                ))}
              </Layer>
            </Stage>
          </div>
        </Container>
      </>
    );
  }
}

GameCanvas.propTypes = {
  currentGame: PropTypes.number,
  cellSize: PropTypes.number.isRequired,
  games: PropTypes.objectOf(PropTypes.object),
};

GameCanvas.defaultProps = {
  games: {},
  currentGame: null,
};

const mapStateToProps = (state) => ({
  games: {
    ...state.gameData.currentGames,
    ...state.gameData.waitingGames,
  },
  cellSize: state.appData.cellSize,
  currentGame: state.uiData.activeGameTab,
});

export default connect(
  mapStateToProps,
  null,
)(GameCanvas);
