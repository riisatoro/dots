import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import axios from 'axios';
import PropTypes from 'prop-types';
import TYPES from '../redux/types';

class Footer extends Component {
  constructor(props) {
    super(props);
    this.logoutUser = this.logoutUser.bind(this);
  }

  logoutUser() {
    const { logout, token } = this.props;
    logout(token);
  }

  render() {
    const { isAuthorized } = this.props;
    let navigation = (
      <ul>
        <a href="/register" className="d-block">Register</a>
        <a href="/login" className="d-block">Login</a>
      </ul>
    );
    if (isAuthorized) {
      navigation = (
        <ul>
          <a href="/game" className="d-block">New game</a>
          <a href="/leaderboards" className="d-block">Leaderboards</a>
          <a href="/logout" className="d-block" onClick={this.logoutUser}>Logout</a>
        </ul>
      );
    }

    return (
      <Container className="my-2 pt-2 pb-1 border-top">
        <Row>
          <Col xs={12} md={6}>
            <h6>Navigation</h6>
            {navigation}
          </Col>
          <Col xs={12} md={6}>
            <h4 className="text-center mt-3">Thanks for playing!</h4>
          </Col>
        </Row>
      </Container>
    );
  }
}

Footer.propTypes = {
  token: PropTypes.string.isRequired,
  isAuthorized: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const data = {
    token: state.auth.token,
    isAuthorized: state.auth.isAuthorized,
  };
  return data;
};

export default connect(
  mapStateToProps,
  (dispatch) => ({
    logout: (token) => {
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
)(Footer);
