import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';

import { connect } from 'react-redux';
import { RECEIVE_AUTH_REPLY } from '../redux/types';

function Login(props) {
  const { register, handleSubmit, errors } = useForm();

  const onSubmitLogin = (data) => {
    props.sendLoginForm(data);
  };

  return (
    <section>
      <div className="space-around">
        <form onSubmit={handleSubmit(onSubmitLogin)}>

          <div className="col-1" />
          <div className="form-group col-10" key="username-login">
            <input
              className="form-control input-space"
              type="text"
              name="username"
              placeholder="Username"
              autoComplete="off"
              ref={register({ required: true, maxLength: 20, pattern: /^[A-za-z0–9]/ })}
            />
            {errors.username && <div className="alert alert-danger input-space">This field required</div>}
          </div>

          <div className="col-1" />
          <div className="form-group col-10" key="password-login">
            <input
              className="form-control input-space"
              type="password"
              name="password"
              placeholder="Password"
              ref={register({ required: true, minLength: 5, pattern: /^[a-zA-Z0-9]/ })}
            />
            {errors.username && <div className="alert alert-danger input-space">This field required</div>}
          </div>

          <div className="align-center">
            <button type="submit" className="btn btn-primary">Login</button>
          </div>
        </form>
      </div>
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
            dispatch({ type: RECEIVE_AUTH_REPLY, payload: response });
          },
        ).catch(
          () => {},
        );
      };
      loginFormRequest();
    },
  }),
)(Login);
