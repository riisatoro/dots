import React from 'react';
import { connect } from 'react-redux';
import Login from './Login';
import Register from './Register';

function Auth(props) {
  const thisProps = props;
  return (
    <section>
      <div className="row">
        <div className="container-fluid col--12 width-90">
          { thisProps.store.reply.error && <div className="alert alert-danger">{ thisProps.store.reply }</div> }
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

export default connect(
  (state) => ({
    store: state,
  }),
)(Auth);
