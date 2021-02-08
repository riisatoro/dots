import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Form, Button, Container, Toast, Row,
} from 'react-bootstrap';
import TYPES from '../redux/types';

function Login(props) {
  const {
    register, handleSubmit, errors,
  } = useForm();

  const onSubmitForm = handleSubmit(({ username, password }) => {
    props.sendLoginForm({ username, password });
  });

  const { openToast, toastMessage, closeToast } = props;
  const toastWindow = (
    <Row className="mb-5" style={{ height: '30px' }}>
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
    <>
      <Container>
        {toastWindow}
      </Container>
      <Container className="h-100">
        <h2>Login</h2>
        <Form onSubmit={onSubmitForm}>
          <Form.Row>
            <Form.Group className="col-sm-12 col-md-6" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                autoComplete="off"
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

            <Form.Group className="col-sm-12 col-md-6" controlId="password">
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
          <Button type="submit" className="mb-5">Log in</Button>
        </Form>
      </Container>
    </>
  );
}

Login.propTypes = {
  openToast: PropTypes.bool.isRequired,
  toastMessage: PropTypes.string,

  sendLoginForm: PropTypes.func.isRequired,
  closeToast: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  openToast: state.auth.error,
  toastMessage: state.auth.errorMessage,
});

Login.defaultProps = {
  toastMessage: 'Server is unavailable',
};

export default connect(
  mapStateToProps,
  (dispatch) => ({
    closeToast: () => {
      dispatch({ type: TYPES.CLOSE_TOAST, payload: null });
    },

    sendLoginForm: (data) => {
      const loginFormRequest = () => {
        axios({
          method: 'post',
          url: '/api/auth/login/',
          data,
        }).then(
          (response) => {
            dispatch({ type: TYPES.LOGIN_REPLY, payload: response.data });
          },
        ).catch(
          (error) => {
            dispatch({ type: TYPES.LOGIN_ERROR, payload: error.response.data });
          },
        );
      };
      loginFormRequest();
    },
  }),
)(Login);
