import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Form, Button, Container, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import TYPES from '../redux/types';

function Register(props) {
  const onSubmitRegister = (data) => {
    if (data.password === data.password2) {
      props.sendRegisterForm(data);
    }
  };

  return (
    <section>
      <Container>
        <Form>
          <Form.Row>
            <Form.Group as={Col} controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Username"
              />
            </Form.Group>

            <Form.Group as={Col} controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                required
                type="email"
                placeholder="Email"
              />
            </Form.Group>
          </Form.Row>

          <Form.Row>
            <Form.Group as={Col} controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                required
                type="password"
                placeholder="Password"
              />
            </Form.Group>

            <Form.Group as={Col} controlId="formPassword2">
              <Form.Label>Confirm password</Form.Label>
              <Form.Control
                required
                type="password"
                placeholder="Confirm password"
              />
            </Form.Group>
          </Form.Row>
          <Button type="submit">Log in</Button>
        </Form>
      </Container>
    </section>
  );
}

Register.propTypes = {
  sendRegisterForm: PropTypes.func.isRequired,
};

export default connect(
  null,
  (dispatch) => ({
    sendRegisterForm: (data) => {
      const registerFormRequest = () => {
        axios.post(
          'api/auth/register/',
          data,
        ).then(
          (response) => {
            dispatch({ type: TYPES.RECEIVE_AUTH_REPLY, payload: response });
          },
        );
      };
      registerFormRequest();
    },
  }),
)(Register);
