/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import TYPES from '../redux/types';

function Results(props) {
  const { captured, field, closeResults } = props;
  closeResults();

  const gameField = field.map((i, pIndex) => (
    <div className="input__row" key={pIndex.toString()}>
      {i.map((j, qIndex) => (
        <div
          className={j}
          key={(qIndex + pIndex * qIndex).toString()}
        />
      ))}
    </div>
  ));
  let results = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(captured)) {
    results.push(`${key} captured ${value} points`);
  }

  return (
    <section className="results">
      <p className="header align-center h3 space-around">Results</p>

      <div>
        {gameField}
      </div>

      <div>
        {results.map((item) => <p className="align-center">{item}</p>)}
      </div>
    </section>
  );
}

Results.propTypes = {
  captured: PropTypes.object.isRequired,
  field: PropTypes.array.isRequired,
  closeResults: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const data = {
    captured: state.captured,
    field: state.field,
  };
  return data;
};

export default connect(
  mapStateToProps, 
  (dispatch) => ({
    closeResults: () => {
      dispatch({ type: TYPES.CLOSE_RESULTS, payload: {} });
    }
  }))(Results);
