import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Navbar, Nav, Button,
} from 'react-bootstrap';
import TYPES from '../redux/types';

class Header extends Component {
  constructor(props) {
    super(props);
    this.logoutUser = this.logoutUser.bind(this);
  }

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
    const newGameClass = path === '/game' ? 'active' : '';
    const leaderboardsClass = path === '/leaderboards' ? 'active' : '';

    let navigation = [];
    if (isAuth) {
      navigation = (
        <>
          <Nav className="ml-auto">
            <Nav.Link href="/main" to="/main" className={homeClass}>Home</Nav.Link>
            <Nav.Link href="/game" className={newGameClass}>New game</Nav.Link>
            <Nav.Link href="/leaderboards" className={leaderboardsClass}>Leaderboards</Nav.Link>
            <Button variant="outline-info" onClick={this.logoutUser}>Logout</Button>
          </Nav>
        </>
      );
    } else {
      navigation = (
        <>
          <Nav className="ml-auto">
            <Button variant="primary" href="/login" className="m-2">Log in</Button>
            <Button variant="outline-info" href="/register" className="m-2">Register</Button>
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
  token: PropTypes.string.isRequired,
  isAuth: PropTypes.bool.isRequired,

  logoutUser: PropTypes.func.isRequired,
  getLeaderboard: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  token: state.auth.token,
  isAuth: state.auth.isAuthorized,
});

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
          dispatch({ type: TYPES.LOGOUT_REPLY, payload: null });
        }).catch(() => {
          dispatch({ type: TYPES.LOGOUT_ERROR, payload: null });
        });
      };
      asyncLogout();
    },
  }),
)(Header);
