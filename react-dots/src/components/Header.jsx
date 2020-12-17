import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';

import {
  SHOW_AUTH_FORM,
  SEND_LOGOUT_REQUEST,
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

  render() {
    const { isAuth } = this.props;

    let navigation = [];
    if (isAuth) {
      navigation = [
        <div className="col-sm-8 col-md-3 new-ga me" key="new-game">
          <button type="button" key="0" className="container header-btn" onClick={this.openSettings.bind(this)}>New game</button>
        </div>,
        <div className="col-sm-8 col-md-3" key="leaders">
          <button type="button" key="1" className="container header-btn" onClick={this.onOpenLeaders.bind(this)}>Leaderboard</button>
        </div>,
        <div className="col-sm-8 col-md-3" key="logout">
          <button type="button" key="2" className="container header-btn" onClick={this.logoutUser.bind(this)}>Logout</button>
        </div>,
      ];
    } else {
      navigation = [
        <div className="col-6 align-center" key="login">
          <button type="button" key="0" className="header-btn" onClick={this.openAuthForm()}>Login or Register</button>
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
  logoutUser: PropTypes.func.isRequired,
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

    logoutUser: () => {
      const asyncLogout = () => {
        axios({
          method: 'get',
          url: '/api/auth/logout/',
        }).then(() => {
          dispatch({ type: SEND_LOGOUT_REQUEST, payload: {} });
        });

        return { type: '', payload: {} };
      };
      dispatch(asyncLogout());
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
  }),
)(Header);
