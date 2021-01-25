import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Form, Button, Container, Col, Toast, Row,
} from 'react-bootstrap';
import TYPES from '../redux/types';

function Login(props) {
  const {
    register, handleSubmit, errors,
  } = useForm();

  const onSubmitForm = handleSubmit(({ username, password }) => {
    props.sendLoginForm({ username, password });
  });

  const { toast, toastMessage, closeToast } = props;
  const toastWindow = (
    <Row className="mb-5" style={{ height: '50px' }}>
      <Toast onClose={closeToast} show={toast} delay={5000} autohide className="ml-auto">
        <Toast.Header>
          <strong className="mr-auto text-danger">Error!</strong>
          <small>Error</small>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </Row>
  );

  return (
    <Container className="h-100">
      {toastWindow}
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
  );
}

Login.propTypes = {
  sendLoginForm: PropTypes.func.isRequired,
  toast: PropTypes.bool,
  toastMessage: PropTypes.string,
  closeToast: PropTypes.func.isRequired,
};

Login.defaultProps = {
  toast: false,
  toastMessage: '',
};

const mapStateToProps = (state) => {
  const data = {
    toast: state.toast,
    toastMessage: state.toastMessage,
  };
  return data;
};

export default connect(
  mapStateToProps,
  (dispatch) => ({
    closeToast: () => {
      dispatch({ type: TYPES.SERVER_TOAST, payload: false });
    },

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
          (error) => {
            dispatch({ type: TYPES.LOGIN_ERROR, payload: error.response.data });
          },
        );
      };
      loginFormRequest();
    },
  }),
)(Login);
