import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Form, Button, Container, Row, Modal, Col,
} from 'react-bootstrap';

import '../../public/css/default.css';

function GameRoomsToJoin(props) {
  return (
    <>

    </>
  );
}

GameRoomsToJoin.propTypes = {

};

GameRoomsToJoin.defaultProps = {
};

const mapStateToProps = (state) => ({

});

export default connect(
  mapStateToProps,
  (dispatch) => ({

  }),
)(GameRoomsToJoin);

/*
 <h2>Join new room</h2>
      <Row>
        <div className="col-sm-4 mb-5">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Hi</h5>
              <div className="row">
                <p className="card-text col-6">Player color:</p>
                <div className="col-6">
                  <div className="games-color-block mb-2" />
                </div>
                <p className="card-text col-6">Click to choose your color:</p>
                <div className="col-6">
                  <Form.Control
                    type="color"
                    className="games-color-block"
                  />
                </div>
              </div>
              <Button
                type="button"
                className="btn btn-primary"
              >
                Join
              </Button>
            </div>
          </div>
        </div>
      </Row>
*/