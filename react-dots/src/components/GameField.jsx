import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  DRAW_DOT, CHECK_FIELD_FULL, CALC_CAPTURED, STOP_GAME,
} from '../redux/types';

import '../../public/css/game_field.css';

class GameField extends Component {
  handleKeyPress() {
    this.click = true;
  }

  dotClicked(e) {
    const {
      onDotClicked,
      checkFieldFull,
      saveMatchResults,
      calcCaptured,
      fieldSize,
      turn,
      gameEnd,
      results,
    } = this.props;
    const index = e.target.id;
    const yAxe = index % fieldSize;
    const xAxe = (index - yAxe) / fieldSize;

    onDotClicked([yAxe, xAxe], turn);
    checkFieldFull();
    if (gameEnd) {
      saveMatchResults(results);
    }
    calcCaptured();
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
  onDotClicked: PropTypes.func.isRequired,
  checkFieldFull: PropTypes.func.isRequired,
  saveMatchResults: PropTypes.func.isRequired,
  calcCaptured: PropTypes.func.isRequired,
  fieldSize: PropTypes.number.isRequired,
  turn: PropTypes.bool.isRequired,
  gameEnd: PropTypes.bool.isRequired,
  players: PropTypes.objectOf(PropTypes.object).isRequired,
  field: PropTypes.objectOf(PropTypes.object).isRequired,
  results: PropTypes.objectOf(PropTypes.object).isRequired,
};

const mapStateToProps = (state) => {
  const data = {
    fieldSize: state.field_size,
    turn: state.turn,
    gameEnd: state.game_end,
    players: state.players,
    field: state.field,
    results: state.results,
  };
  return data;
};

export default connect(
  mapStateToProps,
  (state) => ({
    store: state,
  }),
  (dispatch) => ({
    onDotClicked: (position) => {
      dispatch({ type: DRAW_DOT, payload: position });
    },

    checkFieldFull: () => {
      dispatch({ type: CHECK_FIELD_FULL });
    },

    saveMatchResults: () => {
      dispatch({ type: STOP_GAME });
    },

    calcCaptured: () => {
      dispatch({ type: CALC_CAPTURED });
    },
  }
  ),
)(GameField);
