import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';

import {
  Container, Row, Table, Pagination,
} from 'react-bootstrap';

import TYPES from '../redux/types';

class Leaderboard extends Component {
  componentDidMount() {
    const { getLeaderboard, token } = this.props;
    getLeaderboard(token);
  }

  render() {
    const { matches, activeLeadersPage, setActivePagination } = this.props;
    const tableHead = (
      <thead className="thead-dark">
        <tr>
          <th className="xs">Game</th>
          <th>Player</th>
          <th>Color</th>
          <th>Captured</th>
        </tr>
      </thead>
    );

    const matchesList = [];
    const paginationItems = [];

    for (let i = 0; i < matches.length; i += 5) {
      paginationItems.push(
        <Pagination.Item
          key={i / 5}
          id={i / 5}
          active={i / 5 === activeLeadersPage - 1}
          onClick={setActivePagination}
        >
          {(i / 5) + 1}
        </Pagination.Item>,
      );
      matchesList.push(matches.slice(i, i + 5));
    }
    const paginationMatches = matchesList[activeLeadersPage - 1];

    return (
      <section className="leaderboard">
        <Container>
          <Row className="justify-content-md-center">
            <Table striped bordered hover size="sm" className="text-center">
              {tableHead}
              <tbody>
                {paginationMatches.map((match, gameIndex) => (
                  <>
                    {
                      match.map((data, index, array) => (
                        <tr key={data.player}>
                          {
                            index === 0 && (
                            <td rowSpan={array.length} className="align-middle">
                              {(activeLeadersPage - 1) * 5 + gameIndex + 1}
                            </td>
                            )
                          }

                          <td>{data.player}</td>
                          <td>
                            <div className="leaderboard-color-block m-auto" style={{ backgroundColor: data.color }} />
                          </td>
                          <td>{data.captured}</td>
                        </tr>
                      ))
                    }
                  </>
                ))}
              </tbody>
            </Table>
          </Row>
          <Pagination className="text-center">{paginationItems}</Pagination>
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
  activeLeadersPage: PropTypes.number.isRequired,
  setActivePagination: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const data = {
    token: state.user.token,
    matches: state.leaders,
    activeLeadersPage: state.activeLeadersPage,
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
    setActivePagination: (event) => {
      dispatch({
        type: TYPES.SET_ACTIVE_PAGINATION,
        payload: { num: parseInt(event.target.id, 10) + 1 },
      });
    },
  }),
)(Leaderboard);
