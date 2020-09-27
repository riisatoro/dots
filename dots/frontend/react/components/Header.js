import React, { Component } from 'react';
import { connect } from 'react-redux';


class Header extends Component {

	render(props) {
		console.log(this.props)
		return (
			<section className="header">
				<input type="text" />
				<button>Add track</button>

			</section>
		);
	}
}



export default connect(
	state => ({
		testStore: state
	}),
	dispatch => ({}))(Header);


/*
<div>
	{this.props.testStore.map((track, index) => <li key={index}>{track}</li>)}
</div>
*/