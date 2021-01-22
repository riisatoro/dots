/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Container, Row, Col } from 'react-bootstrap';
import TYPES from '../redux/types';

class Header extends Component {
  onOpenLeaders() {
    const { getLeaderboard, token } = this.props;
    getLeaderboard(token);
  }

  logoutUser() {
    const { logoutUser, token } = this.props;
    logoutUser(token);
  }

  render() {
    const { isAuth } = this.props;

    let navigation = [];
    if (isAuth) {
      navigation = [
        <div className="m-auto" key="new-game">
          <a href="/new_game">New game</a>
        </div>,
        <div className="m-auto" key="leaders">
          <a href="/leaderboards">Leaderboards</a>
        </div>,
        <div className="m-auto" key="logout">
          <a href="#" onClick={this.logoutUser.bind(this)}>Logout</a>
        </div>,
      ];
    } else {
      navigation = [
        <div className="m-auto border" key="register">
          <a href="/auth/register">Register</a>
        </div>,
        <div className="m-auto" key="login">
          <a href="/auth">Login</a>
        </div>,
      ];
    }

    return (
      <Container className="border-bottom mb-5">
        { !isAuth && <Redirect to="/logout" /> }
        <Row>
          <Col xs={7} className="p-3">
            <a href="/main" className="text-dark"><h1>Dots game</h1></a>
          </Col>
          <Col className="d-flex justify-content-center align-items-center m-auto">
            {navigation}
          </Col>
        </Row>
      </Container>
    );
  }
}

Header.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  getLeaderboard: PropTypes.func.isRequired,
  token: PropTypes.string.isRequired,
  isAuth: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => {
  const data = {
    token: state.user.token,
    isAuth: state.user.auth,
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
    logoutUser: (token) => {
      const asyncLogout = () => {
        axios({
          method: 'get',
          url: '/api/auth/logout/',
          headers: { Authorization: `Token ${token}` },
        }).then(() => {
          dispatch({ type: TYPES.SEND_LOGOUT_REQUEST, payload: {} });
        });
      };
      asyncLogout();
    },
  }),
)(Header);
