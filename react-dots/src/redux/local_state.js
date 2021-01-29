import TYPES from './types';

const setInitial = () => (
  {
    auth: {
      id: null,
      token: '',
      username: '',
      isAuthorized: false,
      error: false,
      errorMessage: '',
    },

    domainData: {
      availableGames: [],
      leaderboards: [],
    },

    gameData: {
      temporary: {
        playerColor: '#AAAAAA',
      },
      userGames: {},
    },

    appData: {
      roomLimit: 3,
    },

    uiData: {
      matchPagination: 0,
    },

    turn: 0,
    cellSize: 30,
    field_size: 10,
    game_end: false,
    gameResults: false,

    playerColor: '#AAAAAA',
    playerScore: 0,

    loops: [],

    leaders: [],
    gameInterrupted: false,
    gameStarted: false,

    components: { },
    modal: false,
    activeLeadersPage: 0,
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

export { loadState, setInitial };
