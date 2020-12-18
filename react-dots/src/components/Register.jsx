import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import TYPES from '../redux/types';

function Register(props) {
  const { register, handleSubmit, errors } = useForm();

  const onSubmitRegister = (data) => {
    if (data.password === data.password2) {
      props.sendRegisterForm(data);
    }
  };

  return (
    <section>
      <div>

        <form onSubmit={handleSubmit(onSubmitRegister)}>

          <div className="col-1" />
          <div className="form-group col-10" key="username">
            <input
              className="form-control input-space"
              type="text"
              name="username"
              placeholder="Username"
              autoComplete="off"
              ref={register({
                required: true, minLength: 5, maxLength: 20, pattern: /^[A-za-z0–9_]/,
              })}
            />
            {errors.username && <div className="alert alert-danger input-space">Max 20 characters only A-z and numbers</div>}
          </div>

          <div className="col-1" />
          <div className="form-group col-10" key="email">
            <input
              className="form-control input-space"
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="off"
              ref={register({ required: true, pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.(com)/ })}
            />
            {errors.email && <div className="alert alert-danger input-space">Invalid email</div>}
          </div>

          <div className="col-1" />
          <div className="form-group col-10" key="password">
            <input
              className="form-control input-space"
              type="password"
              name="password"
              placeholder="Password"
              ref={register({ required: true, minLength: 5, pattern: /^[a-zA-Z0-9]/ })}
            />
            {errors.password && <div className="alert alert-danger input-space">Password should be more than 5 characters and numbers</div>}
          </div>

          <div className="col-1" />
          <div className="form-group col-10" key="password2">
            <input
              className="form-control input-space"
              type="password"
              name="password2"
              placeholder="Confirm password"
              ref={register({ required: true, minLength: 5, pattern: /^[a-zA-Z0-9]/ })}
            />
            {errors.password2 && <div className="alert alert-danger input-space">Password should be more than 5 characters and numbers</div>}
          </div>

          <div className="align-center">
            <button type="submit" className="btn btn-primary">Register</button>
          </div>
        </form>

      </div>
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
