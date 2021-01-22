import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';

import { Table } from 'react-bootstrap';

import TYPES from '../redux/types';

class Leaderboard extends Component {
  componentDidMount() {
    const { getLeaderboard, token } = this.props;
    getLeaderboard(token);
  }

  render() {
    const { matches } = this.props;
    const tableHead = (
      <thead className="thead-dark">
        <tr>
          <th>Player</th>
          <th>Color</th>
          <th>Captured</th>
        </tr>
      </thead>
    );

    return (
      <section className="leaderboard">
        {
          matches.map((match) => (
            <Table striped bordered hover size="sm" className="w-50">
              {tableHead}
              <tbody>
                {
                  match.map((data) => (
                    <tr>
                      <th className="font-weight-normal">{data.player}</th>
                      <th className="font-weight-normal">{data.color}</th>
                      <th className="font-weight-normal">{data.captured}</th>
                    </tr>
                  ))
                }
              </tbody>

            </Table>
          ))
        }
      </section>
    );
  }
}

Leaderboard.propTypes = {
  token: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  matches: PropTypes.array,
  getLeaderboard: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const data = {
    token: state.user.token,
    matches: state.leaders,
  };
  return data;
};

Leaderboard.defaultProps = {
  matches: [],
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
