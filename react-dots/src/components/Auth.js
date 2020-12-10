import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Login from './Login';
import Register from './Register';

function Auth(props) {
  const { error, reply } = props;

  return (
    <section>
      <div className="row">
        <div className="container-fluid col--12 width-90">
          { error && <div className="alert alert-danger">{reply}</div> }
        </div>

        <div className="col-6">
          <Register />
        </div>

        <div className="col-6">
          <Login />
        </div>

      </div>
    </section>
  );
}

Auth.propTypes = {
  error: PropTypes.bool,
  reply: PropTypes.string,
};

Auth.defaultProps = {
  error: false,
  reply: 'OK',
};

const mapStateToProps = (state) => {
  const data = {
    error: state.reply.error,
    reply: state.reply.message,
  };
  return data;
};

export default connect(
  mapStateToProps,
  (state) => ({
    store: state,
  }),
)(Auth);
