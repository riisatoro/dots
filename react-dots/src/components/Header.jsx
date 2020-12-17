import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';

import {
  SHOW_AUTH_FORM,
  SHOW_SETTINGS,
  HIDE_RESULTS,
  TYPES,
} from '../redux/types';

class Header extends Component {
  onOpenLeaders() {
    const { getLeaderboard, token } = this.props;
    getLeaderboard(token);
  }

  openAuthForm() {
    const { onClickOpenAuth, token } = this.props;
    onClickOpenAuth(token);
  }

  logoutUser() {
    const { logoutUser } = this.props;
    logoutUser();
  }

  openSettings() {
    const { hideResults, openSettings } = this.props;
    hideResults();
    openSettings();
  }

  sendLogoutRequest() {
    const { logoutUser } = this.props;
    this.logoutUser();
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
          <a href="/leaderboards" >Leaderboards</a>
        </div>,
        <div className="col-sm-8 col-md-3" key="logout">
          <a href="/logout" onClick={this.sendLogoutRequest.bind(this)}>Logout</a>
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
            {navigation}
          </div>

        </div>
      </section>
    );
  }
}

Header.propTypes = {
  onClickOpenAuth: PropTypes.func.isRequired,
  openSettings: PropTypes.func.isRequired,
  hideResults: PropTypes.func.isRequired,
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
    onClickOpenAuth: () => {
      dispatch({ type: SHOW_AUTH_FORM, payload: true });
    },

    openSettings: () => {
      dispatch({ type: SHOW_SETTINGS, payload: {} });
    },

    hideResults: () => {
      dispatch({ type: HIDE_RESULTS, payload: {} });
    },

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
    logoutUser: () => {
      const asyncLogout = () => {
        axios({
          method: 'get',
          url: '/api/auth/logout/',
        }).then(() => {
          dispatch({ type: TYPES.SEND_LOGOUT_REQUEST, payload: {} });
        });
      };
      dispatch({ type: TYPES.SEND_LOGOUT_REQUEST, payload: {} });
    },
  }),
)(Header);
