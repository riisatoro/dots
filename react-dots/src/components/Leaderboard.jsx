import React, { Component } from 'react';
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

    const splitBy = 8;
    const matchesList = [];
    const paginationItems = [];

    for (let i = 0; i < matches.length; i += splitBy) {
      paginationItems.push(
        <Pagination.Item
          key={i / splitBy}
          id={i / splitBy}
          active={(i / splitBy) === (activeLeadersPage - 1)}
          onClick={setActivePagination}
        >
          {(i / splitBy) + 1}
        </Pagination.Item>,
      );
      matchesList.push(matches.slice(i, i + splitBy));
    }
    const paginationMatches = matchesList[activeLeadersPage - 1];

    return (
      <section className="leaderboard">
        <Container>
          <Row className="justify-content-md-center">
            { paginationMatches === undefined && <h2>You don&apos;t have any game results.</h2> }
            <Table striped bordered hover size="sm" className="text-center">
              { paginationMatches !== undefined && tableHead}
              <tbody>
                {
                (paginationMatches !== undefined && paginationMatches.length > 0)
                && paginationMatches.map((match, gameIndex) => (
                  <React.Fragment key={gameIndex.toString()}>
                    {
                    match.map((data, index, array) => (
                      <tr key={data.player}>
                        {
                          index === 0 && (
                          <td rowSpan={array.length} className="align-middle">
                            {(activeLeadersPage - 1) * splitBy + gameIndex + 1}
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
                  </React.Fragment>
                ))
                }
              </tbody>
            </Table>
          </Row>
          { paginationItems !== []
          && (
          <Row className="mb-5">
            <Pagination className="m-auto">{paginationItems}</Pagination>
          </Row>
          )}
        </Container>
      </section>
    );
  }
}

Leaderboard.propTypes = {
  token: PropTypes.string.isRequired,
  matches: PropTypes.arrayOf(PropTypes.array),
  activeLeadersPage: PropTypes.number.isRequired,

  getLeaderboard: PropTypes.func.isRequired,
  setActivePagination: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const data = {
    token: state.auth.token,
    matches: state.domainData.matches,
    activeLeadersPage: state.uiData.matchPagination,
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
        }).then((response) => {
          dispatch({ type: TYPES.UPDATE_LEADERS, payload: response.data });
        }).catch(() => {
          dispatch({ type: TYPES.UPDATE_LEADERS_ERROR, payload: null });
        });
      };
      getLeaderboardRequest();
    },
    setActivePagination: (event) => {
      dispatch({
        type: TYPES.SWITCH_PAGINATION,
        payload: { num: parseInt(event.target.id, 10) + 1 },
      });
    },
  }),
)(Leaderboard);
