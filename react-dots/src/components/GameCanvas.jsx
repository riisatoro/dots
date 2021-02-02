import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Stage, Layer } from 'react-konva';
import {
  Container, Row, Button,
} from 'react-bootstrap';
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
    const { cellSize, currentGame } = this.props;
    const xPoint = e.target.attrs.x / cellSize + 1;
    const yPoint = e.target.attrs.y / cellSize + 1;

    const hasOwner = e.target.attrs.fillRadialGradientColorStops;

    if (!Number.isNaN(xPoint) && !Number.isNaN(yPoint) && hasOwner === undefined) {
      socket.send(
        JSON.stringify({
          type: TYPES.PLAYER_SET_DOT,
          point: [xPoint, yPoint],
          currentGame,
        }),
      );
    }
  }

  render() {
    const {
      games,
      cellSize,
      activeGameId,
    } = this.props;

    const game = games[activeGameId];
    let field = [[]];
    let fieldSize = 0;
    let colors = {};

    let canvasGrid = [];
    let circle = [];
    let emptyCircle = [];
    let loop = [];

    if (game !== undefined) {
      console.log(game);
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
  currentGame: PropTypes.number.isRequired,
  cellSize: PropTypes.number.isRequired,
  activeGameId: PropTypes.number.isRequired,
  games: PropTypes.objectOf(PropTypes.object),
};

GameCanvas.defaultProps = {
  games: {},
};

const mapStateToProps = (state) => ({
  activeGameId: state.uiData.activeGameTab,
  games: {
    ...state.gameData.currentGames,
    ...state.gameData.waitingGames,
  },
  cellSize: state.appData.cellSize,
  currentGame: state.uiData.activeGameTab,
});

export default connect(
  mapStateToProps,
  (dispatch) => (
    {

    }
  ),
)(GameCanvas);

/*

    let textTurn = '';
    if (turn === userID) {
      textTurn = 'Now is your turn';
    }
    const textScore = [];
    Object.keys(score).forEach((key) => {
      textScore.push([playerColors[key], `captured ${score[key]} points`]);
    });

    const textScoreResult = [];
    Object.keys(score).forEach((key) => {
      textScoreResult.push([playerColors[key], `${score[key]} points`]);
    });
    const playerConnected = Object.keys(playerColors).length > 1;

    const modalBlock = (
      <Modal
        show={modal}
        onHide={closeGame}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Game over
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4 className="text-center">Players captured</h4>
          {textScoreResult.map((item, index) => (
            <div className="container" key={index.toString()}>
              <Row className="align-middle mb-2">
                <div className="game-color-block m-auto" style={{ backgroundColor: item[0] }} />
                <p className="d-block m-auto">{item[1]}</p>
              </Row>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <a href="/leaderboards" onClick={setModal}>
            <Button>Close</Button>
          </a>
        </Modal.Footer>
      </Modal>
    );

    {modalBlock}
        <Container className="text-center">
          <p>Your points color:</p>
          <div className="game-color-block" style={{ backgroundColor: playerColor }} />
          <p className="text-center" style={{ height: '20px' }}>{textTurn}</p>
          { !playerConnected
           && (
           <React.Fragment key="waiting">
             <Spinner animation="border" variant="primary" />
             <p className="text-center">Waiting for another player</p>
           </React.Fragment>
           )}
        </Container>

<Container>
          <Row>
            {textScore.map((item, index) => (
              <div className="col-xs-12 col-md-6 col-lg-4 text-center" key={index.toString()}>
                <div className="game-color-block" style={{ backgroundColor: item[0] }} />
                <p>{item[1]}</p>
              </div>
            ))}
          </Row>
          <div className="text-center mb-5">
            <Button variant="danger" onClick={this.onPlayerGiveUp}>Give up</Button>
          </div>
        </Container>

constructor(props) {
    super(props);
    this.gridClicked = this.gridClicked.bind(this);
    this.onPlayerGiveUp = this.onPlayerGiveUp.bind(this);
  }

  componentDidMount() {
    const {
      roomID,
      receiveSocketReply,
      setModal,
    } = this.props;

    this.socket = connectSocket(roomID);
    this.socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      switch (data.TYPE) {
        case TYPES.PLAYER_JOIN: {
          this.socket.send(JSON.stringify({ fieldPoint: [0, 0], TYPE: TYPES.PLAYER_SET_DOT }));
          break;
        }
        case TYPES.PLAYER_SET_DOT: {
          receiveSocketReply(data);
          break;
        }
        case TYPES.SOCKET_DISCONNECT: {
          this.socket.close();
          break;
        }
        default: break;
      }
    };
    this.socket.onerror = () => { setModal(false); };
    this.socket.onclose = () => { setModal(false); };
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
    const xPoint = e.target.attrs.x / cellSize + 1;
    const yPoint = e.target.attrs.y / cellSize + 1;

    const hasOwner = e.target.attrs.fillRadialGradientColorStops;

    if (xPoint !== undefined && yPoint !== undefined && hasOwner === undefined) {
      this.socket.send(
        JSON.stringify({ fieldPoint: [xPoint, yPoint], TYPE: TYPES.PLAYER_SET_DOT }),
      );
    }
  }

*/
