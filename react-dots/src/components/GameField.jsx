/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Stage, Layer } from 'react-konva';
import {
  Container, Row, Button, Modal, Spinner,
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
      setModal,
    } = this.props;
    this.socket = connectSocket(roomID);
    this.socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.TYPE === TYPES.PLAYER_JOIN) {
        this.socket.send(JSON.stringify({ fieldPoint: [0, 0], TYPE: TYPES.PLAYER_SET_DOT }));
      } else {
        receiveReply(data);
      }
    };
    this.socket.onerror = () => { };
    this.socket.onclose = () => { setModal(true); };
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
    let xPoint = 0;
    let yPoint = 0;
    if (e.evt.layerX !== undefined) {
      const xAxis = e.evt.layerX - cellSize / 2;
      const yAxis = e.evt.layerY - cellSize / 2;
      xPoint = Math.floor(xAxis / cellSize) + 1;
      yPoint = Math.floor(yAxis / cellSize) + 1;
    } else {
      xPoint = e.target.attrs.x / cellSize + 1;
      yPoint = e.target.attrs.y / cellSize + 1;
    }

    if (!(xPoint === undefined) || !(yPoint === undefined)) {
      this.socket.send(
        JSON.stringify({ fieldPoint: [xPoint, yPoint], TYPE: TYPES.PLAYER_SET_DOT }),
      );
    }
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
      gameResults,
      openModal,
    } = this.props;

    const canvasGrid = getCanvasGrid(fieldSize, cellSize);
    const circle = getCircleCoords(field, cellSize, playerColors);
    const emptyCircle = createEmptyCircle(field, cellSize);
    const loop = createLoopFigure(field, loops, cellSize, playerColors);

    const colorKey = playerColors[turn];
    const userColorKey = playerColors[userID];

    let textTurn = '';
    if (Object.keys(playerColors).length > 1 && colorKey === userColorKey) {
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
          <a href="/leaderboards">
            <Button onClick={setModal}>Close</Button>
          </a>
        </Modal.Footer>
      </Modal>
    );

    return (
      <>
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
          <div className="m-auto" style={{ width: fieldSize * cellSize + cellSize }}>
            <Stage
              width={fieldSize * cellSize + cellSize}
              height={fieldSize * cellSize + cellSize}
              onClick={this.gridClicked.bind(this)}
              onTap={this.gridClicked.bind(this)}
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
            <Button variant="danger" onClick={openModal}>Give up</Button>
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
  openModal: PropTypes.func.isRequired,
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

    openModal: () => {
      dispatch({ type: TYPES.SET_MODAL, payload: false });
    },

    closeGame: () => {
      dispatch({ type: TYPES.CLOSE_RESULTS, payload: {} });
    },
  }
  ),
)(GameField);
