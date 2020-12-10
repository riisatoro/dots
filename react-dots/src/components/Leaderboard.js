import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';

import { RECEIVE_LEADERS } from '../redux/types';

import '../../public/css/leaderboard.css';

class Leaderboard extends Component {
  componentDidMount() {
    const { getLeaderboard, token } = this.props;
    getLeaderboard(token);
  }

  render() {
    const { data } = this.props;

    return (
      <section className="leaderboard">
        <div className="grid__wrapper">
          {data.map((item, index) => {
            if (item.equal) {
              return (
                <div key={index.toString()} className="grid__col">
                  <p>No winners here!</p>
                  <p>
                    {item.winner}
                    and
                    {item.looser}
                  </p>
                  <p>
                    Score:
                    {item.win_score}
                  </p>
                </div>
              );
            }
            return (
              <div key={index.toString()} className="grid__col">
                <p>
                  Winner:
                  {item.winner}
                </p>
                <p>
                  Looser:
                  {item.looser}
                </p>
                <p>
                  Win score:
                  {item.win_score}
                </p>
                <p>
                  Loose score:
                  {item.loose_score}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    );
  }
}

Leaderboard.propTypes = {
  token: PropTypes.string.isRequired,
  data: PropTypes.objectOf(PropTypes.object),
  getLeaderboard: PropTypes.func.isRequired,
};

Leaderboard.defaultProps = {
  data: [],
};

const mapStateToProps = (state) => {
  const data = {
    token: state.user.token,
  };
  return data;
};

export default connect(
  mapStateToProps,
  (state) => ({
    store: state,
  }),
  (dispatch) => ({
    getLeaderboard: (token) => {
      const getLeaderboardRequest = () => {
        axios({
          method: 'GET',
          url: 'api/match/',
          headers: { Authorization: `Token ${token}` },
        }).then((response) => { dispatch({ type: RECEIVE_LEADERS, payload: response }); });
      };
      getLeaderboardRequest();
    },
  }),
)(Leaderboard);
