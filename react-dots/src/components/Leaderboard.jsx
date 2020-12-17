import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';

import { TYPES } from '../redux/types';

import '../../public/css/leaderboard.css';

class Leaderboard extends Component {
  componentDidMount() {
    const { getLeaderboard, token } = this.props;
    getLeaderboard(token);
  }

  render() {
    const { matches } = this.props;
    const results = matches.map((item, index) => (
      <div key={index.toString()}>
        <p>{`Players ${item[0].user.username} and ${item[1].user.username}`}</p>
        <p>{`${item[0].user.username} captured ${item[0].score} points`}</p>
        <p>{`${item[1].user.username} captured ${item[1].score} points`}</p>
        <hr />
      </div>
    ));

    return (
      <section className="leaderboard">
        <div>
          {results}
        </div>
      </section>
    );
  }
}

Leaderboard.propTypes = {
  token: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  matches: PropTypes.array.isRequired,
  getLeaderboard: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const data = {
    token: state.user.token,
    matches: state.leaders,
  };
  return data;
};

export default connect(
  mapStateToProps,
  (dispatch) => ({
    getLeaderboard: (token) => {
      const getLeaderboardRequest = () => {
        axios({
          method: 'GET',
          url: 'api/v2/match/',
          headers: { Authorization: `Token ${token}` },
        }).then((response) => { dispatch({ type: TYPES.RECEIVE_LEADERS, payload: response }); });
      };
      getLeaderboardRequest();
    },
  }),
)(Leaderboard);
