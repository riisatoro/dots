import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
  Form, Button, Container, Row, Toast,
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

  const { openToast, toastMessage, closeToast } = props;
  const toastWindow = (
    <Row className="mb-2">
      <Toast onClose={closeToast} show={openToast} delay={5000} autohide className="ml-auto">
        <Toast.Header>
          <strong className="mr-auto text-danger">Error!</strong>
          <small>Error</small>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </Row>
  );

  return (
    <section>
      <Container>
        {toastWindow}
      </Container>
      <Container>
        <Form onSubmit={onSubmitForm}>
        <h2>Registration</h2>
          <Form.Row>
            <Form.Group className="col-sm-12 col-md-6 " controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                autoComplete="off"
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

            <Form.Group className="col-sm-12 col-md-6" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                autoComplete="off"
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
            <Form.Group className="col-sm-12 col-md-6" controlId="password">
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

            <Form.Group className="col-sm-12 col-md-6" controlId="passwordRepeat">
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
          <Button type="submit" className="mb-5">Register</Button>
        </Form>
      </Container>
    </section>
  );
}

Register.propTypes = {
  openToast: PropTypes.bool.isRequired,
  toastMessage: PropTypes.string.isRequired,

  sendRegisterForm: PropTypes.func.isRequired,
  closeToast: PropTypes.func.isRequired,
};

Register.propTypes = {
  openToast: PropTypes.bool.isRequired,
  toastMessage: PropTypes.string.isRequired,

  sendRegisterForm: PropTypes.func.isRequired,
  closeToast: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  openToast: state.auth.error,
  toastMessage: state.auth.errorMessage,
});

export default connect(
  mapStateToProps,
  (dispatch) => ({
    closeToast: () => {
      dispatch({ type: TYPES.CLOSE_TOAST, payload: false });
    },

    sendRegisterForm: (data) => {
      const registerFormRequest = () => {
        axios.post(
          'api/auth/register/',
          data,
        ).then(
          (response) => {
            dispatch({ type: TYPES.REGISTRATION_REPLY, payload: response.data });
          },
        ).catch(
          (error) => {
            dispatch({ type: TYPES.REGISTRATION_ERROR, payload: error.response.data });
          },
        );
      };
      registerFormRequest();
    },
  }),
)(Register);
