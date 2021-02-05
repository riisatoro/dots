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
      leaderboards: [],
    },

    gameData: {
      temporary: {
        playerColor: '#AAAAAA',
      },
      waitingGames: {},
      currentGames: {},
      awailableGames: {},
    },

    appData: {
      roomLimit: 6,
      cellSize: 30,
    },

    uiData: {
      matchPagination: 0,
      activeGameTab: 0,
      modalColorContrast: false,
      modalLimitRooms: false,
    },
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
