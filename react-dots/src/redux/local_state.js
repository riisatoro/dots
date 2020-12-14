import { LOCAL_STORAGE } from './types';

const setInitial = () => {
  const results = {
    winner: '', looser: '', win_score: 0, loose_score: 0,
  };
  const components = { auth: false, showSettings: false, showField: false };
  const user = { auth: false, token: '' };
  const reply = { error: false, message: '' };
  const playerColor = 'B';
  const playerScore = 0;
  const leaders = [];
  const fieldSize = 10;
  const colors = ['orange_color', 'red_color', 'blue_color', 'yellow_color', 'green_color'];
  const colorTable = {
    O: 'orange_color', R: 'red_color', B: 'blue_color', Y: 'yellow_color', G: 'green_color',
  };
  const socket = {
    connect: false, roomId: '-1', data: {}, isGameStarted: false, turn: false,
  };

  return {
    socket,
    field: [[]],
    user,
    playerColor,
    playerScore,
    components,
    results,
    game_end: false,
    turn: 0,
    field_size: fieldSize,
    reply,
    leaders,
    colors,
    colorTable,
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
