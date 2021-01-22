import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
  Form, Button, Container, Col,
} from 'react-bootstrap';
import { connect } from 'react-redux';
import TYPES from '../redux/types';

function Register(props) {
  const {
    register, handleSubmit, errors, watch,
  } = useForm();

  const passwordWatch = useRef({});
  passwordWatch.current = watch('password', '');

  const containsSpaces = (value) => value.indexOf(' ') >= 0;

  const onSubmitForm = handleSubmit(({ username, email, password }) => {
    props.sendRegisterForm({ username, email, password });
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
                placeholder="Username"
                name="username"
                isInvalid={errors.username}
                ref={register({
                  required: true,
                  minLength: 3,
                  pattern: /^(?!\s)[a-zA-Zа-яА-Я0-9_@!#$%^]/,
                  validate: (value) => !containsSpaces(value) || 'Spaces are not allowed',
                })}
              />
              <Form.Control.Feedback type="invalid">
                Username should be 5 or more characters, numbers, or sybmpols _ @ ! # $ % ^
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email"
                name="email"
                isInvalid={errors.email}
                ref={register({
                  required: true,
                })}
              />
              <Form.Control.Feedback type="invalid">
                Invalid email
              </Form.Control.Feedback>
            </Form.Group>
          </Form.Row>

          <Form.Row>
            <Form.Group as={Col} controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                name="password"
                isInvalid={errors.password}
                ref={register({
                  required: true,
                  minLength: 5,
                  pattern: /^[a-zA-Zа-яА-Я0-9_@!#$%^]/,
                })}
              />
              <Form.Control.Feedback type="invalid">
                Password required 5 or more characters, numbers or symbols
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} controlId="passwordRepeat">
              <Form.Label>Confirm password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm password"
                name="passwordRepeat"
                isInvalid={errors.passwordRepeat}
                ref={register({
                  required: true,
                  minLength: 5,
                  pattern: /^[a-zA-Zа-яА-Я0-9_@!#$%^]/,
                  validate: (value) => value === passwordWatch.current || 'The passwords do not match',
                })}
              />
              <Form.Control.Feedback type="invalid">
                The passwords do not match
              </Form.Control.Feedback>
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
