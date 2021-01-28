import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import TYPES from '../redux/types';

// eslint-disable-next-line react/prefer-stateless-function
class Footer extends Component {
  logoutUser() {
    const { logoutUser, token } = this.props;
    logoutUser(token);
  }

  render() {
    const { isAuth } = this.props;
    let navigation = (
      <ul>
        <a href="/register" className="d-block">Register</a>
        <a href="/login" className="d-block">Login</a>
      </ul>
    );

    if (isAuth) {
      navigation = (
        <ul>
          <a href="/new_game" className="d-block">New game</a>
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
  logoutUser: PropTypes.func.isRequired,
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
)(Footer);
