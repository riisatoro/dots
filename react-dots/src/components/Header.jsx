/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Navbar, Nav, Button,
} from 'react-bootstrap';
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
    const path = window.location.pathname;
    const homeClass = path === '/main' ? 'active' : '';
    const newGameClass = path === '/new_game' ? 'active' : '';
    const leaderboardsClass = path === '/leaderboards' ? 'active' : '';

    let navigation = [];
    if (isAuth) {
      navigation = (
        <>
          <Nav className="ml-auto">
            <Nav.Link href="/main" to="/main" className={homeClass}>Home</Nav.Link>
            <Nav.Link href="/new_game" className={newGameClass}>New game</Nav.Link>
            <Nav.Link href="/leaderboards" className={leaderboardsClass}>Leaderboards</Nav.Link>
            <Button variant="outline-info" onClick={this.logoutUser.bind(this)}>Logout</Button>
          </Nav>
        </>
      );
    } else {
      navigation = (
        <>
          <Nav className="ml-auto">
            <Button variant="primary" href="/login" className="mr-2">Log in</Button>
            <Button variant="outline-info" href="/register" className="mr-2">Register</Button>
          </Nav>
        </>
      );
    }

    return (
      <>

        <Navbar bg="light" expand="lg" className="mb-5">
          <Navbar.Brand href="/main">Dots game</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            {navigation}
          </Navbar.Collapse>
        </Navbar>
      </>
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
