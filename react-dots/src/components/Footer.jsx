import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

// eslint-disable-next-line react/prefer-stateless-function
class Footer extends Component {
  render() {
    return (
      <Container className="pt-4 my-md-3 pt-md-3 border-top">
        <Row>
          <Col className="text-center">
            <h3>Thanks for playing!</h3>
          </Col>

          <Col className="list-group text-right col-2">
            <h6>Navigation</h6>
            <a href="/login">Login</a>
            <a href="/new_game">New game</a>
            <a href="/leaderboard">Leaderboards</a>
            <a href="/logout">Logout</a>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default connect()(Footer);
