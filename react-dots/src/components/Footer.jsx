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
    return (
      <Container className="pt-4 my-md-3 pt-md-3 border-top fixed-bottom">
        <Row>
          <Col className="text-center">
            <h3>Thanks for playing!</h3>
          </Col>

          <Col className="list-group text-right col-2">
            <h6>Navigation</h6>
            <a href="/register">Register</a>
            <a href="/login">Login</a>
            <a href="/new_game">New game</a>
            <a href="/leaderboard">Leaderboards</a>
            <a href="/logout" onClick={this.logoutUser}>Logout</a>
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
