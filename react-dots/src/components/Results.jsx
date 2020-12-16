/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

function Results(props) {
  const { captured } = props;
  let results = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(captured)) {
    results.push(`${key} captured ${value} points`);
  }

  return (
    <section className="results">
      <p className="header align-center h3 space-around">Results</p>
      <div>
        {results.map((item) => <p>{item}</p>)}
      </div>
    </section>
  );
}

Results.propTypes = {
  captured: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  const data = {
    captured: state.captured,
  };
  return data;
};

export default connect(mapStateToProps, null)(Results);

/*
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
  */
