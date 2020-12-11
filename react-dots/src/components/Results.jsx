import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

function Results(props) {
  const {
    isEqual, winner, looser, winScore, looseScore,
  } = props;

  let resultBoard = '';
  if (isEqual) {
    resultBoard = (
      <div className="container">
        <div className="space-around">
          <p className="align-center" key="win">No winners here!</p>
          <p className="align-center" key="players">
            Players:
            {winner}
            and
            {looser}
          </p>
          <p className="align-center" key="loose">
            Common score:
            {winScore}
          </p>
        </div>
      </div>
    );
  } else {
    resultBoard = (
      <div className="container">
        <div className="space-around">
          <p className="align-center" key="win">
            Winner:
            {winner}
          </p>
          <p className="align-center" key="loose">
            Score:
            {winScore}
          </p>
        </div>
        <div>
          <p className="align-center" key="win_score">
            Looser:
            {looser}
          </p>
          <p className="align-center" key="loose_score">
            Score:
            {looseScore}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="results">
      <p className="header align-center h3 space-around">Results</p>
      {resultBoard}
    </section>
  );
}

Results.propTypes = {
  isEqual: PropTypes.bool.isRequired,
  winner: PropTypes.string.isRequired,
  looser: PropTypes.string.isRequired,
  winScore: PropTypes.number.isRequired,
  looseScore: PropTypes.number.isRequired,
};

const mapStateToProps = (state) => {
  const data = {
    isEqual: state.results.equal,
    winner: state.results.winner,
    looser: state.results.looser,
    winScore: state.results.loose_score,
    looseScore: state.results.win_score,
  };
  return data;
};

export default connect(
  mapStateToProps,
  (state) => ({
    store: state,
  }),
)(Results);
