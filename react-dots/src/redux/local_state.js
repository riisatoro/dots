import { LOCAL_STORAGE } from './types';
import getEmptyField from './getEmptyField';

const setInitial = () => {
  const results = {
    winner: '', looser: '', win_score: 0, loose_score: 0,
  };
  const components = { auth: false, showSettings: false, showField: false };
  const user = { auth: false, token: '' };
  const reply = { error: false, message: '' };
  const players = [{
    name: 'anon', color: 'green', index: -1, captured: 0,
  }, {
    name: 'anon', color: 'red', index: -1, captured: 0,
  }];
  const leaders = [];
  const fieldSize = 10;

  return {
    field: getEmptyField(fieldSize),
    user,
    players,
    components,
    results,
    game_end: false,
    turn: 0,
    field_size: fieldSize,
    reply,
    leaders,
  };
};

const loadState = () => {
  let state = localStorage[LOCAL_STORAGE];
  try {
    state = JSON.parse(state);
  } catch (error) {
    return setInitial();
  }
  return state;
};

export default loadState;
