import React, { Component } from 'react';
import { connect } from 'react-redux';


class App extends Component {
	render() {
		return (
			<section className="content">

			</section>
		);
	}
}

export default connect(
  state => ({
  	store: state
  }),
  dispatch => ({}))(App);