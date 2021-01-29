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

import '../../public/css/default.css';

class GameField extends Component {
  render() {
    const {
      games,
      cellSize,
      activeGameId,
    } = this.props;

    const game = games[activeGameId];
    let field = [[]];
    let fieldSize = 0;

    let canvasGrid = [];
    let circle = [];
    let emptyCircle = [];
    let loop = [];

    if (game !== undefined) {
      field = game.field;
      fieldSize = game.size;

      canvasGrid = getCanvasGrid(fieldSize, cellSize);
      // circle = getCircleCoords(field, cellSize, playerColors);
      emptyCircle = createEmptyCircle(field, cellSize);
      // loop = createLoopFigure(field, loops, cellSize, playerColors);
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

GameField.propTypes = {
  games: PropTypes.objectOf(PropTypes.object),
  cellSize: PropTypes.number.isRequired,
  activeGameId: PropTypes.number.isRequired,
};

GameField.defaultProps = {
  games: {},
};

const mapStateToProps = (state) => ({
  activeGameId: state.uiData.activeGameTab,
  games: state.gameData.userGames,
  cellSize: state.appData.cellSize,
});

export default connect(
  mapStateToProps,
  (dispatch) => (
    {

    }
  ),
)(GameField);

/*
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

    const {
      field,
      fieldSize,
      turn,
      loops,
      cellSize,
      playerColors,
      userID,
      score,
      playerColor,
      modal,
      setModal,
      closeGame,
    } = this.props;

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

GameField.propTypes = {
  modal: PropTypes.bool,
  turn: PropTypes.number,
  loops: PropTypes.arrayOf(PropTypes.array),

  userID: PropTypes.number.isRequired,
  roomID: PropTypes.number.isRequired,
  cellSize: PropTypes.number.isRequired,
  fieldSize: PropTypes.number.isRequired,

  playerColor: PropTypes.string.isRequired,
  field: PropTypes.arrayOf(PropTypes.array).isRequired,

  score: PropTypes.objectOf(PropTypes.number).isRequired,
  playerColors: PropTypes.objectOf(PropTypes.string).isRequired,

  setModal: PropTypes.func.isRequired,
  closeGame: PropTypes.func.isRequired,
  receiveSocketReply: PropTypes.func.isRequired,
};

GameField.defaultProps = {
  modal: false,
  turn: -1,
  loops: [],
};

const mapStateToProps = (state) => {
  const data = {
    loops: state.loops,
    modal: state.modal,
    turn: state.turn,

    userID: state.user.userID,
    roomID: state.socket.roomId,
    cellSize: state.cellSize,
    fieldSize: state.socket.fieldSize,

    playerColor: state.playerColor,
    field: state.field,

    gameEnd: state.gameEnd,
    gameResults: state.gameResults,

    score: state.score,
    playerColors: state.playerColors,
  };
  return data;
};
*/
