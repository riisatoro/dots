import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { TYPES } from '../redux/types';

import '../../public/css/game_field.css';

class GameField extends Component {
  constructor(props) {
    super(props);
    const { roomId } = this.props;
    this.socket = new WebSocket(`ws://127.0.0.1:8000/ws/room/${roomId}/`);
  }

  handleKeyPress() {
    this.click = true;
  }

  dotClicked(e) {
    const { fieldSize, turn, onDotClicked } = this.props;
    const index = e.target.id;
    const yAxe = index % fieldSize;
    const xAxe = (index - yAxe) / fieldSize;

    onDotClicked([yAxe, xAxe], turn);
  }

  gameEnd() {
    const { saveMatchResults, results } = this.props;
    saveMatchResults(results);
  }

  render() {
    const { field, fieldSize, players } = this.props;

    const item = field.map((i, pIndex) => (
      <div className="input__row" key={pIndex.toString()}>
        {i.map((j, qIndex) => (
          <div
            className={j}
            key={(pIndex * fieldSize + qIndex).toString()}
            id={pIndex * fieldSize + qIndex}
            onKeyPress={this.handleKeyPress}
            onClick={this.dotClicked.bind(this)}
            role="button"
            aria-label=" "
            tabIndex={0}
          />
        ))}
      </div>
    ));

    return (
      <section className="field">
        <div className="align-center">
          <p className="">
            {players[0].name}
            captured
            {players[0].captured}
          </p>
          <p className="">
            {players[1].name}
            captured
            {players[1].captured}
          </p>
        </div>

        <div className="field__wrapper">{item}</div>

        <div className="align-center">
          <button type="button" className="btn btn-danger space-around" onClick={this.gameEnd.bind(this)}>End game</button>
        </div>

      </section>
    );
  }
}

GameField.propTypes = {
  roomId: PropTypes.string.isRequired,
  field: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  fieldSize: PropTypes.number.isRequired,
  turn: PropTypes.bool.isRequired,

  onDotClicked: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const data = {
    roomId: state.socket.roomId,
    field: state.socket.field,
    fieldSize: state.socket.field_size,
    turn: state.socket.turn,
  };
  return data;
};

export default connect(
  mapStateToProps,
  (dispatch) => ({
    onDotClicked: (position) => {
      dispatch({ type: TYPES.DRAW_DOT, payload: position });
    },
  }
  ),
)(GameField);
