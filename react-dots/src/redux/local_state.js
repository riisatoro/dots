import TYPES from './types';

const setInitial = () => {
  const results = {
    winner: '', looser: '', win_score: 0, loose_score: 0,
  };
  const components = { auth: false, showSettings: false, gameField: false };
  const user = { auth: false, userName: '', token: '' };
  const reply = { error: false, message: '' };
  const gameResults = false;
  const playerColor = 'Black';
  const playerScore = 0;
  const leaders = [];
  const gameInterrupted = false;
  const fieldSize = 10;
  const gameStarted = false;
  const colors = ['orange_color', 'red_color', 'blue_color', 'yellow_color', 'green_color'];
  const colorTable = {
    O: 'orange_color', R: 'red_color', B: 'blue_color', Y: 'yellow_color', G: 'green_color',
  };
  const loops = [];
  const socket = {
    connect: false, roomId: '-1', field: [], isGameStarted: false, turn: false,
  };

  return {
    gameResults,
    socket,
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
    gameInterrupted,
    gameStarted,
    loops,
  };
};

const loadState = () => {
  let state = localStorage[TYPES.LOCAL_STORAGE];
  try {
    state = JSON.parse(state);
  } catch (error) {
    return setInitial();
  }
  return state;
};

export default loadState;
