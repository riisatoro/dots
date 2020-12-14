import React from 'react';
import { connect } from 'react-redux';

import Auth from './Auth';
import GameField from './GameField';
import Settings from './Settings';
import Results from './Results';
import Leaderboard from './Leaderboard';

import '../../public/css/default.css';

function ComponentContainer(props) {
  const thisProps = props;
  return (
    <section className="ComponentContainer">
      { thisProps.store.components.auth && <Auth /> }
      { thisProps.store.components.showSettings && <Settings /> }
      { thisProps.store.components.gameField && <GameField /> }
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
