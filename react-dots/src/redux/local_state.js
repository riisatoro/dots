import TYPES from './types';

const setInitial = () => (
  {
    reply: { error: false, message: '' },
    user: {
      auth: false, userName: '', token: '', userID: null,
    },
    socket: {
      connect: false, roomId: '-1', field: [], isGameStarted: false, turn: false,
    },

    turn: 0,
    cellSize: 30,
    field_size: 10,
    game_end: false,
    gameResults: false,

    playerColor: 'Black',
    playerScore: 0,

    loops: [],
    colors: ['orange_color', 'red_color', 'blue_color', 'yellow_color', 'green_color'],
    colorTable: {
      O: 'orange_color', R: 'red_color', B: 'blue_color', Y: 'yellow_color', G: 'green_color',
    },

    leaders: [],
    gameInterrupted: false,
    gameStarted: false,
  }
);

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
