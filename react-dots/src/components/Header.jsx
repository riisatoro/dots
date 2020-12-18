import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
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
        <div className="col-sm-8 col-md-3 new-ga me" key="new-game">
          <a href="/new_game">New game</a>
        </div>,
        <div className="col-sm-8 col-md-3" key="leaders">
          <a href="/leaderboards">Leaderboards</a>
        </div>,
        <div className="col-sm-8 col-md-3" key="logout">
          <button type="button" onClick={this.logoutUser.bind(this)}>Logout</button>
        </div>,
      ];
    } else {
      navigation = [
        <div className="col-6 align-center" key="login">
          <a href="/auth">Login or Register</a>
        </div>,
      ];
    }

    return (
      <section className="header">
        <div className="container-fluid">

          <div className="row">
            <h1 className="container align-center">Dots game</h1>
          </div>

          <div className="row justify-content-center">
            { !isAuth && <Redirect to="/logout" /> }
            {navigation}
          </div>

        </div>
      </section>
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
