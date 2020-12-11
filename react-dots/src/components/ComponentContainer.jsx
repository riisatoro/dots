import React from 'react';
import { connect } from 'react-redux';

import Auth from './Auth.jsx';
import GameField from './GameField.jsx';
import Settings from './Settings.jsx';
import Results from './Results.jsx';
import Leaderboard from './Leaderboard.jsx';

import '../../public/css/default.css';

function ComponentContainer(props) {
  const thisProps = props;
  return (
    <section className="ComponentContainer">
      { thisProps.store.components.auth && <Auth /> }
      { thisProps.store.components.showSettings && <Settings /> }
      { thisProps.store.components.showField && <GameField /> }
      { thisProps.store.game_end && <Results /> }
      { thisProps.store.components.showLeaders && <Leaderboard /> }
    </section>
  );
}

export default connect(
  (state) => ({
    store: state,
  }),
)(ComponentContainer);
