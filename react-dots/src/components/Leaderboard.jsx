import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';

import { Container, Row, Table } from 'react-bootstrap';

import TYPES from '../redux/types';

class Leaderboard extends Component {
  componentDidMount() {
    const { getLeaderboard, token } = this.props;
    getLeaderboard(token);
  }

  render() {
    const { matches } = this.props;
    const humanColos = {
      R: 'Red',
      G: 'Green',
      B: 'Blue',
      O: 'Orange',
      Y: 'Yellow',
    };
    const tableHead = (
      <thead className="thead-dark">
          <th className="xs">Game</th>
          <th>Player</th>
          <th>Color</th>
          <th>Captured</th>
      </thead>
    );

    return (
      <section className="leaderboard">
        <Container>
          <Row className="justify-content-md-center">
            <Table hover size="sm" className="text-center">
              {tableHead}
              {matches.map((match) => (

                <tbody>
                  <tr>
                    <td className="table-gray">{matches.findIndex((m) => m === match) + 1}</td>
                  </tr>
                  {
                      match.map((data) => (
                        <tr>
                          <td />
                          <td>{data.player}</td>
                          <td>{humanColos[data.color]}</td>
                          <td>{data.captured}</td>
                        </tr>
                      ))
                    }
                </tbody>
              ))}
            </Table>
          </Row>
        </Container>
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
