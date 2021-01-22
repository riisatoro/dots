import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Form, Button, Container, Col,
} from 'react-bootstrap';
import TYPES from '../redux/types';

function Login(props) {
  const {
    register, handleSubmit, errors,
  } = useForm();

  const onSubmitForm = handleSubmit(({ username, password }) => {
    props.sendLoginForm({ username, password });
  });

  return (
    <section>
      <Container>
        <Form onSubmit={onSubmitForm}>
          <Form.Row>
            <Form.Group as={Col} controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Username"
                isInvalid={errors.username}
                ref={register({
                  required: true,
                  minLength: 3,
                })}
              />
              <Form.Control.Feedback type="invalid">
                Username must be 3 or more characters
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                isInvalid={errors.password}
                ref={register({
                  required: true,
                  minLength: 5,
                })}
              />
              <Form.Control.Feedback type="invalid">
                Password should be 5 or more characters and number
              </Form.Control.Feedback>
            </Form.Group>
          </Form.Row>
          <Button type="submit">Log in</Button>
        </Form>
      </Container>
    </section>
  );
}

Login.propTypes = {
  sendLoginForm: PropTypes.func.isRequired,
};

export default connect(
  null,
  (dispatch) => ({
    sendLoginForm: (data) => {
      const loginFormRequest = () => {
        axios({
          method: 'post',
          url: '/api/auth/login/',
          data,
        }).then(
          (response) => {
            dispatch({ type: TYPES.RECEIVE_AUTH_REPLY, payload: response });
          },
        ).catch(
          () => {},
        );
      };
      loginFormRequest();
    },
  }),
)(Login);
