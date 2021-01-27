/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Stage, Layer } from 'react-konva';
import {
  Container, Row, Button, Modal,
} from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import connectSocket from '../socket/socket';
import TYPES from '../redux/types';
import {
  getCanvasGrid, getCircleCoords, createLoopFigure, createEmptyCircle,
} from '../actions/gameFieldDrawable';
import '../../public/css/default.css';

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

  closeModal() {
    const { setModal } = this.props;
    setModal(false);
  }

  render() {
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
      gameStarted,
      gameResults
    } = this.props;

    const canvasGrid = getCanvasGrid(fieldSize, cellSize);
    const circle = getCircleCoords(field, cellSize, playerColors);
    const emptyCircle = createEmptyCircle(field, cellSize);
    const loop = createLoopFigure(field, loops, cellSize, playerColors);

    const colorKey = playerColors[turn];
    const userColorKey = playerColors[userID];

    let textTurn = '';
    if (colorKey === userColorKey) {
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
          <h4 className="text-center">Check player score</h4>
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
          <Button onClick={setModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    );

    return (
      <>
        { !gameStarted && !gameResults && <Redirect to="/leaderboards" />}
        {modalBlock}
        <Container className="text-center">
          <p>Your points color:</p>
          <div className="game-color-block" style={{ backgroundColor: playerColor }} />
          <p className="text-center" style={{ height: '20px' }}>{textTurn}</p>
        </Container>

        <Container>
          <div className="gameCanvas m-auto" style={{ width: fieldSize * cellSize + cellSize * 2 }}>
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
            <a href="/game_result">
              <Button variant="danger" onClick={this.onPlayerGiveUp.bind(this)}>Give up</Button>
            </a>
          </div>
        </Container>
      </>
    );
  }
}

GameField.propTypes = {
  setModal: PropTypes.func.isRequired,
  userID: PropTypes.number.isRequired,
  roomID: PropTypes.number.isRequired,
  field: PropTypes.array.isRequired,
  fieldSize: PropTypes.number.isRequired,
  turn: PropTypes.number,
  loops: PropTypes.array,
  cellSize: PropTypes.number.isRequired,
  playerColors: PropTypes.object.isRequired,
  playerColor: PropTypes.string.isRequired,
  receiveReply: PropTypes.func.isRequired,
  score: PropTypes.object.isRequired,
  modal: PropTypes.bool,
  closeGame: PropTypes.func.isRequired,
  gameStarted: PropTypes.bool.isRequired,
  gameResults: PropTypes.bool.isRequired,
};

GameField.defaultProps = {
  turn: -1,
  loops: [],
  modal: false,
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
    modal: state.modal,
    gameStarted: state.gameStarted,
    gameResults: state.gameResults,
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
    setModal: (value) => {
      dispatch({ type: TYPES.SET_MODAL, payload: value });
    },

    closeGame: () => {
      dispatch({type: TYPES.CLOSE_RESULTS, payload: {} });
    },
  }
  ),
)(GameField);
