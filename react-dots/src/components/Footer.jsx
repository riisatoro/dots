import { connect } from 'react-redux';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';

function Footer(props) {
  const { isAuthorized } = props;
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

Footer.propTypes = {
  isAuthorized: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  isAuthorized: state.auth.isAuthorized,
});

export default connect(
  mapStateToProps,
  null,
)(Footer);
