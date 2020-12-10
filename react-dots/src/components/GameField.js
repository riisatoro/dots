import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  DRAW_DOT, CHECK_FIELD_FULL, HIDE_LEADERS, CALC_CAPTURED, STOP_GAME,
} from '../redux/types';

import '../../public/css/game_field.css';

class GameField extends Component {
  handleKeyPress() {
    this.click = true;
  }

  dotClicked(e) {
    const index = e.target.id;
    const yAxe = index % this.props.store.field_size;
    const xAxe = (index - yAxe) / this.props.store.field_size;

    this.props.onDotClicked([yAxe, xAxe], this.props.store.turn);
    this.props.checkFieldFull();
    if (this.props.store.game_end) {
      this.props.saveMatchResults(this.props.store.results);
    }
    this.props.calcCaptured();
  }

  gameEnd() {
    this.props.saveMatchResults(this.props.store.results);
  }

  render() {
    const item = this.props.store.field.map((i, pIndex) => (
      <div className="input__row" key={pIndex.toString()}>
        {i.map((j, qIndex) => (
          <div
            className={j}
            key={(pIndex * this.props.store.field_size + qIndex).toString()}
            id={pIndex * this.props.store.field_size + qIndex}
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
            {this.props.store.players[0].name}
            {' '}
            captured
            {' '}
            {this.props.store.players[0].captured}
          </p>
          <p className="">
            {this.props.store.players[1].name}
            {' '}
            captured
            {' '}
            {this.props.store.players[1].captured}
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

export default connect(
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

    hideLeaders: () => {
      dispatch({ type: HIDE_LEADERS });
    },

    calcCaptured: () => {
      dispatch({ type: CALC_CAPTURED });
    },
  }
  ),
)(GameField);
